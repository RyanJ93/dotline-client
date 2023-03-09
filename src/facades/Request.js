'use strict';

import RemoteServiceException from '../exceptions/RemoteServiceException';
import InvalidInputException from '../exceptions/InvalidInputException';
import ExceptionMapper from '../support/ExceptionMapper';
import ErrorMessageBag from '../DTOs/ErrorMessageBag';
import Facade from './Facade';
import App from './App';

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

    static get(url, query = null, authenticated = true){
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            if ( query !== null && typeof query === 'object' ){
                const queryParameters = [];
                for ( const fieldName in query ){
                    const value = encodeURIComponent(query[fieldName]);
                    const name = encodeURIComponent(fieldName);
                    queryParameters.push(name + '=' + value);
                }
                url += ( url.indexOf('?') > 0 ? '&' : '?' ) + queryParameters.join('&');
            }
            request.open('GET', url);
            if ( authenticated === true ){
                Request.#addAuthenticationHeader(request);
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
            request.send();
        });
    }

    static post(url, data, authenticated = true){
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest(), formData = new FormData();
            request.open('POST', url);
            if ( authenticated === true ){
                Request.#addAuthenticationHeader(request);
            }
            request.responseType = 'json';
            for ( const fieldName in data ){
                formData.append(fieldName, data[fieldName]);
            }
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
}

export default Request;
