'use strict';

import UserProfilePictureService from '../../services/UserProfilePictureService';
import styles from './ProfilePictureEditor.scss';
import React from 'react';

class ProfilePictureEditor extends React.Component {
    #inputRef = React.createRef();

    _handlePicturePickClick(){
        this.#inputRef.current.click();
    }

    _handleFileChange(event){
        new UserProfilePictureService().changeProfilePicture(event.target.files[0]);
    }

    constructor(props){
        super(props);

        this._handlePicturePickClick = this._handlePicturePickClick.bind(this);
    }

    render(){
        return (
            <div className={styles.profilePictureEditor + ' text-primary'}>
                <div className={styles.preview + ' bg-accent'} />
                <a onClick={this._handlePicturePickClick}>Pick a new picture</a>
                <a>Remove picture</a>
                <input type={'file'} ref={this.#inputRef} onChange={this._handleFileChange} />
            </div>
        );
    }
}

export default ProfilePictureEditor;
