'use strict';

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
        exceptionMapper.registerException(ErrorCode.ERR_DUPLICATED_USERNAME, DuplicatedUsernameException);
        exceptionMapper.registerException(ErrorCode.ERR_UNAUTHORIZED, UnauthorizedException);
        exceptionMapper.registerException(ErrorCode.ERR_INVALID_FORM, InvalidInputException);
        exceptionMapper.registerException(ErrorCode.ERR_NOT_FOUND, NotFoundException);
    }
}

export default ExceptionMappingProvider;
