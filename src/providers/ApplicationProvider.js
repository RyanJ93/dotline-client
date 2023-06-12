'use strict';

import NotificationService from '../services/NotificationService';
import { createRoot } from 'react-dom/client';
import App from '../components/App/App';
import Maps from '../facades/Maps';
import Provider from './Provider';
import React from 'react';

class ApplicationProvider extends Provider {
    async run(){
        await new NotificationService().initialize();
        await Maps.init();
        const root = createRoot(document.getElementById('root'));
        root.render((
            <React.StrictMode>
                <App />
            </React.StrictMode>
        ));
    }
}

export default ApplicationProvider;
