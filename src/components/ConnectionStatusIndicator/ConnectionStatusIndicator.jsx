'use strict';

import styles from './ConnectionStatusIndicator.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class ConnectionStatusIndicator extends React.Component {
    constructor(props){
        super(props);

        this.state = { display: false };
    }

    componentDidMount(){
        Event.getBroker().on('WSReconnected', () => this.setState((prev) => ({ ...prev, display: false })));
        Event.getBroker().on('WSDisconnected', () => this.setState((prev) => ({ ...prev, display: true })));
        window.addEventListener('online', () => this.setState((prev) => ({ ...prev, display: false })));
        window.addEventListener('offline', () => this.setState((prev) => ({ ...prev, display: true })));
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.connectionStatusIndicator} data-display={this.state.display}>
                <span className={'text-danger'}>{t('connectionStatusIndicator.label')}</span>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(ConnectionStatusIndicator);
