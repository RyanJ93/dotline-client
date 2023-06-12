'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Facade from './Facade';
import ymaps from 'ymaps';

class Maps extends Facade {
    /**
     * @type {Maps}
     */
    static #maps;

    /**
     * Initializes Yandex maps SDK.
     *
     * @returns {Promise<void>}
     */
    static async init(){
        const url = Maps.SDK_URL + '?lang=en_RU&apikey=' + YANDEX_MAPS_KEY;
        Maps.#maps = await ymaps.load(url);
    }

    /**
     * Generates a new map.
     *
     * @param {HTMLElement} element
     * @param {number[]} coords
     * @param {number} [zoom=15]
     * @param {boolean} [withPlaceMark=false]
     *
     * @returns {Map}
     *
     * @throws {IllegalArgumentException} If an invalid couple of coordinates is given.
     * @throws {IllegalArgumentException} If an invalid container element is given.
     * @throws {IllegalArgumentException} If an invalid zoom value is given.
     */
    static generate(element, coords, zoom = 15, withPlaceMark = false){
        if ( !( element instanceof HTMLElement ) ){
            throw new IllegalArgumentException('Invalid container element.');
        }
        if ( !Array.isArray(coords) || coords.length !== 2 ){
            throw new IllegalArgumentException('Invalid coordinates.');
        }
        if ( zoom === null || isNaN(zoom) || zoom <= 0 ){
            throw new IllegalArgumentException('Invalid zoom.');
        }
        const map = new Maps.#maps.Map(element, { center: coords, zoom: zoom });
        if ( withPlaceMark === true ){
            const placeMark = new Maps.#maps.Placemark(map.getCenter());
            map.geoObjects.add(placeMark);
        }
        return map;
    }
}

/**
 * @constant {string}
 */
Object.defineProperty(Maps, 'SDK_URL', {
    value: 'https://api-maps.yandex.ru/2.1.79/',
    writable: false
});

export default Maps;
