'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './AttachmentLightBox.scss';
import React from 'react';

class AttachmentLightBox extends React.Component {
    #renderMainContent(){
        const downloadedAttachment = this.state.downloadedAttachmentList[this.state.currentIndex] ?? null;
        return downloadedAttachment === null ? null : (
            <div className={styles.image} style={{ backgroundImage: 'url(' + downloadedAttachment.getObjectURL() + ')' }} />
        );
    }

    #renderPreviewList(){
        const renderedPreviewList = this.state.downloadedAttachmentList.map((downloadedAttachment, index) => {
            return (
                <li key={index} data-index={index} data-selected={index === this.state.currentIndex} onClick={this._handlePreviewClick}>
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
        this.setState((prev) => ({ ...prev, currentIndex: nextIndex, show: true }));
    }

    _handleLeftArrowClick(){
        let nextIndex = this.state.currentIndex - 1;
        if ( nextIndex < 0 ){
            nextIndex = this.state.downloadedAttachmentList.length;
        }
        this.setState((prev) => ({ ...prev, currentIndex: nextIndex, show: true }));
    }

    _handleCloseButtonClick(){
        this.hide();
    }

    _handlePreviewClick(event){
        const nextIndex = parseInt(event.target.closest('li[data-index]').getAttribute('data-index'));
        this.setState((prev) => ({ ...prev, currentIndex: nextIndex, show: true }));
    }

    constructor(props){
        super(props);

        this.state = { downloadedAttachmentList: [], currentIndex: 0, show: false };
        this._handleCloseButtonClick = this._handleCloseButtonClick.bind(this);
        this._handleRightArrowClick = this._handleRightArrowClick.bind(this);
        this._handleLeftArrowClick = this._handleLeftArrowClick.bind(this);
        this._handlePreviewClick = this._handlePreviewClick.bind(this);
    }

    setDownloadedAttachmentList(downloadedAttachmentList){
        this.setState((prev) => ({ ...prev, downloadedAttachmentList: downloadedAttachmentList }));
        return this;
    }

    show(index = 0){
        this.setState((prev) => ({ ...prev, currentIndex: index, show: true }));
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
