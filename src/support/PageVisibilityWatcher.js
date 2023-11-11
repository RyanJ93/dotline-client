'use strict';

import Injector from '../facades/Injector';

class PageVisibilityWatcher {
    /**
     * @type {?PageVisibilityWatcher}
     */
    static #instance = null;

    /**
     * Returns an instance of this class as a singleton.
     *
     * @returns {?PageVisibilityWatcher}
     */
    static getInstance(){
        if ( PageVisibilityWatcher.#instance === null ){
            PageVisibilityWatcher.#instance = new PageVisibilityWatcher();
        }
        return PageVisibilityWatcher.#instance;
    }

    /**
     * @type {boolean}
     */
    #initialized = false;

    /**
     * @type {WebSocketClient}
     */
    #webSocketClient;

    /**
     * Sets up event listeners.
     */
    #setupEventListener(){
        window.addEventListener('visibilitychange', () => {
            if ( document.visibilityState === 'visible' && !this.#webSocketClient.isClientReady() ){
                console.log('Forcing WebSocket reconnection...');
                this.#webSocketClient.connect(true);
            }
        });
    }

    /**
     * The class constructor.
     */
    constructor(){
        this.#webSocketClient = Injector.inject('WebSocketClient');
    }

    /**
     * Initialize the watcher.
     *
     * @returns {PageVisibilityWatcher}
     */
    initialize(){
        const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
        if ( !this.#initialized && isMobileDevice ){
            this.#setupEventListener();
        }
        return this;
    }
}

export default PageVisibilityWatcher;
