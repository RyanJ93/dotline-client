'use strict';

import EntityIcon from '../EntityIcon/EntityIcon';
import styles from './UserSearchResultEntry.scss';
import { withTranslation } from 'react-i18next';
import DateUtils from '../../utils/DateUtils';
import React from 'react';

class UserSearchResultEntry extends React.Component {
    #computeLastAccessDate(){
        let lastAccessDate = '', lastAccess = this.props.user.getLastAccess(), { t } = this.props;
        if ( lastAccess !== null ){
            lastAccessDate = t('userSearchResultEntry.lastAccess') + DateUtils.getPassedTime(lastAccess);
        }
        return lastAccessDate;
    }

    render(){
        return (
            <div className={styles.userSearchResultEntry}>
                <EntityIcon user={this.props.user} />
                <div className={styles.info + ' text-primary'}>
                    <p className={styles.username}>{this.props.user.getUsername()}</p>
                    <p className={styles.lastAccess}>{this.#computeLastAccessDate()}</p>
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(UserSearchResultEntry);
