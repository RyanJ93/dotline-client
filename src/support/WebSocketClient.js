'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Injectable from './Injectable';
import App from '../facades/App';

class WebSocketClient extends Injectable {
    #openRequests = Object.create(null);
    #isClientReady = false;
    #listenerList = [];
    #webSocket;

    async #handleMessageReceived(event){
        const message = JSON.parse(event.data);
        if ( typeof this.#openRequests[message.transactionID] === 'function' ){
            await this.#openRequests[message.transactionID](message);
            delete this.#openRequests[message.transactionID];
        }
        this.#listenerList.forEach((listener) => listener(message));
    }

    async #handleConnectionClose(event){
        this.#isClientReady = false;
        if ( event.reason === '' ){
            console.log('Connection to WebSocket lost, reconnecting in a second...');
            window.setTimeout(() => this.connect(), 1000);
        }
    }

    async #handleConnectionOpen(){
        await this.#authenticate();
        this.#isClientReady = true;
    }

    #sendMessage(message){
        return new Promise((resolve, reject) => {
            message.transactionID = crypto.randomUUID();
            this.#openRequests[message.transactionID] = (response) => resolve(response);
            this.#webSocket.send(JSON.stringify(message));
        });
    }

    async #authenticate(){
        const response = await this.#sendMessage({
            payload: { accessToken: App.getAccessToken() },
            action: 'authenticate'
        });
        if ( response?.status === 'ERR_NOT_FOUND' || response?.status === 'ERR_UNAUTHORIZED' ){
            //logout
        }
        if ( response?.status !== 'SUCCESS' ){
            return this.connect();
        }
    }

    connect(){
        this.#webSocket = new WebSocket('wss://' + location.hostname + '/ws');
        this.#webSocket.addEventListener('message', this.#handleMessageReceived.bind(this));
        this.#webSocket.addEventListener('close', this.#handleConnectionClose.bind(this));
        this.#webSocket.addEventListener('open', this.#handleConnectionOpen.bind(this));
        return this;
    }

    listen(listener){
        if ( typeof listener !== 'function' ){
            throw new IllegalArgumentException('Invalid listener function.');
        }
        this.#listenerList.push(listener);
        return this;
    }

    waitForConnectionReady(){
        return new Promise((resolve) => {
            const intervalID = window.setInterval(() => {
                if ( this.#isClientReady === true ){
                    window.clearInterval(intervalID);
                }
            }, 1000);
        });
    }

    async send(message){
        if ( !this.#isClientReady ){
            await this.waitForConnectionReady();
        }
        return await this.#sendMessage(message);
    }
}

export default WebSocketClient;
