'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import styles from './AttachmentLightBox.scss';
import FileUtils from '../../utils/FileUtils';
import React from 'react';

class AttachmentLightBox extends React.Component {
    #previewListWrapperRef = React.createRef();

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
        return <ul className={styles.previewList + ' border-white'}>{renderedPreviewList}</ul>;
    }

    #renderRightControl(){
        let renderedRightControl = null;
        if ( this.state.downloadedAttachmentList.length > 1 ){
            renderedRightControl = (
                <div className={styles.controlWrapper} onClick={this._handleRightArrowClick}>
                    <FontAwesomeIcon icon='fa-solid fa-chevron-circle-right' />
                </div>
            );
        }
        return renderedRightControl;
    }

    #renderLeftControl(){
        let renderedLeftControl = null;
        if ( this.state.downloadedAttachmentList.length > 1 ){
            renderedLeftControl = (
                <div className={styles.controlWrapper} onClick={this._handleLeftArrowClick}>
                    <FontAwesomeIcon icon='fa-solid fa-chevron-circle-left' />
                </div>
            );
        }
        return renderedLeftControl;
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

    _handleDownloadButtonClick(){
        const downloadedAttachment = this.state.downloadedAttachmentList[this.state.currentIndex];
        FileUtils.downloadFile(downloadedAttachment.getObjectURL(), downloadedAttachment.getFilename());
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
        this._handleDownloadButtonClick = this._handleDownloadButtonClick.bind(this);
        this._handleCloseButtonClick = this._handleCloseButtonClick.bind(this);
        this._handleRightArrowClick = this._handleRightArrowClick.bind(this);
        this._handleLeftArrowClick = this._handleLeftArrowClick.bind(this);
        this._handlePreviewClick = this._handlePreviewClick.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        const element = this.#previewListWrapperRef.current.querySelector('ul li[data-selected="true"]');
        element?.scrollIntoView();
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
        const { t } = this.props;
        return (
            <div className={styles.attachmentLightBox} data-show={this.state.show}>
                <div className={styles.header + ' text-white'}>
                    <div className={styles.downloadIcon}>
                        <FontAwesomeIcon icon='fa-solid fa-download' onClick={this._handleDownloadButtonClick} title={t('attachmentLightBox.title.download')} />
                    </div>
                    <div className={styles.closeIcon}>
                        <FontAwesomeIcon icon='fa-solid fa-xmark' onClick={this._handleCloseButtonClick} title={t('attachmentLightBox.title.close')} />
                    </div>
                </div>
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className={styles.leftControls + ' text-white'}>{this.#renderLeftControl()}</div>
                        <div className={styles.mainContent}>{this.#renderMainContent()}</div>
                        <div className={styles.rightControls + ' text-white'}>{this.#renderRightControl()}</div>
                    </div>
                </div>
                <div className={styles.previewListContainer} ref={this.#previewListWrapperRef}>{this.#renderPreviewList()}</div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AttachmentLightBox);
