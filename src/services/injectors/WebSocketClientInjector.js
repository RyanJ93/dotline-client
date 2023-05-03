'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException';
import WebSocketClient from '../../support/WebSocketClient';
import Injector from './Injector';

class WebSocketClientInjector extends Injector {
    #webSocketClient;

    #setWebSocketClient(webSocketClient){
        if ( !( webSocketClient instanceof WebSocketClient ) ){
            throw new IllegalArgumentException('Invalid web socket client instance.');
        }
        this.#webSocketClient = webSocketClient;
    }

    constructor(webSocketClient){
        super();

        this.#setWebSocketClient(webSocketClient);
    }

    inject(){
        return this.#webSocketClient;
    }
}

export default WebSocketClientInjector;
