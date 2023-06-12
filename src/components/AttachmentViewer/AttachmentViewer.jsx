'use strict';

import AttachmentService from '../../services/AttachmentService';
import styles from './AttachmentViewer.scss';
import React from 'react';

class AttachmentViewer extends React.Component {
    #attachmentFetched = false;

    #getImageAttachmentCount(){
        return this.state.downloadedAttachmentList.reduce((accumulator, downloadedAttachment) => {
            if ( downloadedAttachment.getMimetype().indexOf('image/') === 0 ){
                accumulator++;
            }
            return accumulator;
        }, 0);
    }

    #getSizingMapping(){
        let sizes = [], imageCount = this.#getImageAttachmentCount();
        if ( imageCount === 1 ){
            sizes = [1];
        }else if ( imageCount === 2 ){
            sizes = [2, 2];
        }else if ( imageCount === 3 ){
            sizes = [2, 4, 4];
        }else if ( imageCount >= 4 ){
            sizes = [4, 4, 4, 4];
        }
        return sizes;
    }

    #renderAttachments(){
        const remainingAttachments = this.state.downloadedAttachmentList.length - 4;
        const renderedAttachmentList = [], sizes = this.#getSizingMapping();
        sizes.forEach((size, index) => {
            const objectURL = this.state.downloadedAttachmentList[index].getObjectURL();
            const filename = this.state.downloadedAttachmentList[index].getFilename();
            if ( index === 3 && remainingAttachments > 0 ){
                return renderedAttachmentList.push(
                    <div className={styles.previewWrapper} data-size={size} data-index={index} onClick={this._handleAttachmentClick}>
                        <img key={index} src={objectURL} alt={filename} onClick={this._handleAttachmentClick} />
                        <p className={styles.remainingAttachmentCounter}>+{remainingAttachments}</p>
                    </div>
                );
            }
            renderedAttachmentList.push(
                <div key={index} className={styles.previewWrapper} data-size={size} data-index={index} onClick={this._handleAttachmentClick}>
                    <img src={objectURL} alt={filename} onClick={this._handleAttachmentClick} />
                </div>
            );
        });
        this.state.downloadedAttachmentList.forEach(() => {

        });
        return sizes.length === 0 ? null : <div className={styles.container}>{renderedAttachmentList}</div>;
    }

    _handleAttachmentClick(event){
        const index = parseInt(event.target.closest('div[data-index]').getAttribute('data-index'));
        if ( typeof this.props.onAttachmentClick === 'function' ){
            this.props.onAttachmentClick(index, this.state.downloadedAttachmentList);
        }
    }

    constructor(props){
        super(props);

        this.state = { message: this.props.message, downloadedAttachmentList: [] };
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
    }

    async fetchAttachments(){
        if ( this.state.message.getAttachments().length > 0 && !this.#attachmentFetched ){
            this.#attachmentFetched = true;
            const downloadedAttachmentList = await Promise.all(this.state.message.getAttachments().map((attachment) => {
                return new AttachmentService(this.state.message).fetchAttachment(attachment);
            }));
            this.setState((prev) => ({ ...prev, downloadedAttachmentList: downloadedAttachmentList }));
        }
    }

    render(){
        return (
            <div className={styles.attachmentViewer}>{this.#renderAttachments()}</div>
        );
    }
}

export default AttachmentViewer;
