'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import AttachmentMetadata from './AttachmentMetadata';
import Conversation from '../models/Conversation';
import APIEndpoints from '../enum/APIEndpoints';

/**
 * @typedef {AttachmentMetadataProperties} AttachmentProperties
 *
 * @property {string} url
 * @property {string} id
 */

class Attachment extends AttachmentMetadata {
    /**
     * Makes a list of attachments based on the given message properties.
     *
     * @param {MessageProperties} messageProperties
     * @param {Conversation} conversation
     *
     * @returns {Attachment[]}
     *
     * @throws {IllegalArgumentException} If some invalid message properties are given.
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    static makeListFromMessageProperties(messageProperties, conversation){
        if ( messageProperties === null || typeof messageProperties !== 'object' ){
            throw new IllegalArgumentException('Invalid message properties.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        return Array.isArray(messageProperties.attachments) ? messageProperties.attachments.map((attachment) => {
            attachment.url = APIEndpoints.ATTACHMENT_GET.replace(':conversationID', conversation.getID());
            attachment.url = attachment.url.replace(':messageID', messageProperties.id);
            attachment.url = attachment.url.replace(':attachmentID', attachment.id);
            attachment.encryptionIV = attachment.encryption_iv;
            return new Attachment(attachment);
        }) : [];
    }

    /**
     * @type {string}
     *
     * @protected
     */
    _url;

    /**
     * @type {string}
     *
     * @protected
     */
    _id;

    /**
     * The class constructor.
     *
     * @param {AttachmentProperties} properties
     */
    constructor(properties){
        super(properties);

        this._url = properties.url;
        this._id = properties.id;
    }

    /**
     * Returns the URL to the attachment file.
     *
     * @returns {string}
     */
    getURL(){
        return this._url;
    }

    /**
     * Returns the attachment ID.
     *
     * @returns {string}
     */
    getID(){
        return this._id;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AttachmentProperties}
     */
    toJSON(){
        return Object.assign(super.toJSON(), {
            url: this._url,
            id: this._id
        });
    }
}

export default Attachment;
