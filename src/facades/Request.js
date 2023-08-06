'use strict';

import RemoteServiceException from '../exceptions/RemoteServiceException';
import InvalidInputException from '../exceptions/InvalidInputException';
import Serializable from '../support/traits/Serializable';
import ExceptionMapper from '../support/ExceptionMapper';
import ErrorMessageBag from '../DTOs/ErrorMessageBag';
import Facade from './Facade';
import App from './App';

class Request extends Facade {
    static #processResponse(request){
        let exception = null, exceptionMapper = ExceptionMapper.getInstance();
        if ( typeof request.response?.status !== 'string' && request.status > 200 ){
            const exceptionMessage = 'Remote service responded with an error: ' + request.status;
            const exceptionClass = exceptionMapper.getExceptionByHTTPCode(request.status);
            if ( exceptionClass !== null ){
                exception = new exceptionClass(exceptionMessage);
            }
        }else if ( request.response?.status !== 'SUCCESS' ){
            let exceptionClass = exceptionMapper.getExceptionByStatus(request.response?.status);
            if ( exceptionClass === null ){
                exceptionClass = RemoteServiceException;
            }
            const exceptionMessage = 'Remote service returned error: ' + request.response?.status;
            exception = new exceptionClass(exceptionMessage);
            if ( exception instanceof InvalidInputException ){
                const errorMessageBag = ErrorMessageBag.makeFromHTTPResponse(request.response);
                exception.setErrorMessageBag(errorMessageBag);
            }
        }
        return exception;
    }

    static #addAuthenticationHeader(request){
        let accessToken = App.getAccessToken();
        if ( accessToken !== null ){
            accessToken = 'Bearer ' + accessToken;
            request.setRequestHeader('Authorization', accessToken);
        }
    }

    static #appendValue(formData, fieldName, value){
        if ( value instanceof File || value instanceof Blob ){
            formData.append(fieldName, value);
        }else if ( value instanceof Serializable ){
            formData.append(fieldName, value.serialize());
        }else if ( typeof value === 'object' ){
            formData.append(fieldName, JSON.stringify(value));
        }else{
            formData.append(fieldName, value);
        }
    }

    static #preparePOSTFields(data){
        const formData = new FormData();
        for ( const fieldName in data ){
            if ( typeof data[fieldName] !== 'undefined' && data[fieldName] !== null ){
                if ( Array.isArray(data[fieldName]) ){
                    data[fieldName].forEach((entry) => {
                        Request.#appendValue(formData, fieldName + '[]', entry);
                    });
                }else{
                    Request.#appendValue(formData, fieldName, data[fieldName]);
                }
            }
        }
        return formData;
    }

    static #buildRequestURL(url, query){
        if ( query !== null && typeof query === 'object' ){
            const queryParameters = [];
            for ( const fieldName in query ){
                if ( query[fieldName] !== null && typeof query[fieldName] !== 'undefined' ){
                    const value = encodeURIComponent(query[fieldName]);
                    const name = encodeURIComponent(fieldName);
                    queryParameters.push(name + '=' + value);
                }
            }
            url += ( url.indexOf('?') > 0 ? '&' : '?' ) + queryParameters.join('&');
        }
        return url;
    }

    static #makeRequest(method, url, query, data, authenticated){
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest(), formData = null;
            request.open(method, Request.#buildRequestURL(url, query), true);
            if ( authenticated === true ){
                Request.#addAuthenticationHeader(request);
            }
            if ( data !== null && typeof data === 'object' ){
                formData = Request.#preparePOSTFields(data);
            }
            request.responseType = 'json';
            request.onreadystatechange = () => {
                if ( request.readyState === XMLHttpRequest.DONE ){
                    const exception = Request.#processResponse(request);
                    if ( exception !== null ){
                        return reject(exception);
                    }
                    resolve(request.response);
                }
            };
            request.send(formData);
        });
    }

    static async get(url, query = null, authenticated = true){
        return await Request.#makeRequest('GET', url, query, null, authenticated);
    }

    static async post(url, data = null, authenticated = true){
        return await Request.#makeRequest('POST', url, null, data, authenticated);
    }

    static async patch(url, data = null, authenticated = true){
        return await Request.#makeRequest('PATCH', url, null, data, authenticated);
    }

    static async delete(url, query = null, authenticated = true){
        return await Request.#makeRequest('DELETE', url, query, null, authenticated);
    }

    static async download(url, query = null, authenticated = true){
        return new Promise((resolve) => {
            const request = new XMLHttpRequest();
            request.open('GET', Request.#buildRequestURL(url, query), true);
            if ( authenticated === true ){
                Request.#addAuthenticationHeader(request);
            }
            request.responseType = 'blob';
            request.onreadystatechange = () => {
                if ( request.readyState === XMLHttpRequest.DONE ){
                    resolve(request.response);
                }
            };
            request.send();
        });
    }
}

export default Request;
