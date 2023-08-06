'use strict';

import APIEndpoints from '../enum/APIEndpoints';
import ServerParams from '../DTOs/ServerParams';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Service from './Service';

class ServerInfoService extends Service {
    /**
     * @type {ServerParamsRepository}
     */
    #serverParamsRepository;

    /**
     * @type {?string}
     */
    #serverVersion = null;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#serverParamsRepository = Injector.inject('ServerParamsRepository');
    }

    /**
     * Fetches server information.
     *
     * @returns {Promise<void>}
     */
    async fetchServerInfo(){
        const response = await Request.get(APIEndpoints.SERVER_INFO, null, false);
        const serverParams = new ServerParams(response.serverParams);
        this.#serverParamsRepository.setServerParams(serverParams);
        this.#serverVersion = response.version ?? null;
    }

    /**
     * Returns the loaded server params.
     *
     * @returns {?ServerParams}
     */
    getServerParams(){
        return this.#serverParamsRepository.getServerParams();
    }

    /**
     * Returns server version.
     *
     * @returns {?string}
     */
    getServerVersion(){
        return this.#serverVersion;
    }
}

export default ServerInfoService;
