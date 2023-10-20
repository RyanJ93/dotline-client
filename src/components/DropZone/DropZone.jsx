'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import styles from './DropZone.scss';
import React from 'react';

class DropZone extends React.Component {
    #dropZoneRef = React.createRef();

    _handleDropZoneDragEnter(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'true');
    }

    _handleDropZoneDragLeave(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'false');
    }

    _handleDropZoneDrop(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'false');
        if ( typeof this.props.onFileDrop === 'function' ){
            this.props.onFileDrop(event.dataTransfer.files);
        }
    }

    constructor(props){
        super(props);

        this._handleDropZoneDragEnter = this._handleDropZoneDragEnter.bind(this);
        this._handleDropZoneDragLeave = this._handleDropZoneDragLeave.bind(this);
        this._handleDropZoneDrop = this._handleDropZoneDrop.bind(this);
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.dropZone} onDragEnter={this._handleDropZoneDragEnter} onDragOver={this._handleDropZoneDragEnter} onDragLeave={this._handleDropZoneDragLeave} onDragEnd={this._handleDropZoneDragLeave} onDrop={this._handleDropZoneDrop}>
                <div className={styles.dropZoneContainer + ' bg-primary'} ref={this.#dropZoneRef} data-active={'false'}>
                    <div className={styles.dropZoneContent}>
                        <FontAwesomeIcon icon='fa-solid fa-paperclip' />
                        <p>{t('dropZone.dropZoneLabel')}</p>
                    </div>
                </div>
                <div className={styles.contentWrapper}>{this.props.children}</div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(DropZone);
