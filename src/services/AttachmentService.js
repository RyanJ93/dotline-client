'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters';
import MessageAttachmentList from '../DTOs/MessageAttachmentList';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import DownloadedAttachment from '../DTOs/DownloadedAttachment';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import AttachmentMetadata from '../DTOs/AttachmentMetadata';
import ConversationService from './ConversationService';
import CryptoUtils from '../utils/CryptoUtils';
import Attachment from '../DTOs/Attachment';
import FileUtils from '../utils/FileUtils';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Message from '../models/Message';
import Service from './Service';

/**
 * @typedef ProcessedAttachment
 *
 * @property {AttachmentMetadata} attachmentMetadata
 * @property {Blob} encryptedFile
 */

class AttachmentService extends Service {
    /**
     * Checks if a given user selected file can be attached to a message.
     *
     * @param {File} file
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid file is given.
     */
    static fileCanBeAttached(file){
        if ( !( file instanceof File ) ){
            throw new IllegalArgumentException('Invalid file.');
        }
        return file.size <= AttachmentService.MAX_FILE_SIZE;
    }

    /**
     * @type {LoadedAttachmentRepository}
     */
    #loadedAttachmentRepository;

    /**
     * @type {?HMACSigningParameters}
     */
    #hmacSigningParameters = null;

    /**
     * @type {?AESStaticParameters}
     */
    #aesStaticParameters = null;

    /**
     * @type {?CryptoKey}
     */
    #encryptionKey = null;

