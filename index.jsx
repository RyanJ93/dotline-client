'use strict';

import ExceptionMappingProvider from './src/providers/ExceptionMappingProvider';
import ApplicationProvider from './src/providers/ApplicationProvider';
import RepositoryProvider from './src/providers/RepositoryProvider';
import ProviderManager from './src/support/ProviderManager';
import IconProvider from './src/providers/IconProvider';
import './src/common/app.scss';

const providerManager = ProviderManager.getInstance();
providerManager.register(new ExceptionMappingProvider());
providerManager.register(new RepositoryProvider());
providerManager.register(new IconProvider());
providerManager.register(new ApplicationProvider());

document.addEventListener('DOMContentLoaded', () => {
    providerManager.runProviders().then(() => {
        console.log('App initialized!');
    });
});
