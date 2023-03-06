'use strict';

class BinaryUtils {
    static arrayBufferToHEX(arrayBuffer){
        return [...new Uint8Array(arrayBuffer)].map((element) => {
            return element.toString(16).padStart(2, '0');
        }).join('');
    }
}

export default BinaryUtils;
