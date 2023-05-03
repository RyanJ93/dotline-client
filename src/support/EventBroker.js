'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Injector from '../facades/Injector';

class EventBroker {
    #listeners = Object.create(null);
    #webSocketClient;

    #handleWebSocketMessage(message){
        if ( message?.action === 'event' ){
            const eventName= 'ext:' + message.payload.name;
            this.emit(eventName, ...message.payload.data);
        }
    }

    constructor(){
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.#webSocketClient.listen(this.#handleWebSocketMessage.bind(this));
    }

    on(eventName, handler, once = false){
        if ( eventName === '' || typeof eventName !== 'string' ){
            throw new IllegalArgumentException('Invalid event name.');
        }
        if ( typeof handler !== 'function' ){
            throw new IllegalArgumentException('Invalid handler function.');
        }
        if ( !( this.#listeners[eventName] instanceof Map ) ){
            this.#listeners[eventName] = new Map();
        }
        this.#listeners[eventName].set(handler, {
            once: false
        });
        return this;
    }

    off(eventName, handler){
        if ( eventName === '' || typeof eventName !== 'string' ){
            throw new IllegalArgumentException('Invalid event name.');
        }
        if ( typeof handler !== 'function' ){
            throw new IllegalArgumentException('Invalid handler function.');
        }
        if ( this.#listeners[eventName] instanceof Map ){
            this.#listeners[eventName].delete(handler);
        }
        return this;
    }

    once(eventName, handler){
        return this.on(eventName, handler, true);
    }

    emit(eventName, ...args){
        if ( eventName === '' || typeof eventName !== 'string' ){
            throw new IllegalArgumentException('Invalid event name.');
        }
        if ( this.#listeners[eventName] instanceof Map ){
            for ( const [handler, props] of this.#listeners[eventName] ){
                handler(...args);
                if ( props.once === true ){
                    this.off(eventName, handler);
                }
            }
        }
        return this;
    }
}

export default EventBroker;
