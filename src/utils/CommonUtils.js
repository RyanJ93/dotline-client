'use strict';

class CommonUtils {
    /**
     * Blocks code execution for a given amount of time.
     *
     * @param {number} timeout
     *
     * @returns {Promise<void>}
     */
    static delay(timeout){
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve();
            }, timeout);
        });
    }
}

export default CommonUtils;
