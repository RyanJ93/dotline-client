'use strict';

import Injector from './Injector';
import Facade from './Facade';

class Event extends Facade {
    /**
     * Returns the defined event broker.
     *
     * @returns {?EventBroker}
     */
    static getBroker(){
        return Injector.inject('EventBroker');
    }
}

export default Event;
