'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConversationDraft from '../../DTOs/ConversationDraft';
import UserService from '../../services/UserService';
import styles from './ConversationViewerHeader.scss';
import Conversation from '../../models/Conversation';
import EntityIcon from '../EntityIcon/EntityIcon';
import DateLabel from '../DateLabel/DateLabel';
import Event from '../../facades/Event';
import App from '../../facades/App';
import React from 'react';

class ConversationViewerHeader extends React.Component {
    #checkUserOnlineStatusIntervalID = null;
    #userTypingMessageTimeoutID = null;

    #getDMConversationUser(){
        let DMConversationUser = null;
        if ( this.state.conversation?.isDMConversation() === true ){
            if ( this.state.conversation instanceof ConversationDraft ){
                DMConversationUser = this.state.conversation.getMembers()[0];
                if ( DMConversationUser.getID() === App.getAuthenticatedUser().getID() ){
                    DMConversationUser = this.state.conversation.getMembers()[1];
                }
            }else if ( this.state.conversation instanceof Conversation ){
                DMConversationUser = this.state.conversation.getMembers()[0].getUser();
                if ( DMConversationUser.getID() === App.getAuthenticatedUser().getID() ){
                    DMConversationUser = this.state.conversation.getMembers()[1].getUser();
                }
            }
        }
        return DMConversationUser;
    }

    #checkUserOnlineStatus(){
        window.clearInterval(this.#checkUserOnlineStatusIntervalID);
        const DMConversationUser = this.#getDMConversationUser();
        if ( DMConversationUser !== null ){
            this.#checkUserOnlineStatusIntervalID = window.setInterval(async () => {
                const userMap = await new UserService().checkOnlineUsers([DMConversationUser.getID()]);
                this.setState((prev) => ({ ...prev, isUserOnline: userMap[DMConversationUser.getID()] === true }));
            }, 3000);
        }
    }

    #renderHeaderBarConversationOperations(){
        return this.state.conversation instanceof Conversation ? (
            <div className={styles.controlsWrapper}>
                <div onClick={this._handleContextMenuOpenerClick}>
                    <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                </div>
                <div className={styles.contextMenuWrapper} data-context-menu-enabled={this.state.contextmenuEnabled}>
                    <div className={styles.contextMenuOverlay} onClick={this._handleContextMenuOverlayClick}></div>
                    <ul className={styles.contextMenu}>
                        <li data-action-name={'delete-local'} className={styles.dangerousAction} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-trash" /> Delete (for me)</li>
                        <li data-action-name={'delete-global'} className={styles.dangerousAction} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-trash" /> Delete (for everyone)</li>
                    </ul>
                </div>
            </div>
        ) : null;
    }

    #renderLastAccessLabel(){
        let lastAccessLabel = <p className={styles.lastAccess}>{'Last seen'} {this.#computeLastAccessDate()}</p>;
        if ( this.state.userTypingMessage !== null ){
            lastAccessLabel = <p className={styles.lastAccess}>{this.state.userTypingMessage}</p>;
        }else if ( this.state.isUserOnline ){
            lastAccessLabel = <p className={styles.lastAccess}>{'Now active'}</p>;
        }
        return lastAccessLabel;
    }

    #computeLastAccessDate(){
        let lastAccessDate = null, DMConversationUser = this.#getDMConversationUser();
        if ( DMConversationUser !== null && DMConversationUser.getLastAccess() !== null ){
            lastAccessDate = <DateLabel date={DMConversationUser.getLastAccess()} />;
        }
        return lastAccessDate;
    }

    _handleUserTyping(conversation, user){
        if ( this.state.conversation instanceof Conversation && conversation instanceof Conversation ){
            const isThisConversation = conversation.getID() === this.state.conversation.getID();
            const isEventReferredToMe = user.getID() === App.getAuthenticatedUser().getID();
            if ( isThisConversation && !isEventReferredToMe ){
                if ( this.#userTypingMessageTimeoutID !== null ){
                    window.clearTimeout(this.#userTypingMessageTimeoutID);
                }
                this.setState((prev) => { return { ...prev, userTypingMessage: 'Typing...' } });
                this.#userTypingMessageTimeoutID = window.setTimeout(() => {
                    this.setState((prev) => { return { ...prev, userTypingMessage: null } });
                }, 2000);
            }
        }
    }

    _handleContextMenuActionClick(event){
        const action = event.target.closest('li').getAttribute('data-action-name');
        this.setState((prev) => ({ ...prev, contextmenuEnabled: false }));
        if ( typeof this.props.onConversationAction === 'function' ){
            this.props.onConversationAction(action, this.state.conversation);
        }
    }

    _handleContextMenuOpenerClick(){
        this.setState((prev) => ({ ...prev, contextmenuEnabled: ( !prev.contextmenuEnabled ) }));
    }

    _handleContextMenuOverlayClick(){
        this.setState((prev) => ({ ...prev, contextmenuEnabled: false }));
    }

    _handleBackIconClick(){
        if ( typeof this.props.onConversationClose === 'function' ){
            this.props.onConversationClose();
        }
    }

    constructor(props){
        super(props);

        this._handleContextMenuOverlayClick = this._handleContextMenuOverlayClick.bind(this);
        this._handleContextMenuOpenerClick = this._handleContextMenuOpenerClick.bind(this);
        this._handleContextMenuActionClick = this._handleContextMenuActionClick.bind(this);
        this._handleBackIconClick = this._handleBackIconClick.bind(this);
        this._handleUserTyping = this._handleUserTyping.bind(this);
        this.state = {
            conversation: ( this.props.conversation ?? null ),
            contextmenuEnabled: false,
            userTypingMessage: null,
            isUserOnline: false
        };
    }

    componentWillUnmount(){
        window.clearInterval(this.#checkUserOnlineStatusIntervalID);
        window.clearTimeout(this.#userTypingMessageTimeoutID);
    }

    componentDidMount(){
        Event.getBroker().on('userTyping', this._handleUserTyping);
        this.#checkUserOnlineStatus();
    }

    render(){
        const conversationName = this.state.conversation === null ? null : this.state.conversation.getComputedName();
        const onlineBadge = this.state.isUserOnline ? <div className={styles.onlineBadge} /> : null;
        return conversationName === null ? null : (
            <section className={styles.conversationViewerHeader}>
                <div>
                    <div className={styles.backIconWrapper} onClick={this._handleBackIconClick}>
                        <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
                    </div>
                    <EntityIcon text={conversationName} />
                </div>
                <div className={styles.conversationInfo}>
                    <div>
                        <span className={styles.conversationName}>{conversationName}</span>
                        {onlineBadge}
                    </div>
                    {this.#renderLastAccessLabel()}
                </div>
                {this.#renderHeaderBarConversationOperations()}
            </section>
        );
    }
}

export default ConversationViewerHeader;
