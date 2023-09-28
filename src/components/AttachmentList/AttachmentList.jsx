'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AttachmentService from '../../services/AttachmentService';
import ServerInfoService from '../../services/ServerInfoService';
import StringUtils from '../../utils/StringUtils';
import { withTranslation } from 'react-i18next';
import FileUtils from '../../utils/FileUtils';
import styles from './AttachmentList.scss';
import React from 'react';
import MessageAttachmentList from '../../DTOs/MessageAttachmentList';

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
            case 'video/mp4': {
                return (
                    <div className={styles.videoPreviewWrapper}>
                        <video src={URL.createObjectURL(file)} controls={true} />
                    </div>
                );
            }
            default: {
                return (
                    <div className={styles.fileIconPreview}>
                        <FontAwesomeIcon icon={FileUtils.getFileIconClass(file.type)} />
                    </div>
                );
            }
        }
    }

    #renderAttachmentList(){
        const serverParams = new ServerInfoService().getServerParams();
        const maxFileCount = serverParams?.getMaxFileCount() ?? 0;
        const maxFileSize = serverParams?.getMaxFileSize() ?? 0;
        const renderedAttachmentList = [], { t } = this.props;
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
        const humanReadableMaxFileSize = StringUtils.sizeToHumanReadableString(maxFileSize);
        const counterText = '(' + this.state.attachmentList.size + '/' + maxFileCount + ')';
        const counterLabel = t('attachmentList.title').replace('[counter]', counterText);
        let instructions = t('attachmentList.instructions').replace('[count]', maxFileCount);
        instructions = instructions.replace('[size]', humanReadableMaxFileSize);
        return this.state.attachmentList.size === 0 ? null : (
            <div className={styles.listWrapper}>
                <p className={styles.title}>{counterLabel}</p>
                <p className={styles.instructions}>{instructions}</p>
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
        const maxFileCount = new ServerInfoService().getServerParams()?.getMaxFileCount() ?? 0;
        Array.from(fileList).forEach((file) => {
            if ( this.state.attachmentList.size < maxFileCount && AttachmentService.fileCanBeAttached(file) ){
                this.state.attachmentList.set(file.name, { file: file, ref: null });
            }
        });
        this.forceUpdate();
        return this;
    }

    getAttachmentList(){
        return Array.from(this.state.attachmentList.values()).map((attachment) => attachment.file);
    }

    getMessageAttachmentList(){
        return new MessageAttachmentList({ attachmentFileList: this.getAttachmentList() });
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

export default withTranslation(null, { withRef: true })(AttachmentList);
