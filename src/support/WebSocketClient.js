'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import UserService from '../services/UserService';
import Injectable from './Injectable';
import App from '../facades/App';

/**
 * @callback WSMessageListener
 *
 * @param {Object.<string, any>} message
 */

class WebSocketClient extends Injectable {
    /**
     * @type {Object.<string, WSMessageListener>}
     */
    #openRequests = Object.create(null);

    /**
     * @type {boolean}
     */
    #isClientClosed = false;

    /**
     * @type {boolean}
     */
    #isClientReady = false;

    /**
     * @type {WSMessageListener[]}
     */
    #listenerList = [];

    /**
     * @type {?WebSocket}
     */
    #webSocket = null;

    /**
     * Handles received messages.
     *
     * @param {MessageEvent} event
     *
     * @returns {Promise<void>}
     */
    async #handleMessageReceived(event){
        const message = JSON.parse(event.data);
        if ( typeof this.#openRequests[message.transactionID] === 'function' ){
            await this.#openRequests[message.transactionID](message);
            delete this.#openRequests[message.transactionID];
        }
        this.#listenerList.forEach((listener) => listener(message));
    }

    /**
     * Handles connection close event.
     *
     * @param {CloseEvent} event
     *
     * @returns {Promise<void>}
     */
    async #handleConnectionClose(event){
        this.#isClientReady = false;
        if ( this.#isClientClosed !== true ){
            if ( event.reason === 'ERR_UNAUTHORIZED' ){
                return await new UserService().logout();
            }else{
                console.log('Connection to WebSocket lost, reconnecting in a second...');
                window.setTimeout(() => this.connect(), 1000);
            }
        }
    }

    /**
     * Handles connection open event.
     *
     * @returns {Promise<void>}
     */
    async #handleConnectionOpen(){
        await this.#authenticate();
        this.#isClientReady = true;
    }

    /**
     * Sends a given message to the WebSocket server.
     *
     * @param {Object.<string, any>} message
     *
     * @returns {Promise<Object.<string, any>>}
     */
    async #sendMessage(message){
        if ( this.#webSocket?.readyState !== WebSocket.OPEN ){
            await this.waitForConnectionReady();
        }
        return await new Promise((resolve) => {
            message.transactionID = crypto.randomUUID();
            this.#openRequests[message.transactionID] = (response) => resolve(response);
            this.#webSocket.send(JSON.stringify(message));
        });
    }

    /**
     * Performs user authentication over the WebSocket connection opened.
     *
     * @returns {Promise<void>}
     */
    async #authenticate(){
        const response = await this.#sendMessage({
            payload: { accessToken: App.getAccessToken() },
            action: 'authenticate'
        });
        if ( response?.status === 'ERR_NOT_FOUND' || response?.status === 'ERR_UNAUTHORIZED' ){
            return await new UserService().logout();
        }
        if ( response?.status !== 'SUCCESS' ){
            this.connect();
        }
    }

    /**
     * Disconnects the WebSocket server.
     *
     * @returns {WebSocketClient}
     */
    disconnect(){
        if ( this.#webSocket !== null ){
            this.#openRequests = Object.create(null);
            this.#isClientClosed = true;
            this.#isClientReady = false;
            this.#webSocket.close();
            this.#webSocket = null;
        }
        return this;
    }

    /**
     * Connects the WebSocket server.
     *
     * @returns {WebSocketClient}
     */
    connect(){
        this.#webSocket = new WebSocket('wss://' + location.hostname + '/ws');
        this.#webSocket.addEventListener('message', this.#handleMessageReceived.bind(this));
        this.#webSocket.addEventListener('close', this.#handleConnectionClose.bind(this));
        this.#webSocket.addEventListener('open', this.#handleConnectionOpen.bind(this));
        this.#isClientClosed = false;
        return this;
    }

    /**
     * Adds a message listener callback function.
     *
     * @param {WSMessageListener} listener
     *
     * @returns {WebSocketClient}
     *
     * @throws {IllegalArgumentException} If an invalid listener callback function is given.
     */
    listen(listener){
        if ( typeof listener !== 'function' ){
            throw new IllegalArgumentException('Invalid listener function.');
        }
        this.#listenerList.push(listener);
        return this;
    }

    /**
     * Waits until the client is connected to the WebSocket server.
     *
     * @returns {Promise<unknown>}
     */
    waitForConnectionReady(){
        return new Promise((resolve) => {
            const intervalID = window.setInterval(() => {
                const isConnectionOpen = this.#webSocket?.readyState === WebSocket.OPEN;
                if ( this.#isClientReady === true && isConnectionOpen ){
                    window.clearInterval(intervalID);
                    resolve();
                }
            }, 1000);
        });
    }

    /**
     * Sends a message to the WebSocket server.
     *
     * @param {Object.<string, any>} message
     *
     * @returns {Promise<?Object.<string, any>>}
     */
    async send(message){
        if ( this.#isClientClosed !== true ){
            if ( !this.#isClientReady ){
                await this.waitForConnectionReady();
            }
            return await this.#sendMessage(message);
        }
        return null;
    }
}

export default WebSocketClient;
