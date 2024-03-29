'use strict';

/**
 * @typedef GeoLocationProperties
 *
 * @property {string} longitude
 * @property {string} latitude
 * @property {string} text
 */

class GeoLocation {
    /**
     * @type {string}
     */
    #longitude;

    /**
     * @type {string}
     */
    #latitude;

    /**
     * @type {string}
     */
    #text;

    /**
     * The class constructor.
     *
     * @param {GeoLocationProperties} properties
     */
    constructor(properties){
        this.#longitude = properties.longitude;
        this.#latitude = properties.latitude;
        this.#text = properties.text;
    }

    /**
     * Returns the position's longitude.
     *
     * @returns {string}
     */
    getLongitude(){
        return this.#longitude;
    }

    /**
     * Returns the position's latitude.
     *
     * @returns {string}
     */
    getLatitude(){
        return this.#latitude;
    }

    /**
     * Returns the position text description.
     *
     * @returns {string}
     */
    getText(){
        return this.#text;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {GeoLocationProperties}
     */
    toJSON(){
        return {
            longitude: this.#longitude,
            latitude: this.#latitude,
            text: this.#text
        };
    }
}

export default GeoLocation;
