'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Event from '../../facades/Event';
import styles from './MessageCard.scss';
import App from '../../facades/App';
import React from 'react';

class MessageCard extends React.Component {
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

    #getMessageTime(){
        let time = ( '0' + this.state.message.getCreatedAt().getHours() ).slice(-2);
        time += ':' + ( '0' + this.state.message.getCreatedAt().getMinutes() ).slice(-2);
        return time;
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

    _handleMessageEdit(message){
        if ( message.getID() === this.state.message.getID() ){
            this.setMessage(message);
        }
    }

    constructor(props){
        super(props);

        this._handleContextMenuOverlayClick = this._handleContextMenuOverlayClick.bind(this);
        this._handleContextMenuOpenerClick = this._handleContextMenuOpenerClick.bind(this);
        this._handleContextMenuActionClick = this._handleContextMenuActionClick.bind(this);
        this._handleMessageEdit = this._handleMessageEdit.bind(this);
        this.state = { contextmenuEnabled: false, message: this.props.message };
    }

    setMessage(message){
        this.setState((prev) => ({ ...prev, message: message }));
        return this;
    }

    getMessage(){
        return this.state.message;
    }

    componentDidMount(){
        Event.getBroker().on('messageEdit', this._handleMessageEdit);
    }

    render(){
        const authenticatedUserID = App.getAuthenticatedUser().getID();
        const messageUserID = this.state.message.getUser()?.getID();
        const direction = messageUserID === authenticatedUserID ? 'sent' : 'received';
        return (
            <div className={styles.messageCard} data-direction={direction} data-message-id={this.state.message.getID()}>
                <div className={styles.wrapper}>
                    <span>{this.state.message.getContent()}</span>
                    <div className={styles.date}>{this.#renderEditedLabel()}{this.#getMessageTime()}</div>
                    {direction === 'sent' ? this.#renderContextMenu() : null}
                </div>
            </div>
        );
    }
}

export default MessageCard;
