'use strict';

import RemoteServiceException from '../exceptions/RemoteServiceException';
import InvalidInputException from '../exceptions/InvalidInputException';
import ExceptionMapper from '../support/ExceptionMapper';
import ErrorMessageBag from '../DTOs/ErrorMessageBag';
import Facade from './Facade';
import App from './App';
import Serializable from '../support/traits/Serializable';

class Request extends Facade {
    static #processResponse(response){
        let exception = null;
        if ( response?.status !== 'SUCCESS' ){
            let exceptionClass = ExceptionMapper.getInstance().getExceptionByStatus(response?.status);
            if ( exceptionClass === null ){
                exceptionClass = RemoteServiceException;
            }
            const exceptionMessage = 'Remote service returned error: ' + response?.status;
            exception = new exceptionClass(exceptionMessage);
            if ( exception instanceof InvalidInputException ){
                const errorMessageBag = ErrorMessageBag.makeFromHTTPResponse(response);
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

    static #preparePOSTFields(data){
        const formData = new FormData();
        for ( const fieldName in data ){
            if ( typeof data[fieldName] !== 'undefined' && data[fieldName] !== null ){
                if ( Array.isArray(data[fieldName]) ){
                    data[fieldName].forEach((entry) => {
                        if ( entry instanceof Serializable ){
                            formData.append(fieldName + '[]', entry.serialize());
                        }else if ( typeof entry === 'object' ){
                            formData.append(fieldName + '[]', JSON.stringify(entry));
                        }else{
                            formData.append(fieldName + '[]', entry);
                        }
                    });
                }else if ( data[fieldName] instanceof Serializable ){
                    formData.append(fieldName, data[fieldName].serialize());
                }else if ( typeof data[fieldName] === 'object' ){
                    formData.append(fieldName, JSON.stringify(data[fieldName]));
                }else{
                    formData.append(fieldName, data[fieldName]);
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
                    const exception = Request.#processResponse(request.response);
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

    static async post(url, data, authenticated = true){
        return await Request.#makeRequest('POST', url, null, data, authenticated);
    }

    static async patch(url, data, authenticated = true){
        return await Request.#makeRequest('PATCH', url, null, data, authenticated);
    }

    static async delete(url, query = null, authenticated = true){
        return await Request.#makeRequest('DELETE', url, query, null, authenticated);
    }
}

export default Request;
