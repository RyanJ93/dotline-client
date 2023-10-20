'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Injector from '../facades/Injector';

/**
 * @callback eventHandlerCallback
 */

/**
 * @typedef EventHandlerProperties
 *
 * @property {boolean} [once=false]
 */

class EventBroker {
    /**
     * @type {Object.<string, Map<eventHandlerCallback, EventHandlerProperties>>}
     */
    #listeners = Object.create(null);

    /**
     * @type {WebSocketClient}
     */
    #webSocketClient;

    /**
     * Handles a received WebSocket message.
     *
     * @param {Object} message
     */
    #handleWebSocketMessage(message){
        if ( message?.action === 'event' ){
            const eventName= 'ext:' + message.payload.name;
            this.emit(eventName, ...message.payload.data);
        }
    }

    /**
     * The class constructor.
     */
    constructor(){
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.#webSocketClient.listen(this.#handleWebSocketMessage.bind(this));
    }

    /**
     * Registers a new event listener.
     *
     * @param {string} eventName
     * @param {eventHandlerCallback} handler
     * @param {boolean} [once=false]
     *
     * @returns {EventBroker}
     *
     * @throws {IllegalArgumentException} If an invalid handler function is given.
     * @throws {IllegalArgumentException} If an invalid event name is given.
     */
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
        this.#listeners[eventName].set(handler, { once: once });
        return this;
    }

    /**
     * Removes a given event listener.
     *
     * @param {string} eventName
     * @param {eventHandlerCallback} handler
     *
     * @returns {EventBroker}
     *
     * @throws {IllegalArgumentException} If an invalid handler function is given.
     * @throws {IllegalArgumentException} If an invalid event name is given.
     */
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

    /**
     * Registers a new event listener that should be executed once.
     *
     * @param {string} eventName
     * @param {eventHandlerCallback} handler
     *
     * @returns {EventBroker}
     *
     * @throws {IllegalArgumentException} If an invalid handler function is given.
     * @throws {IllegalArgumentException} If an invalid event name is given.
     */
    once(eventName, handler){
        return this.on(eventName, handler, true);
    }

    /**
     * Emits a given event.
     *
     * @param {string} eventName
     * @param {...any} args
     *
     * @returns {EventBroker}
     *
     * @throws {IllegalArgumentException} If an invalid event name is given.
     */
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
