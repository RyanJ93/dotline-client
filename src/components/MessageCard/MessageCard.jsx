'use strict';

import AttachmentViewer from '../AttachmentViewer/AttachmentViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MessageContent from '../MessageContent/MessageContent';
import Event from '../../facades/Event';
import styles from './MessageCard.scss';
import App from '../../facades/App';
import React from 'react';

class MessageCard extends React.Component {
    #attachmentViewerRef = React.createRef();
    #messageCardRef = React.createRef();
    #parentMutationObserver;

    #getMessageTime(){
        let time = ( '0' + this.state.message.getCreatedAt().getHours() ).slice(-2);
        time += ':' + ( '0' + this.state.message.getCreatedAt().getMinutes() ).slice(-2);
        return time;
    }

    #setupParentMutationObserver(){
        const parent = this.#messageCardRef.current.closest('li[data-in-viewport]');
        this.#parentMutationObserver = new MutationObserver(() => {
            if ( parent.getAttribute('data-in-viewport') === 'true' ){
                this.loadAttachments();
            }
        });
        this.#parentMutationObserver.observe(parent, { attributes: true, childList: false, subtree: false });
    }

    #renderContextMenu(){
        return (
            <React.Fragment>
                <div className={styles.contextMenuOpener} onClick={this._handleContextMenuOpenerClick}>
                    <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
                </div>
                <div className={styles.contextMenuWrapper} data-context-menu-enabled={this.state.contextmenuEnabled}>
                    <div className={styles.contextMenuOverlay} onClick={this._handleContextMenuOverlayClick}></div>
                    <ul className={styles.contextMenu}>
                        <li data-action-name={'edit'} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-pen" /> Edit</li>
                        <li data-action-name={'delete-local'} onClick={this._handleContextMenuActionClick} className={styles.dangerousAction}><FontAwesomeIcon icon="fa-solid fa-trash" /> Delete (for me)</li>
                        <li data-action-name={'delete-global'} onClick={this._handleContextMenuActionClick} className={styles.dangerousAction}><FontAwesomeIcon icon="fa-solid fa-trash" /> Delete (for everyone)</li>
                    </ul>
                </div>
            </React.Fragment>
        );
    }

    #renderEditedLabel(){
        return this.state.message.getIsEdited() ? (
            <span className={styles.editedLabel}>edited</span>
        ) : null;
    }

    _handleContextMenuActionClick(event){
        const action = event.target.closest('li').getAttribute('data-action-name');
        this.setState((prev) => ({ ...prev, contextmenuEnabled: false }));
        if ( typeof this.props.onMessageAction === 'function' ){
            this.props.onMessageAction(action, this.state.message);
        }
    }

    _handleContextMenuOverlayClick(){
        this.setState((prev) => ({ ...prev, contextmenuEnabled: false }));
    }

    _handleContextMenuOpenerClick(){
        this.setState((prev) => ({ ...prev, contextmenuEnabled: ( !prev.contextmenuEnabled ) }));
    }

    _handleMessageEdit(message){
        if ( message.getID() === this.state.message.getID() ){
            this.setState((prev) => ({ ...prev, message: message }));
        }
    }

    _handleAttachmentClick(index, downloadedAttachmentList){
        if ( typeof this.props.onAttachmentClick === 'function' ){
            this.props.onAttachmentClick(index, downloadedAttachmentList);
        }
    }

    constructor(props){
        super(props);

        this.state = { contextmenuEnabled: false, message: this.props.message, attachmentList: [] };
        this._handleContextMenuOverlayClick = this._handleContextMenuOverlayClick.bind(this);
        this._handleContextMenuOpenerClick = this._handleContextMenuOpenerClick.bind(this);
        this._handleContextMenuActionClick = this._handleContextMenuActionClick.bind(this);
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
        this._handleMessageEdit = this._handleMessageEdit.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('messageEdit', this._handleMessageEdit);
        this.#setupParentMutationObserver();
    }

    componentWillUnmount(){
        this.#parentMutationObserver?.disconnect();
    }

    async loadAttachments(){
        await this.#attachmentViewerRef.current.fetchAttachments();
    }

    render(){
        const authenticatedUserID = App.getAuthenticatedUser().getID();
        const messageUserID = this.state.message.getUser()?.getID();
        const direction = messageUserID === authenticatedUserID ? 'sent' : 'received';
        return (
            <div className={styles.messageCard} data-direction={direction} data-message-id={this.state.message.getID()} ref={this.#messageCardRef}>
                <div className={styles.wrapper}>
                    <MessageContent message={this.state.message} />
                    <div className={styles.date}>{this.#renderEditedLabel()}{this.#getMessageTime()}</div>
                    <AttachmentViewer ref={this.#attachmentViewerRef} message={this.state.message} onAttachmentClick={this._handleAttachmentClick} />
                    {direction === 'sent' ? this.#renderContextMenu() : null}
                </div>
            </div>
        );
    }
}

export default MessageCard;
