'use strict';

class ExceptionMapper {
    static #instance = null;

    static getInstance(){
        if ( ExceptionMapper.#instance === null ){
            ExceptionMapper.#instance = new ExceptionMapper();
        }
        return ExceptionMapper.#instance;
    }
    #exceptionMapping = Object.create(null);

    registerException(status, exception){
        this.#exceptionMapping[status] = exception;
        return this;
    }

    getExceptionByStatus(status){
        return this.#exceptionMapping[status] ?? null;
    }
}

export default ExceptionMapper;
