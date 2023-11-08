'use strict';

import MessageSyncManager from './MessageSyncManager';

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
    #needsToBeSynchronized = false;

    /**
     * @type {boolean}
     */
    #initialized = false;

    /**
     * Sets up event listeners.
     */
    #setupEventListener(){
        window.addEventListener('visibilitychange', () => {
            if ( document.visibilityState === 'hidden' && !this.#needsToBeSynchronized  ){
                this.#needsToBeSynchronized = true;
            }else if ( document.visibilityState === 'visible' && this.#needsToBeSynchronized ){
                MessageSyncManager.getInstance().initMessageSync();
                this.#needsToBeSynchronized = false;
            }
        });
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
