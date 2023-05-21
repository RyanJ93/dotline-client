'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AttachmentService from '../../services/AttachmentService';
import StringUtils from '../../utils/StringUtils';
import styles from './AttachmentList.scss';
import React from 'react';

class AttachmentList extends React.Component {
    #renderAttachmentPreview(file){
        switch ( file.type ){
            case 'image/webp':
            case 'image/jpeg':
            case 'image/gif':
            case 'image/jpg':
            case 'image/png': {
                return <div className={styles.imagePreview} style={{ backgroundImage: 'url(' + URL.createObjectURL(file) + ')' }} />;
            }
        }
    }

    #renderAttachmentList(){
        let renderedAttachmentList = [];
        for ( const [name, props] of this.state.attachmentList ){
            props.ref = React.createRef();
            renderedAttachmentList.push(
                <li key={renderedAttachmentList.length} ref={props.ref} data-name={name}>
                    <div className={styles.controls}>
                        <FontAwesomeIcon icon='a-solid fa-xmark' onClick={this._handleRemoveButtonClick} />
                    </div>
                    {this.#renderAttachmentPreview(props.file, props.ref)}
                    <p className={styles.name} title={props.file.name}>{props.file.name}</p>
                    <p className={styles.size}>{StringUtils.sizeToHumanReadableString(props.file.size)}</p>
                </li>
            );
        }
        return this.state.attachmentList.size === 0 ? null : (
            <div className={styles.listWrapper}>
                <p className={styles.title}>Attached files ({this.state.attachmentList.size}/{AttachmentService.MAX_FILE_COUNT}):</p>
                <p className={styles.instructions}>20 file can be selected at most, maximum 50mb each.</p>
                <ul className={styles.list}>{renderedAttachmentList}</ul>
            </div>
        );
    }

    _handleRemoveButtonClick(event){
        const name = event.target.closest('li[data-name]').getAttribute('data-name');
        this.state.attachmentList.delete(name);
        this.forceUpdate();
    }

    constructor(props){
        super(props);

        this._handleRemoveButtonClick = this._handleRemoveButtonClick.bind(this);
        this.state = { attachmentList: new Map() };
    }

    addAttachments(fileList){
        Array.from(fileList).forEach((file) => {
            if ( this.state.attachmentList.size < AttachmentService.MAX_FILE_COUNT && AttachmentService.fileCanBeAttached(file) ){
                this.state.attachmentList.set(file.name, { file: file, ref: null });
            }
        });
        this.forceUpdate();
        return this;
    }

    getAttachmentList(){
        return Array.from(this.state.attachmentList.values()).map((attachment) => attachment.file);
    }

    hasAttachments(){
        return this.state.attachmentList.size > 0;
    }

    clear(){
        this.state.attachmentList.clear();
        this.forceUpdate();
        return this;
    }

    render(){
        return (
            <div className={styles.attachmentList}>{this.#renderAttachmentList()}</div>
        );
    }
}

export default AttachmentList;
