'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Service from './Service';

class NotificationService extends Service {
    /**
     * Initializes notification service.
     *
     * @returns {Promise<void>}
     */
    async initialize(){
        if ( 'Notification' in window && Notification.permission !== 'denied' ){
            await Notification.requestPermission();
        }
    }

    /**
     * Sends a notification.
     *
     * @param {string} title
     * @param {string} text
     *
     * @returns {NotificationService}
     *
     * @throws {IllegalArgumentException} If an invalid title is given.
     * @throws {IllegalArgumentException} If an invalid text is given.
     */
    sendNotification(title, text){
        if ( title === '' || typeof title !== 'string' ){
            throw new IllegalArgumentException('Invalid title.');
        }
        if ( text === '' || typeof text !== 'string' ){
            throw new IllegalArgumentException('Invalid text.');
        }
        if ( 'Notification' in window && Notification.permission === 'granted' ){
            new Notification(title, { body: text });
        }
        return this;
    }
}

export default NotificationService;
