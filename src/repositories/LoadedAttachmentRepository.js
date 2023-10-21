'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import RemoteAssetStatus from '../enum/RemoteAssetStatus';
import RemoteAsset from '../DTOs/RemoteAsset';
import Repository from './Repository';

class LoadedAttachmentRepository extends Repository {
    /**
     * @type {Object.<string, RemoteAsset>}
     */
    static #loadedAttachmentIndex = Object.create(null);

    /**
     * Checks if a given attachment file has been fetched or not.
     *
     * @param url
     *
     * @returns {?RemoteAsset}
     */
    #assertLoadedAttachment(url){
        let remoteAsset = this.getLoadedAttachment(url);
        if ( remoteAsset?.getStatus() !== RemoteAssetStatus.FETCHED ){
            remoteAsset = null;
        }
        return remoteAsset;
    }

    /**
     * Stores a given downloaded attachment file.
     *
     * @param {string} url
     * @param {RemoteAsset} remoteAsset
     *
     * @returns {RemoteAsset}
     *
     * @throws {IllegalArgumentException} If an invalid remote asset is given.
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    storeLoadedAttachment(url, remoteAsset){
        if ( !( remoteAsset instanceof RemoteAsset ) ){
            throw new IllegalArgumentException('Invalid remote asset.');
        }
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid URL.');
        }
        LoadedAttachmentRepository.#loadedAttachmentIndex[url] = remoteAsset;
        return LoadedAttachmentRepository.#loadedAttachmentIndex[url];
    }

    /**
     * Drops a downloaded attachment file.
     *
     * @param {string} url
     *
     * @returns {LoadedAttachmentRepository}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    dropLoadedAttachment(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid url.');
        }
        if ( typeof LoadedAttachmentRepository.#loadedAttachmentIndex[url] === 'string' ){
            delete LoadedAttachmentRepository.#loadedAttachmentIndex[url];
        }
        return this;
    }

    /**
     * Returns a downloaded attachment file.
     *
     * @param {string} url
     *
     * @returns {?RemoteAsset}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    getLoadedAttachment(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid url.');
        }
        return LoadedAttachmentRepository.#loadedAttachmentIndex[url] ?? null;
    }

    /**
     * Checks if a given attachment file has been registered.
     *
     * @param {string} url
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    hasLoadedAttachment(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid url.');
        }
        return typeof LoadedAttachmentRepository.#loadedAttachmentIndex[url] === 'string';
    }

    /**
     * Waits for a given attachment file to be fetched.
     *
     * @param {string} url
     * @param {number} timeout
     *
     * @returns {Promise<RemoteAsset>}
     *
     * @throws {IllegalArgumentException} If an invalid timeout value is given.
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    waitForLoadedAttachment(url, timeout = LoadedAttachmentRepository.DEFAULT_WAIT_TIMEOUT){
        return new Promise((resolve, reject) => {
            if ( timeout === null || isNaN(timeout) || timeout <= 0 ){
                return reject(new IllegalArgumentException('Invalid timeout value.'));
            }
            if ( url === '' || typeof url !== 'string' ){
                return reject(new IllegalArgumentException('Invalid url.'));
            }
            const timeoutDate = new Date(new Date().getTime() + timeout);
            const remoteAsset = this.#assertLoadedAttachment(url);
            if ( remoteAsset !== null ){
                return resolve(remoteAsset);
            }
            const intervalID = window.setInterval(() => {
                const remoteAsset = this.#assertLoadedAttachment(url), date = new Date();
                if ( remoteAsset !== null || date < timeoutDate ){
                    window.clearInterval(intervalID);
                    return resolve(remoteAsset);
                }
            }, 1000);
        });
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(LoadedAttachmentRepository, 'DEFAULT_WAIT_TIMEOUT', { value: 30000, writable: false });

export default LoadedAttachmentRepository;
