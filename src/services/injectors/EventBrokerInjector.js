'use strict';

import EventBroker from '../../support/EventBroker';
import Injector from './Injector';

class EventBrokerInjector extends Injector {
    #eventBroker = null;

    /**
     *
     *
     * @returns {EventBroker}
     */
    inject(){
        if ( this.#eventBroker === null ){
            this.#eventBroker = new EventBroker();
        }
        return this.#eventBroker;
    }
}

export default EventBrokerInjector;
