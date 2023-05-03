'use strict';

import Service from './Service';

class NotificationService extends Service {
    async initialize(){
        if ( 'Notification' in window && Notification.permission !== 'denied' ){
            await Notification.requestPermission();
        }
    }

    sendNotification(title, text){
        if ( 'Notification' in window && Notification.permission === 'granted' ){
            new Notification(title, { body: text });
        }
    }
}

export default NotificationService;
