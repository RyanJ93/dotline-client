'use strict';

/**
 * @typedef MessageAttachmentListProperties
 *
 * @property {?BlobContainer[]} [attachmentBlobContainerList]
 * @property {?File[]} [attachmentFileList]
 */

class MessageAttachmentList {
    /**
     * @type {BlobContainer[]}
     */
    #attachmentBlobContainerList;

    /**
     * @type {File[]}
     */
    #attachmentFileList;

    /**
     * The class constructor.
     *
     * @param {MessageAttachmentListProperties} properties
     */
    constructor(properties){
        this.#attachmentBlobContainerList = properties.attachmentBlobContainerList ?? [];
        this.#attachmentFileList = properties.attachmentFileList ?? [];
    }

    /**
     * Returns the list of all those attachments represented by a blob container.
     *
     * @returns {BlobContainer[]}
     */
    getAttachmentBlobContainerList(){
        return this.#attachmentBlobContainerList;
    }

    /**
     * Returns the list of all those attachments represented by a file instance.
     *
     * @returns {File[]}
     */
    getAttachmentFileList(){
        return this.#attachmentFileList;
    }

    /**
     * Returns the length of the combined attachment list.
     *
     * @returns {number}
     */
    getCombinedSize(){
        return this.#attachmentBlobContainerList.length + this.#attachmentFileList.length;
    }
}

export default MessageAttachmentList;
