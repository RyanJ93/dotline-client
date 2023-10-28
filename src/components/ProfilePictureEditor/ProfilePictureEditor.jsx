'use strict';

import UserProfilePictureService from '../../services/UserProfilePictureService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserService from '../../services/UserService';
import StringUtils from '../../utils/StringUtils';
import styles from './ProfilePictureEditor.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class ProfilePictureEditor extends React.Component {
    #previewRef = React.createRef();
    #inputRef = React.createRef();

    async #refreshProfilePicturePreview(){
        const authenticatedUser = await new UserService().getAuthenticatedUserAsModel();
        if ( authenticatedUser !== null ){
            const url = await new UserProfilePictureService().getUserProfilePicture(authenticatedUser);
            this.setState((prev) => ({ ...prev, profilePictureURL: url }), () => this.forceUpdate());
        }
    }

    async #changeProfilePicture(file){
        try{
            if ( UserProfilePictureService.isSupportedPictureType(file.type) ){
                this.setState((prev) => ({ ...prev, status: 'uploading' }));
                await new UserService().changeProfilePicture(file);
                await this.#refreshProfilePicturePreview();
                this.setState((prev) => ({ ...prev, status: 'idle' }));
            }
        }catch(ex){
            this.setState((prev) => ({ ...prev, status: 'error' }));
            console.error(ex);
        }
    }

    async #removeProfilePicture(){
        try{
            this.setState((prev) => ({ ...prev, status: 'uploading' }));
            await new UserService().removeProfilePicture();
            this.setState((prev) => ({ ...prev, status: 'idle', profilePictureURL: null }));
        }catch(ex){
            this.setState((prev) => ({ ...prev, status: 'error' }));
            console.error(ex);
        }
    }

    #renderProfilePicture(){
        let renderedProfilePicture = null, { profilePictureURL } = this.state;
        if ( profilePictureURL === '' || typeof profilePictureURL !== 'string' ){
            const authenticatedUser = new UserService().getAuthenticatedUser();
            if ( authenticatedUser !== null ){
                const iconText = StringUtils.makePFPName(authenticatedUser.getComputedName());
                renderedProfilePicture = (
                    <div className={styles.iconTextContainer}>
                        <p className={styles.iconText}>{iconText}</p>
                    </div>
                );
            }
        }else{
            renderedProfilePicture = <div className={styles.picture} style={{ backgroundImage: 'url(' + profilePictureURL + ')' }} />;
        }
        return renderedProfilePicture;
    }

    _handlePicturePickClick(){
        this.#inputRef.current.click();
    }

    _handleRetryClick(){
        if ( this.#inputRef.current.files.length === 0 ){
            return this.setState((prev) => ({ ...prev, status: 'idle' }));
        }
        this.#changeProfilePicture(this.#inputRef.current.files[0]);
    }

    _handleCancelClick(){
        this.setState((prev) => ({ ...prev, status: 'idle' }));
        this.#inputRef.current.value = '';
    }

    _handleFileChange(event){
        this.#changeProfilePicture(event.target.files[0]);
    }

    _handlePictureRemoveClick(){
        this.#removeProfilePicture();
    }

    _handleDropZoneDragEnter(event){
        event.preventDefault();
        if ( this.state.status === 'idle' ){
            this.#previewRef.current.setAttribute('data-dragover', 'true');
        }
    }

    _handleDropZoneDragLeave(event){
        event.preventDefault();
        this.#previewRef.current.setAttribute('data-dragover', 'false');
    }

    _handleDropZoneDrop(event){
        event.preventDefault();
        if ( this.state.status === 'idle' ){
            this.#previewRef.current.setAttribute('data-dragover', 'false');
            this.#changeProfilePicture(event.dataTransfer.files[0]);
        }
    }

    constructor(props){
        super(props);

        this._handlePictureRemoveClick = this._handlePictureRemoveClick.bind(this);
        this._handleDropZoneDragEnter = this._handleDropZoneDragEnter.bind(this);
        this._handleDropZoneDragLeave = this._handleDropZoneDragLeave.bind(this);
        this._handlePicturePickClick = this._handlePicturePickClick.bind(this);
        this._handleDropZoneDrop = this._handleDropZoneDrop.bind(this);
        this._handleCancelClick = this._handleCancelClick.bind(this);
        this._handleRetryClick = this._handleRetryClick.bind(this);
        this._handleFileChange = this._handleFileChange.bind(this);
        this.state = { status: 'idle', profilePictureURL: null };
    }

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', () => this.#refreshProfilePicturePreview());
        this.#refreshProfilePicturePreview().catch((ex) => console.error(ex));
    }

    render(){
        const accept = UserProfilePictureService.ACCEPTED_MIME_TYPES.join(', ');
        const { status, profilePictureURL } = this.state, { t } = this.props;
        return (
            <div className={styles.profilePictureEditor + ' text-primary'}>
                <div className={styles.preview + ' bg-accent'} data-status={status} ref={this.#previewRef} onDragEnter={this._handleDropZoneDragEnter} onDragOver={this._handleDropZoneDragEnter} onDragLeave={this._handleDropZoneDragLeave} onDrop={this._handleDropZoneDrop}>
                    <div className={styles.loaderWrapper}>
                        <div className={styles.loader + ' loader-img-white'} />
                    </div>
                    <div className={styles.controlsWrapper}>
                        <div className={styles.controls}>
                            <FontAwesomeIcon icon='a-solid fa-rotate-right' onClick={this._handleRetryClick} title={t('profilePictureEditor.title.retry')} />
                            <FontAwesomeIcon icon='a-solid fa-xmark' className={'text-danger'} onClick={this._handleCancelClick} title={t('profilePictureEditor.title.cancel')} />
                        </div>
                    </div>
                    {this.#renderProfilePicture()}
                </div>
                <div className={styles.lowerControlsWrapper} data-active={status === 'idle'}>
                    <a onClick={this._handlePicturePickClick}>{t('profilePictureEditor.label.pick')}</a>
                    { profilePictureURL !== null && <a onClick={this._handlePictureRemoveClick}>{t('profilePictureEditor.label.remove')}</a> }
                </div>
                <input type={'file'} ref={this.#inputRef} onChange={this._handleFileChange} accept={accept} />
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(ProfilePictureEditor);
