'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './AttachmentLightBox.scss';
import React from 'react';

class AttachmentLightBox extends React.Component {
    #findAttachmentByID(attachmentID){
        let downloadedAttachmentIndex = null, i = 0;
        while ( downloadedAttachmentIndex === null && i < this.state.downloadedAttachmentList.length ){
            if ( this.state.downloadedAttachmentList[i].getID() === attachmentID ){
                downloadedAttachmentIndex = i;
            }
            i++;
        }
        return downloadedAttachmentIndex;
    }

    #renderMainContent(){
        let selectedDownloadedAttachment = null;
        if ( typeof this.state.currentID === 'string' ){
            const currentIndex = this.#findAttachmentByID(this.state.currentID);
            selectedDownloadedAttachment = this.state.downloadedAttachmentList[currentIndex];
        }
        return selectedDownloadedAttachment === null ? null : (
            <div className={styles.image} style={{ backgroundImage: 'url(' + selectedDownloadedAttachment.getObjectURL() + ')' }} />
        );
    }

    #renderPreviewList(){
        const renderedPreviewList = this.state.downloadedAttachmentList.map((downloadedAttachment) => {
            const id = downloadedAttachment.getID();
            return (
                <li key={id} data-aid={id} data-selected={id === this.state.currentID} onClick={this._handlePreviewClick}>
                    <div className={styles.previewImage} style={{ backgroundImage: 'url(' + downloadedAttachment.getObjectURL() + ')' }} />
                </li>
            );
        });
        return <ul className={styles.previewList}>{renderedPreviewList}</ul>;
    }

    _handleRightArrowClick(){
        let nextIndex = this.state.currentIndex + 1;
        if ( nextIndex > ( this.state.downloadedAttachmentList.length - 1 ) ){
            nextIndex = 0;
        }
        const currentID = this.state.downloadedAttachmentList[nextIndex].getID();
        this.setState((prev) => ({ ...prev, currentIndex: nextIndex, currentID: currentID, show: true }));
    }

    _handleLeftArrowClick(){
        let nextIndex = this.state.currentIndex - 1;
        if ( nextIndex < 0 ){
            nextIndex = this.state.downloadedAttachmentList.length - 1;
        }
        const currentID = this.state.downloadedAttachmentList[nextIndex].getID();
        this.setState((prev) => ({ ...prev, currentIndex: nextIndex, currentID: currentID, show: true }));
    }

    _handleCloseButtonClick(){
        this.hide();
    }

    _handlePreviewClick(event){
        const currentID = event.target.closest('li[data-aid]').getAttribute('data-aid');
        const currentIndex = this.#findAttachmentByID(currentID);
        this.setState((prev) => ({ ...prev, currentIndex: currentIndex, currentID: currentID, show: true }));
    }

    constructor(props){
        super(props);

        this.state = { downloadedAttachmentList: [], currentIndex: 0, currentID: null, show: false };
        this._handleCloseButtonClick = this._handleCloseButtonClick.bind(this);
        this._handleRightArrowClick = this._handleRightArrowClick.bind(this);
        this._handleLeftArrowClick = this._handleLeftArrowClick.bind(this);
        this._handlePreviewClick = this._handlePreviewClick.bind(this);
    }

    setDownloadedAttachmentList(downloadedAttachmentList){
        downloadedAttachmentList = downloadedAttachmentList.filter((downloadedAttachment) => {
            return downloadedAttachment.getMimetype().indexOf('image/') === 0;
        });
        this.setState((prev) => ({ ...prev, downloadedAttachmentList: downloadedAttachmentList }));
        return this;
    }

    show(attachmentID = null){
        this.setState((prev) => ({ ...prev, currentID: attachmentID, show: true }));
        return this;
    }

    hide(){
        this.setState((prev) => ({ ...prev, show: false }));
        return this;
    }

    render(){
        return (
            <div className={styles.attachmentLightBox} data-show={this.state.show}>
                <div className={styles.header}>
                    <FontAwesomeIcon icon='fa-solid fa-xmark' onClick={this._handleCloseButtonClick} />
                </div>
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className={styles.leftControls}>
                            <FontAwesomeIcon icon='fa-solid fa-chevron-circle-left' onClick={this._handleLeftArrowClick} />
                        </div>
                        <div className={styles.mainContent}>{this.#renderMainContent()}</div>
                        <div className={styles.rightControls}>
                            <FontAwesomeIcon icon='fa-solid fa-chevron-circle-right' onClick={this._handleRightArrowClick} />
                        </div>
                    </div>
                </div>
                <div className={styles.previewListContainer}>{this.#renderPreviewList()}</div>
            </div>
        );
    }
}

export default AttachmentLightBox;
