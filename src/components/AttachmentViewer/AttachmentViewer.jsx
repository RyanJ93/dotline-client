'use strict';

import AttachmentService from '../../services/AttachmentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import FileUtils from '../../utils/FileUtils';
import styles from './AttachmentViewer.scss';
import React from 'react';

class AttachmentViewer extends React.Component {
    static #getSizingMapping(imageCount){
        let sizes = [];
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

    #attachmentFetched = false;

    #getGroupedAttachments(){
        const groupedAttachments = { images: [], videos: [], audios: [], others: [] };
        this.state.downloadedAttachmentList.forEach((downloadedAttachment) => {
            const mimetype = downloadedAttachment.getMimetype();
            if ( FileUtils.isSupportedImage(mimetype) ){
                groupedAttachments.images.push(downloadedAttachment);
            }else if ( mimetype.indexOf('audio') === 0 && FileUtils.isSupportedAudio(mimetype) ){
                groupedAttachments.audios.push(downloadedAttachment);
            }else if ( FileUtils.isSupportedVideo(mimetype) ){
                groupedAttachments.videos.push(downloadedAttachment);
            }else{
                groupedAttachments.others.push(downloadedAttachment);
            }
        });
        return groupedAttachments;
    }

    #renderImageAttachments(renderedAttachmentList, groupedAttachments){
        const sizingMapping = AttachmentViewer.#getSizingMapping(groupedAttachments.images.length);
        let remainingAttachments = groupedAttachments.images.length - 4, n = 0;
        for ( let i = 0 ; i < groupedAttachments.images.length ; i++ ){
            const objectURL = groupedAttachments.images[i].getObjectURL();
            const filename = groupedAttachments.images[i].getFilename();
            const id = groupedAttachments.images[i].getID();
            n++;
            if ( n === 4 && remainingAttachments > 0 ){
                renderedAttachmentList.push(
                    <div key={id} className={styles.previewWrapper} data-size={sizingMapping[n - 1]} data-aid={id} data-at={'image'} onClick={this._handleAttachmentClick}>
                        <img src={objectURL} alt={filename} onClick={this._handleAttachmentClick} />
                        <p className={styles.remainingAttachmentCounter + ' text-white'}>+{remainingAttachments}</p>
                    </div>
                );
                break;
            }
            renderedAttachmentList.push(
                <div key={id} className={styles.previewWrapper} data-size={sizingMapping[n - 1]} data-aid={id} data-at={'image'} onClick={this._handleAttachmentClick}>
                    <img src={objectURL} alt={filename} onClick={this._handleAttachmentClick} />
                </div>
            );
        }
    }

    #renderVideoAttachments(renderedAttachmentList, groupedAttachments){
        groupedAttachments.videos.forEach((attachment) => {
            const id = attachment.getID(), { t } = this.props;
            renderedAttachmentList.push(
                <div key={id} className={styles.previewWrapper} data-aid={id} data-at={'video'}>
                    <div className={styles.videoDownloadIconWrapper + ' bg-black'}>
                        <a className={'text-white'} download={attachment.getFilename()} href={attachment.getObjectURL()} title={t('attachmentViewer.downloadTitle')}>
                            <FontAwesomeIcon icon='fa-solid fa-download' />
                        </a>
                    </div>
                    <video controls={true} onPlaying={this._handlePlay}>
                        <source src={attachment.getObjectURL()} type={attachment.getMimetype()} />
                    </video>
                </div>
            );
        });
    }

    #renderAudioAttachments(renderedAttachmentList, groupedAttachments){
        groupedAttachments.audios.forEach((attachment) => {
            const id = attachment.getID(), { t } = this.props;
            renderedAttachmentList.push(
                <div key={id} className={styles.previewWrapper} data-aid={id} data-at={'audio'}>
                    <div className={styles.audioPlayerWrapper}>
                        <audio src={attachment.getObjectURL()} controls={true} onPlaying={this._handlePlay}></audio>
                        <div className={styles.audioDownloadIconWrapper}>
                            <a className={'text-primary'} download={attachment.getFilename()} href={attachment.getObjectURL()} title={t('attachmentViewer.downloadTitle')}>
                                <FontAwesomeIcon icon='fa-solid fa-download' />
                            </a>
                        </div>
                    </div>
                </div>
            );
        });
    }

    #renderOtherAttachments(renderedAttachmentList, groupedAttachments){
        groupedAttachments.others.forEach((attachment) => {
            const id = attachment.getID(), { t } = this.props;
            renderedAttachmentList.push(
                <div key={id} className={styles.previewWrapper} data-aid={id} data-at={'other'}>
                    <div className={styles.genericFilePreview}>
                        <div className={styles.fileIcon}>
                            <FontAwesomeIcon icon={FileUtils.getFileIconClass(attachment.getMimetype())} />
                        </div>
                        <div className={styles.fileInfo}>
                            <p className={styles.fileName}>{attachment.getFilename()}</p>
                            <p className={styles.fileSize}>{attachment.getHumanReadableSize()}</p>
                        </div>
                        <div className={styles.controls}>
                            <a className={'text-primary'} download={attachment.getFilename()} href={attachment.getObjectURL()} title={t('attachmentViewer.downloadTitle')}>
                                <FontAwesomeIcon icon='fa-solid fa-download' />
                            </a>
                        </div>
                    </div>
                </div>
            );
        });
    }

    #renderAttachments(){
        const length = this.state.downloadedAttachmentList.length, renderedAttachmentList = [];
        const groupedAttachments = this.#getGroupedAttachments();
        this.#renderImageAttachments(renderedAttachmentList, groupedAttachments);
        this.#renderVideoAttachments(renderedAttachmentList, groupedAttachments);
        this.#renderAudioAttachments(renderedAttachmentList, groupedAttachments);
        this.#renderOtherAttachments(renderedAttachmentList, groupedAttachments);
        return length === 0 ? null : <div className={styles.container}>{renderedAttachmentList}</div>;
    }

    _handleAttachmentClick(event){
        const attachmentID = event.target.closest('div[data-aid][data-at="image"]').getAttribute('data-aid');
        if ( typeof this.props.onAttachmentClick === 'function' ){
            this.props.onAttachmentClick(attachmentID, this.state.downloadedAttachmentList);
        }
    }

    _handlePlay(event){
        document.querySelectorAll('video, audio').forEach((element) => {
            if ( event.target !== element ){
                element.pause();
            }
        });
    }

    constructor(props){
        super(props);

        this.state = { message: this.props.message, downloadedAttachmentList: [] };
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
        this._handlePlay = this._handlePlay.bind(this);
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
        return <div className={styles.attachmentViewer}>{this.#renderAttachments()}</div>;
    }
}

export default withTranslation(null, { withRef: true })(AttachmentViewer);
