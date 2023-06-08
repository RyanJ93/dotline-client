'use strict';

import Exception from '../exceptions/Exception';
import Facade from './Facade';
import i18n from 'i18next';
import React from 'react';

class MessageBox extends Facade {
    /**
     * Shows a message box with the given text and title.
     *
     * @param {string} text
     * @param {string} title
     * @param {string} type
     *
     * @returns {Promise<?boolean>}
     */
    static async #showMessageBox(text, title, type){
        if ( typeof window.showMessageBox === 'function' ){
            return window.showMessageBox(text, title, type);
        }
    }

    /**
     * Reports the given error to the user using a message box.
     *
     * @param {Error} error
     *
     * @returns {Promise<?boolean>}
     */
    static async reportError(error){
        let message = i18n.t('exception.message');
        if ( error instanceof Exception ){
            message = error.getLocalizedMessage();
        }
        return MessageBox.error(message);
    }

    /**
     * Displays a success message box.
     *
     * @param {string} text
     * @param {?string} [title]
     *
     * @returns {Promise<?boolean>}
     */
    static async success(text, title = null){
        return await MessageBox.#showMessageBox(text, title, MessageBox.TYPE_SUCCESS);
    }

    /**
     * Displays a confirmation message box.
     *
     * @param {string} text
     * @param {?string} [title]
     *
     * @returns {Promise<?boolean>}
     */
    static async confirm(text, title = null){
        return await MessageBox.#showMessageBox(text, title, MessageBox.TYPE_CONFIRM);
    }

    /**
     * Displays an error message box.
     *
     * @param {string} text
     * @param {?string} [title]
     *
     * @returns {Promise<?boolean>}
     */
    static async error(text, title = null){
        return await MessageBox.#showMessageBox(text, title, MessageBox.TYPE_ERROR);
    }

    /**
     * Displays a warning message box.
     *
     * @param {string} text
     * @param {?string} [title]
     *
     * @returns {Promise<?boolean>}
     */
    static async warn(text, title = null){
        return await MessageBox.#showMessageBox(text, title, MessageBox.TYPE_WARNING);
    }

    /**
     * Displays an info message box.
     *
     * @param {string} text
     * @param {?string} [title]
     *
     * @returns {Promise<?boolean>}
     */
    static async info(text, title = null){
        return await MessageBox.#showMessageBox(text, title, MessageBox.TYPE_INFO);
    }
}

/**
 * @constant {string}
 */
Object.defineProperty(MessageBox, 'TYPE_SUCCESS', {
    value: 'success',
    writable: false
});

/**
 * @constant {string}
 */
Object.defineProperty(MessageBox, 'TYPE_CONFIRM', {
    value: 'confirm',
    writable: false
});

/**
 * @constant {string}
 */
Object.defineProperty(MessageBox, 'TYPE_WARNING', {
    value: 'warn',
    writable: false
});

/**
 * @constant {string}
 */
Object.defineProperty(MessageBox, 'TYPE_ERROR', {
    value: 'error',
    writable: false
});

/**
 * @constant {string}
 */
Object.defineProperty(MessageBox, 'TYPE_INFO', {
    value: 'info',
    writable: false
});

export default MessageBox;
