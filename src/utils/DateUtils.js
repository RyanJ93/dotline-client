'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import i18n from 'i18next';

class DateUtils {
    static getPassedTime(date){
        const difference = ( (+new Date()) - date.getTime() ) / 1000;
        if ( difference < 60 ){

        }
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            day: 'numeric',
            month: 'long'
        });
    }

    static getPassedDate(date){
        const difference = ( (+new Date()) - date.getTime() ) / 1000;
        if ( difference < 86400 ){
            return i18n.t('dateUtils.today');
        }
        if ( difference < 172800 ){
            return i18n.t('dateUtils.yesterday');
        }
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            day: 'numeric',
            month: 'long'
        });
    }

    /**
     * Returns a localized string representation of a given date.
     *
     * @param {Date} date
     * @param {boolean} [includeTime=true]
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    static getLocalizedDateTime(date, includeTime = true){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        let localizedString = date.toLocaleDateString();
        if ( includeTime !== false ){
            localizedString += ' - ' + date.toLocaleTimeString();
        }
        return localizedString;
    }

    /**
     * Returns the timestamp associated with the date component of a given date object.
     *
     * @param {Date} date
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    static getDateTimestamp(date){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        const outputDate = new Date(date.getTime());
        outputDate.setMilliseconds(0);
        outputDate.setSeconds(0);
        outputDate.setMinutes(0);
        outputDate.setHours(0);
        return outputDate.getTime();
    }

    /**
     * Checks if the given argument is a valid date or not.
     *
     * @param {any} date
     *
     * @returns {boolean}
     */
    static isDate(date){
        return date instanceof Date && !isNaN(date.getTime());
    }
}

export default DateUtils;