    /**
     * @type {?CryptoKey}
     */
    #signingKey = null;

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * Sets the encryption parameters to use in attachment file encryption.
     *
     * @param {CryptoKey} encryptionKey
     * @param {AESStaticParameters} aesStaticParameters
     *
     * @returns {AttachmentService}
     *
     * @throws {IllegalArgumentException} If some invalid encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid encryption key is given.
     */
    setEncryptionParameters(encryptionKey, aesStaticParameters){
        if ( !( aesStaticParameters instanceof AESStaticParameters ) ){
            throw new IllegalArgumentException('Invalid encryption parameters.');
        }
        if ( !( encryptionKey instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid encryption key.');
        }
        this.#aesStaticParameters = aesStaticParameters;
        this.#encryptionKey = encryptionKey;
        return this;
    }

    /**
     * Sets the signing parameters to use in attachment file encryption.
     *
     * @param {CryptoKey} signingKey
     * @param {HMACSigningParameters} hmacSigningParameters
     *
     * @returns {AttachmentService}
     *
     * @throws {IllegalArgumentException} If some invalid signing parameters are given.
     * @throws {IllegalArgumentException} If an invalid signing key is given.
     */
    setSigningParameters(signingKey, hmacSigningParameters){
        if ( !( hmacSigningParameters instanceof HMACSigningParameters ) ){
            throw new IllegalArgumentException('Invalid signing parameters.');
        }
        if ( !( signingKey instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid signing key.');
        }
        this.#hmacSigningParameters = hmacSigningParameters;
        this.#signingKey = signingKey;
        return this;
    }

    /**
     * The class constructor.
     *
     * @param {?Message} message
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    constructor(message = null){
        super();

        this.#loadedAttachmentRepository = Injector.inject('LoadedAttachmentRepository');
        this.setMessage(message);
    }

    /**
     * Sets the message attachments are attached to.
     *
     * @param {?Message} message
     *
     * @returns {AttachmentService}
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        this.#message = message;
        return this;
    }

    /**
     * Returns the message attachments are attached to.
     *
     * @returns {?Message}
     */
    getMessage(){
        return this.#message;
    }

    /**
     * Generates encryption parameters.
     *
     * @returns {AESEncryptionParameters}
     */
    #generateAESEncryptionParameters(){
        const encryptionIV = btoa(String.fromCharCode(...new Uint8Array(crypto.getRandomValues(new Uint8Array(12)))));
        return new AESEncryptionParameters.makeFromAESStaticParameters(this.#aesStaticParameters, encryptionIV);
    }

    /**
     * Encrypts and computes attachment signature for a given attachment list.
     *
     * @param {MessageAttachmentList} messageAttachmentList
     *
     * @returns {Promise<ProcessedAttachment[]>}
     *
     * @throws {IllegalArgumentException} If an invalid message attachment list is given.
     */
    async processMessageAttachmentList(messageAttachmentList){
        if ( !( messageAttachmentList instanceof MessageAttachmentList ) ){
            throw new IllegalArgumentException('Invalid message attachment list.');
        }
        const attachmentBlobContainerList = messageAttachmentList.getAttachmentBlobContainerList();
        const aesEncryptionParameters = this.#generateAESEncryptionParameters();
        const processedMessageAttachmentList = [], iv = aesEncryptionParameters.getIV();
        const attachmentFileList = messageAttachmentList.getAttachmentFileList();
        for ( let i = 0 ; i < attachmentBlobContainerList.length ; i++ ){
            const fileContent = await FileUtils.readUploadedFile(attachmentBlobContainerList[i].getBlob());
            const signature = await CryptoUtils.HMACFileSign(fileContent, this.#signingKey, this.#hmacSigningParameters);
            const attachmentMetadata = AttachmentMetadata.makeFromBlobContainer(attachmentBlobContainerList[i], iv, signature);
            const encryptedFileContent = await CryptoUtils.AESEncryptFile(fileContent, this.#encryptionKey, aesEncryptionParameters);
            const encryptedFile = new Blob([encryptedFileContent], { type: attachmentMetadata.getMimetype() });
            processedMessageAttachmentList.push({ encryptedFile: encryptedFile, attachmentMetadata: attachmentMetadata });
        }
        for ( let i = 0 ; i < attachmentFileList.length ; i++ ){
            const fileContent = await FileUtils.readUploadedFile(attachmentFileList[i]);
            const signature = await CryptoUtils.HMACFileSign(fileContent, this.#signingKey, this.#hmacSigningParameters);
            const attachmentMetadata = AttachmentMetadata.makeFromFile(attachmentFileList[i], iv, signature);
            const encryptedFileContent = await CryptoUtils.AESEncryptFile(fileContent, this.#encryptionKey, aesEncryptionParameters);
            const encryptedFile = new Blob([encryptedFileContent], { type: attachmentMetadata.getMimetype() });
            processedMessageAttachmentList.push({ encryptedFile: encryptedFile, attachmentMetadata: attachmentMetadata });
        }
        return processedMessageAttachmentList;
    }

    /**
     * Fetches an attachment file from the server.
     *
     * @param {Attachment} attachment
     *
     * @returns {Promise<DownloadedAttachment>}
     *
     * @throws {IllegalArgumentException} If an invalid attachment is given.
     */
    async fetchAttachment(attachment){
        if ( !( attachment instanceof Attachment ) ){
            throw new IllegalArgumentException('Invalid attachment.');
        }
        let objectURL = this.#loadedAttachmentRepository.getLoadedAttachment(attachment.getURL());
        if ( objectURL === null ){
            const content = await Request.download(attachment.getURL()), arrayBufferContent = await content.arrayBuffer();
            const staticParameters = this.#message.getConversation().getEncryptionParameters().toJSON(), iv = attachment.getEncryptionIV();
            const conversationKeys = await new ConversationService(this.#message.getConversation()).getConversationKeys();
            const encryptionParameters = new AESEncryptionParameters(Object.assign({ iv: iv }, staticParameters));
            const importedEncryptionKey = await CryptoUtils.importAESKey(conversationKeys.getEncryptionKey(), encryptionParameters);
            const decryptedContent = await CryptoUtils.AESDecryptFile(arrayBufferContent, importedEncryptionKey, encryptionParameters);
            const blob = new Blob([decryptedContent], { type: attachment.getMimetype() }), url = attachment.getURL();
            objectURL = this.#loadedAttachmentRepository.storeLoadedAttachment(url, blob);
        }
        return DownloadedAttachment.makeFromAttachment(attachment, objectURL);
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(AttachmentService, 'MAX_FILE_SIZE', {
    value: 52428800,
    writable: false
});

/**
 * @constant {number}
 */
Object.defineProperty(AttachmentService, 'MAX_FILE_COUNT', {
    value: 20,
    writable: false
});

export default AttachmentService;
