'use strict';

import Facade from './Facade';

class Crypto extends Facade {
    static #RSAKeys = null;

    static async importRSAKeysFromAuthenticatedUser(authenticatedUser, password){
        const IVBase64 = authenticatedUser.getRSAPrivateKeyEncryptionParameters().getIV();
        const iv = Uint8Array.from(atob(IVBase64), c => c.charCodeAt(0));
        const encodedPassword = new TextEncoder().encode(password);
        const importedKey = await crypto.subtle.importKey('raw', encodedPassword, {
            name: 'PBKDF2'
        }, false, ['deriveBits', 'deriveKey']);

    }
}