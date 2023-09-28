'use strict';

import NotificationService from '../services/NotificationService';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { register } from 'extendable-media-recorder';
import { createRoot } from 'react-dom/client';
import App from '../components/App/App';
import Maps from '../facades/Maps';
import Provider from './Provider';
import React from 'react';

class ApplicationProvider extends Provider {
    async run(){
        await Promise.all([new NotificationService().initialize(), Maps.init()]);
        const root = createRoot(document.getElementById('root'));
        await register(await connect());
        root.render((
            <React.StrictMode>
                <App />
            </React.StrictMode>
        ));
    }
}

export default ApplicationProvider;
