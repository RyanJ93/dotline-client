'use strict';

class Exception extends Error {
    constructor(message, code = 0, exception = null){
        super(message);

        if ( exception instanceof Error ){
            const lines = ( this.message.match(/\n/g)||[] ).length + 1;
            this.stack = this.stack.split('\n').slice(0, lines + 1).join('\n') + '\n' + exception.stack;
        }
    }
}

export default Exception;
