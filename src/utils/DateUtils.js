'use strict';

class DateUtils {
    static getPassedTime(date){
        const difference = ( (+new Date()) - date.getTime() ) / 1000;
        if ( difference < 60 ){

        }



        // TODO
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    static getPassedDate(date){
        const difference = ( (+new Date()) - date.getTime() ) / 1000;
        if ( difference < 86400 ){
            return 'Today';
        }
        if ( difference < 172800 ){
            return 'Yesterday';
        }
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    static getDateTimestamp(date){
        const outputDate = new Date(date.getTime());
        outputDate.setMilliseconds(0);
        outputDate.setSeconds(0);
        outputDate.setMinutes(0);
        outputDate.setHours(0);
        return outputDate.getTime();
    }
}

export default DateUtils;
