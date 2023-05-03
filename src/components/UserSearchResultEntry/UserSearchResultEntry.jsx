'use strict';

import EntityIcon from '../EntityIcon/EntityIcon';
import styles from './UserSearchResultEntry.scss';
import DateUtils from '../../utils/DateUtils';
import React from 'react';

class UserSearchResultEntry extends React.Component {
    #computeLastAccessDate(){
        let lastAccessDate = '', lastAccess = this.props.user.getLastAccess();
        if ( lastAccess !== null ){
            lastAccessDate = 'Last access: ' + DateUtils.getPassedTime(lastAccess);
        }
        return lastAccessDate;
    }

    render(){
        return (
            <div className={styles.userSearchResultEntry}>
                <EntityIcon text={this.props.user.getUsername()} />
                <div className={styles.info}>
                    <p className={styles.username}>{this.props.user.getUsername()}</p>
                    <p className={styles.lastAccess}>{this.#computeLastAccessDate()}</p>
                </div>
            </div>
        );
    }
}

export default UserSearchResultEntry;
