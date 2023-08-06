'use strict';

import ServiceNotAvailableException from '../exceptions/ServiceNotAvailableException';
import DuplicatedUsernameException from '../exceptions/DuplicatedUsernameException';
import UnauthorizedException from '../exceptions/UnauthorizedException';
import InvalidInputException from '../exceptions/InvalidInputException';
import NotFoundException from '../exceptions/NotFoundException';
import ExceptionMapper from '../support/ExceptionMapper';
import ErrorCode from '../enum/ErrorCode';
import Provider from './Provider';

class ExceptionMappingProvider extends Provider {
    async run(){
        const exceptionMapper = ExceptionMapper.getInstance();
        exceptionMapper.registerExceptionByStatus(ErrorCode.ERR_DUPLICATED_USERNAME, DuplicatedUsernameException);
        exceptionMapper.registerExceptionByStatus(ErrorCode.ERR_UNAUTHORIZED, UnauthorizedException);
        exceptionMapper.registerExceptionByStatus(ErrorCode.ERR_INVALID_FORM, InvalidInputException);
        exceptionMapper.registerExceptionByStatus(ErrorCode.ERR_NOT_FOUND, NotFoundException);
        exceptionMapper.registerExceptionByHTTPCode(502, ServiceNotAvailableException);
    }
}

export default ExceptionMappingProvider;
