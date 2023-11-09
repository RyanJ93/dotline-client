'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import OGProperties from '../DTOs/OGProperties';
import APIEndpoints from '../enum/APIEndpoints';
import Request from '../facades/Request';
import Service from './Service';

class LinkService extends Service {
    /**
     * Fetches Open Graph properties for a given link.
     *
     * @param {string} url
     *
     * @returns {Promise<OGProperties|null>}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    async fetchLinkOGProperties(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid URL.');
        }
        const response = await Request.get(APIEndpoints.FETCH_LINK_OG_PROPERTIES + '?url=' + encodeURIComponent(url));
        if ( typeof response?.OGProperties === 'object' && response?.OGProperties !== null ){
            return new OGProperties(response?.OGProperties);
        }
        return null;
    }
}

export default LinkService;
