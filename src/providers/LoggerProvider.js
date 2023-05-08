'use strict';

import * as Sentry from '@sentry/browser';
import Provider from './Provider';

class LoggerProvider extends Provider {
    /**
     * Sets up logging on Sentry.
     */
    static #setupSentry(){
        const sentryDSN = 'https://0814e459263c43eda38e12dc364dbec2@o178512.ingest.sentry.io/4505109603221504';
        if ( typeof sentryDSN === 'string' && sentryDSN !== '' ){
            Sentry.init({
                integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
                dsn: sentryDSN
            });
        }
    }

    /**
     * Sets up logging.
     *
     * @returns {Promise<void>}
     */
    async run(){
        LoggerProvider.#setupSentry();
    }
}

export default LoggerProvider;
