'use strict';

class GeoUtils {
    /**
     * Returns current client geo location.
     *
     * @returns {Promise<GeolocationPosition>}
     */
    static getCurrentPosition(){
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, (error) => {
                reject(error);
            }, {
                enableHighAccuracy: true,
                timeout: 5000
            });
        });
    }
}

export default GeoUtils;
