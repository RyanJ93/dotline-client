'use strict';

class CommonUtils {
    static delay(timeout){
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve();
            }, timeout);
        });
    }
}

export default CommonUtils;
