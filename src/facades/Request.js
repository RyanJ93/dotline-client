'use strict';

import RemoteServiceException from '../exceptions/RemoteServiceException';
import InvalidInputException from '../exceptions/InvalidInputException';
import ExceptionMapper from '../support/ExceptionMapper';
import ErrorMessageBag from '../DTOs/ErrorMessageBag';
import Facade from './Facade';

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

    static post(url, data){
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest(), formData = new FormData();
            request.open('POST', url);
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
