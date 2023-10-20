'use strict';

import UserOnlineStatusService from '../../services/UserOnlineStatusService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConversationDraft from '../../DTOs/ConversationDraft';
import styles from './ConversationViewerHeader.scss';
import Conversation from '../../models/Conversation';
import EntityIcon from '../EntityIcon/EntityIcon';
import { withTranslation } from 'react-i18next';
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
            this.#checkUserOnlineStatusIntervalID = window.setInterval(() => {
                const isUserOnline = new UserOnlineStatusService().isUserOnline(DMConversationUser.getID());
                this.setState((prev) => ({ ...prev, isUserOnline: isUserOnline }));
            }, 3000);
        }
    }

    #renderHeaderBarConversationOperations(){
        const { t } = this.props;
        return this.state.conversation instanceof Conversation ? (
            <div className={styles.controlsWrapper}>
                <div onClick={this._handleContextMenuOpenerClick}>
                    <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                </div>
                <div className={styles.contextMenuWrapper} data-context-menu-enabled={this.state.contextmenuEnabled}>
                    <div className={styles.contextMenuOverlay} onClick={this._handleContextMenuOverlayClick}></div>
                    <ul className={styles.contextMenu}>
                        <li data-action-name={'delete-local'} className={'text-danger'} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-trash" />{t('conversationViewerHeader.contextMenu.deleteLocal')}</li>
                        <li data-action-name={'delete-global'} className={'text-danger'} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-trash" />{t('conversationViewerHeader.contextMenu.deleteGlobal')}</li>
                    </ul>
                </div>
            </div>
        ) : null;
    }

    #renderLastAccessLabel(){
        const { t } = this.props;
        let lastAccessLabel = <p className={styles.lastAccess}>{t('conversationViewerHeader.lastSeen')} {this.#computeLastAccessDate()}</p>;
        if ( this.state.userTypingMessage !== null ){
            lastAccessLabel = <p className={styles.lastAccess}>{this.state.userTypingMessage}</p>;
        }else if ( this.state.isUserOnline ){
            lastAccessLabel = <p className={styles.lastAccess}>{t('conversationViewerHeader.nowActive')}</p>;
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

    #renderEntityIcon(){
        if ( this.state.conversation instanceof Conversation && this.state.conversation.isDMConversation() ){
            const members = this.state.conversation.getMembers(), userID = App.getAuthenticatedUser().getID();
            const user = members[0].getUser().getID() === userID ? members[1].getUser() : members[0].getUser();
            return <EntityIcon user={user} />;
        }
        return <EntityIcon text={this.state.conversation.getComputedName()} />;
    }

    _handleUserTyping(conversation, user){
        if ( this.state.conversation instanceof Conversation && conversation instanceof Conversation ){
            const isThisConversation = conversation.getID() === this.state.conversation.getID();
            const { t } = this.props, userTypingMessage = t('conversationViewerHeader.typing');
            const isEventReferredToMe = user.getID() === App.getAuthenticatedUser().getID();
            if ( isThisConversation && !isEventReferredToMe ){
                if ( this.#userTypingMessageTimeoutID !== null ){
                    window.clearTimeout(this.#userTypingMessageTimeoutID);
                }
                this.setState((prev) => ({ ...prev, userTypingMessage: userTypingMessage }));
                this.#userTypingMessageTimeoutID = window.setTimeout(() => {
                    this.setState((prev) => ({ ...prev, userTypingMessage: null }));
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
        const onlineBadge = this.state.isUserOnline ? <div className={styles.onlineBadge + ' bg-success'} /> : null;
        return conversationName === null ? null : (
            <section className={styles.conversationViewerHeader + ' border-primary text-primary'}>
                <div>
                    <div className={styles.backIconWrapper} onClick={this._handleBackIconClick}>
                        <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
                    </div>
                    {this.#renderEntityIcon()}
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

export default withTranslation(null, { withRef: true })(ConversationViewerHeader);
