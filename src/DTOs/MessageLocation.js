'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

/**
 * @typedef MessageLocationProperties
 *
 * @property {number} longitude
 * @property {number} latitude
 * @property {number} altitude
 * @property {number} accuracy
 * @property {?number} speed
 */

class MessageLocation {
    /**
     * Generates an instance of this class based on the given position.
     *
     * @param {GeolocationPosition} geolocationPosition
     *
     * @returns {MessageLocation}
     *
     * @throws {IllegalArgumentException} If an invalid position instance is given.
     */
    static makeFromGeolocationPosition(geolocationPosition){
        if ( !( geolocationPosition instanceof GeolocationPosition ) ){
            throw new IllegalArgumentException('Invalid position.');
        }
        return new MessageLocation({
            longitude: geolocationPosition.coords.longitude,
            latitude: geolocationPosition.coords.latitude,
            altitude: geolocationPosition.coords.altitude,
            accuracy: geolocationPosition.coords.accuracy,
            speed: geolocationPosition.coords.speed
        });
    }

    /**
     * Generates an instance of this class based on the given JSON serialized location.
     *
     * @param {string} serializedLocation
     *
     * @returns {MessageLocation}
     *
     * @throws {IllegalArgumentException} If an invalid serialized location is given.
     */
    static makeFromSerializedLocation(serializedLocation){
        if ( serializedLocation === '' || typeof serializedLocation !== 'string' ){
            throw new IllegalArgumentException('Invalid serialized location.');
        }
        return new MessageLocation(JSON.parse(serializedLocation));
    }

    /**
     * @type {number}
     */
    #longitude;

    /**
     * @type {number}
     */
    #latitude;

    /**
     * @type {number}
     */
    #altitude;

    /**
     * @type {number}
     */
    #accuracy;

    /**
     * @type {?number}
     */
    #speed;

    /**
     * The class constructor.
     *
     * @param {MessageLocationProperties} properties
     */
    constructor(properties){
        this.#longitude = properties.longitude;
        this.#latitude = properties.latitude;
        this.#altitude = properties.altitude;
        this.#accuracy = properties.accuracy;
        this.#speed = properties.speed;
    }

    /**
     * Returns the longitude.
     *
     * @returns {number}
     */
    getLongitude(){
        return this.#longitude;
    }

    /**
     * Returns the latitude.
     *
     * @returns {number}
     */
    getLatitude(){
        return this.#latitude;
    }

    /**
     * Returns the altitude.
     *
     * @returns {number}
     */
    getAltitude(){
        return this.#altitude;
    }

    /**
     * Returns the accuracy.
     *
     * @returns {number}
     */
    getAccuracy(){
        return this.#accuracy;
    }

    /**
     * Returns the speed.
     *
     * @returns {?number}
     */
    getSpeed(){
        return this.#speed;
    }

    /**
     * Generates a URL used to display an embedded Open Street Map.
     *
     * @returns {string}
     */
    getComputedOSMIframeURL(){
        const region = [this.#longitude - 1, this.#latitude - 1, this.#longitude + 1, this.#latitude + 1].join('%2C');
        let url = 'https://www.openstreetmap.org/export/embed.html?bbox=' + region + '&amp;layer=mapnik&amp;zoom=12';
        return url + '&amp;marker=' + [this.#latitude, this.#longitude].join('%2C');
    }

    /**
     * Returns a JSON serialized representation of this class.
     *
     * @returns {string}
     */
    toSerializedLocation(){
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {MessageLocationProperties}
     */
    toJSON(){
        return {
            longitude: this.#longitude,
            latitude: this.#latitude,
            altitude: this.#altitude,
            accuracy: this.#accuracy,
            speed: this.#speed
        };
    }
}

export default MessageLocation;
