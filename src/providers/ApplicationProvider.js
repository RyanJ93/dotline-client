'use strict';

import NotificationService from '../services/NotificationService';
import StickerPackService from '../services/StickerPackService';
import { createRoot } from 'react-dom/client';
import App from '../components/App/App';
import Maps from '../facades/Maps';
import Provider from './Provider';
import React from 'react';

class ApplicationProvider extends Provider {
    async run(){
        await Promise.all([new NotificationService().initialize(), Maps.init()]);
        new StickerPackService().fetchStickerPacks();
        const root = createRoot(document.getElementById('root'));
        root.render((
            <React.StrictMode>
                <App />
            </React.StrictMode>
        ));
    }
}

export default ApplicationProvider;
