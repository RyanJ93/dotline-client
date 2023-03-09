'use strict';

import { createRoot } from 'react-dom/client';
import App from '../components/App/App';
import Provider from './Provider';
import React from 'react';

class ApplicationProvider extends Provider {
    async run(){
        const root = createRoot(document.getElementById('root'));
        root.render((
            <React.StrictMode>
                <App />
            </React.StrictMode>
        ));
    }
}

export default ApplicationProvider;
