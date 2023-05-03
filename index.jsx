'use strict';

import ExceptionMappingProvider from './src/providers/ExceptionMappingProvider';
import ApplicationProvider from './src/providers/ApplicationProvider';
import RepositoryProvider from './src/providers/RepositoryProvider';
import DatabaseProvider from './src/providers/DatabaseProvider';
import LocaleProvider from './src/providers/LocaleProvider';
import ProviderManager from './src/support/ProviderManager';
import LoggerProvider from './src/providers/LoggerProvider';
import EventProvider from './src/providers/EventProvider';
import IconProvider from './src/providers/IconProvider';
import './src/common/app.scss';

const providerManager = ProviderManager.getInstance();
providerManager.register(new LoggerProvider());
providerManager.register(new ExceptionMappingProvider());
providerManager.register(new RepositoryProvider());
providerManager.register(new DatabaseProvider());
providerManager.register(new LocaleProvider());
providerManager.register(new EventProvider());
providerManager.register(new IconProvider());
providerManager.register(new ApplicationProvider());

document.addEventListener('DOMContentLoaded', () => {
    providerManager.runProviders().then(() => {
        console.log('App initialized!');
    });
});
