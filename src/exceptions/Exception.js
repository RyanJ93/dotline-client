'use strict';

import i18n from 'i18next';

class Exception extends Error {
    #localizedMessage = null;

    constructor(message, code = 0, exception = null){
        super(message);

        if ( exception instanceof Error ){
            const lines = ( this.message.match(/\n/g)||[] ).length + 1;
            this.stack = this.stack.split('\n').slice(0, lines + 1).join('\n') + '\n' + exception.stack;
        }
    }

    getDefaultLocalizedMessage(){
        return i18n.t('exception.message');
    }

    setLocalizedMessage(localizedMessage){
        this.#localizedMessage = localizedMessage;
        return this;
    }

    getLocalizedMessage(){
        return this.#localizedMessage ?? this.getDefaultLocalizedMessage();
    }
}

export default Exception;
