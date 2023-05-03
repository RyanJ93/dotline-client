'use strict';

import Injector from './Injector';
import Facade from './Facade';

class Event extends Facade {
    static getBroker(){
        return Injector.inject('EventBroker');
    }
}

export default Event;
