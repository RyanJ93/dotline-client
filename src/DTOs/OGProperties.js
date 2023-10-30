'use strict';

/**
 * @typedef OGPropertiesParameters
 *
 * @property {?string} [description]
 * @property {?string} [locale]
 * @property {?string} [image]
 * @property {?string} [title]
 * @property {?string} [type]
 * @property {?string} [url]
 */

class OGProperties {
    /**
     * @type {?string}
     */
    #description;

    /**
     * @type {?string}
     */
    #locale;

    /**
     * @type {?string}
     */
    #image;

    /**
     * @type {?string}
     */
    #title;

    /**
     * @type {?string}
     */
    #type;

    /**
     * @type {?string}
     */
    #url;

    /**
     * The class constructor.
     *
     * @param {OGPropertiesParameters} properties
     */
    constructor(properties){
        this.#description = properties.description ?? null;
        this.#locale = properties.locale ?? null;
        this.#image = properties.image ?? null;
        this.#title = properties.title ?? null;
        this.#type = properties.type ?? null;
        this.#url = properties.url ?? null;
    }

    /**
     * Returns Open Graph description.
     *
     * @returns {?string}
     */
    getDescription(){
        return this.#description;
    }

    /**
     * Returns Open Graph locale.
     *
     * @returns {?string}
     */
    getLocale(){
        return this.#locale;
    }

    /**
     * Returns Open Graph image URL.
     *
     * @returns {?string}
     */
    getImage(){
        return this.#image;
    }

    /**
     * Returns Open Graph title.
     *
     * @returns {?string}
     */
    getTitle(){
        return this.#title;
    }

    /**
     * Returns Open Graph type.
     *
     * @returns {?string}
     */
    getType(){
        return this.#type;
    }

    /**
     * Returns Open Graph URL.
     *
     * @returns {?string}
     */
    getURL(){
        return this.#url;
    }
}

export default OGProperties;
