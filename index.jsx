'use strict';

import ExceptionMappingProvider from './src/providers/ExceptionMappingProvider';
import ProviderManager from './src/support/ProviderManager';
import IconProvider from './src/providers/IconProvider';
import { createRoot } from 'react-dom/client';
import App from './src/components/App/App';
import './src/common/app.scss';
import React from 'react';

const providerManager = ProviderManager.getInstance();
providerManager.register(new ExceptionMappingProvider());
providerManager.register(new IconProvider());

document.addEventListener('DOMContentLoaded', () => {
    const root = createRoot(document.getElementById('root'));
    providerManager.runProviders().then(() => {
        root.render((
            <React.StrictMode>
                <App />
            </React.StrictMode>
        ));
    });
});
