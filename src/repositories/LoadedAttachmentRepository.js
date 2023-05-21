'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Repository from './Repository';

class LoadedAttachmentRepository extends Repository {
    /**
     * @type {Object.<string, string>}
     */
    static #loadedAttachmentIndex = Object.create(null);

    /**
     * Stores a given downloaded file.
     *
     * @param {string} url
     * @param {Blob} content
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid content is given.
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    storeLoadedAttachment(url, content){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid URL.');
        }
        if ( !( content instanceof Blob ) ){
            throw new IllegalArgumentException('Invalid content.');
        }
        LoadedAttachmentRepository.#loadedAttachmentIndex[url] = URL.createObjectURL(content);
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
            URL.revokeObjectURL(LoadedAttachmentRepository.#loadedAttachmentIndex[url]);
            delete LoadedAttachmentRepository.#loadedAttachmentIndex[url];
        }
        return this;
    }

    /**
     * Returns a downloaded attachment file.
     *
     * @param {string} url
     *
     * @returns {?string}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    getLoadedAttachment(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid url.');
        }
        return LoadedAttachmentRepository.#loadedAttachmentIndex[url] ?? null;
    }

    hasLoadedAttachment(url){
        if ( url === '' || typeof url !== 'string' ){
            throw new IllegalArgumentException('Invalid url.');
        }
        return typeof LoadedAttachmentRepository.#loadedAttachmentIndex[url] === 'string';
    }
}

export default LoadedAttachmentRepository;
