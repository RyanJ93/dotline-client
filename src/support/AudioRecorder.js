'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import { MediaRecorder } from 'extendable-media-recorder';
import BlobContainer from '../DTOs/BlobContainer';

class AudioRecorder {
    /**
     * @type {?MediaRecorder}
     */
    #mediaRecorder = null;

    /**
     * @type {Blob[]}
     */
    #audioChunks = [];

    /**
     * The class constructor.
     *
     * @param {MediaStream} mediaStream
     */
    constructor(mediaStream){
        this.setup(mediaStream);
    }

    /**
     * Sets up the audio recorder.
     *
     * @param {MediaStream} mediaStream
     *
     * @returns {AudioRecorder}
     *
     * @throws {IllegalArgumentException} If an invalid media stream is given.
     */
    setup(mediaStream){
        if ( !( mediaStream instanceof MediaStream ) ){
            throw new IllegalArgumentException('Invalid media stream.');
        }
        this.#mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/wav' });
        this.#mediaRecorder.ondataavailable = (event) => event.data.size && this.#audioChunks.push(event.data);
        return this;
    }

    /**
     * Resets the recorder and clears recorded audio.
     *
     * @returns {AudioRecorder}
     */
    reset(){
        this.#mediaRecorder?.stop();
        this.#mediaRecorder = null;
        this.#audioChunks = [];
        return this;
    }

    /**
     * Pauses audio recording.
     *
     * @returns {AudioRecorder}
     */
    pause(){
        this.#mediaRecorder?.pause();
        return this;
    }

    /**
     * Starts audio recording.
     *
     * @returns {AudioRecorder}
     */
    start(){
        this.#mediaRecorder?.start();
        return this;
    }

    /**
     * Stops audio recording.
     *
     * @returns {AudioRecorder}
     */
    stop(){
        this.#mediaRecorder?.stop();
        return this;
    }

    /**
     * Exports the recorded audio as a blob wrapped into a blob container object.
     *
     * @param {string} name
     *
     * @returns {Promise<AudioRecorder>}
     *
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    exportAsBlobContainer(name){
        return new Promise((resolve, reject) => {
            if ( name === '' || typeof name !== 'string' ){
                return reject(new IllegalArgumentException('Invalid name.'));
            }
            this.#mediaRecorder.onstop = () => {
                const recording = new Blob(this.#audioChunks, { type: 'audio/wav' });
                this.#mediaRecorder = null;
                this.#audioChunks = [];
                resolve(new BlobContainer({ blob: recording, name: name }));
            };
        });
    }

    /**
     * Exports the recorded audio as a blob.
     *
     * @returns {Promise<Blob>}
     */
    exportAsBlob(){
        return new Promise((resolve) => {
            this.#mediaRecorder.onstop = () => {
                resolve(new Blob(this.#audioChunks, { type: 'audio/wav' }));
            };
        });
    }
}

export default AudioRecorder;
