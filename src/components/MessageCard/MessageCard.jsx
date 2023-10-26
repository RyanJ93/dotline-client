'use strict';

import MessageContentWrapper from '../MessageContentWrapper/MessageContentWrapper';
import AttachmentViewer from '../AttachmentViewer/AttachmentViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StringUtils from '../../utils/StringUtils';
import MessageType from '../../enum/MessageType';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import styles from './MessageCard.scss';
import App from '../../facades/App';
import React from 'react';

class MessageCard extends React.Component {
    #messageContentWrapperRef = React.createRef();
    #attachmentViewerRef = React.createRef();
    #contextMenuRef = React.createRef();
    #messageCardRef = React.createRef();
    #longTouchTimeoutID = null;
    #parentMutationObserver;

    #isWithoutBackground(){
        const isWithoutBackground = StringUtils.isSingleEmoji(this.props.message.getContent());
        return isWithoutBackground || this.state.message.getType() === MessageType.STICKER;
    }

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
        const isEditable = ( this.state.message.getType() === MessageType.TEXT ), { t } = this.props;
        return (
            <React.Fragment>
                <div className={styles.contextMenuOpener} onClick={this._handleContextMenuOpenerClick}>
                    <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
                </div>
                <div className={styles.contextMenuWrapper} data-context-menu-enabled={this.state.contextmenuEnabled}>
                    <div className={styles.contextMenuOverlay} onClick={this._handleContextMenuOverlayClick}></div>
                    <ul className={styles.contextMenu + ' bg-black border-black text-white'} ref={this.#contextMenuRef}>
                        { isEditable && <li data-action-name={'edit'} onClick={this._handleContextMenuActionClick}><FontAwesomeIcon icon="fa-solid fa-pen" />{t('messageCard.contextMenu.edit')}</li> }
                        <li data-action-name={'delete-local'} onClick={this._handleContextMenuActionClick} className={'text-danger'}><FontAwesomeIcon icon="fa-solid fa-trash" />{t('messageCard.contextMenu.deleteLocal')}</li>
                        <li data-action-name={'delete-global'} onClick={this._handleContextMenuActionClick} className={'text-danger'}><FontAwesomeIcon icon="fa-solid fa-trash" />{t('messageCard.contextMenu.deleteGlobal')}</li>
                    </ul>
                </div>
            </React.Fragment>
        );
    }

    #renderEditedLabel(){
        return this.state.message.getIsEdited() ? (
            <span className={styles.editedLabel}>{this.props.t('messageCard.edited')}</span>
        ) : null;
    }

    _handleContextMenuActionClick(event){
        const action = event.target.closest('li').getAttribute('data-action-name');
        this.closeContextMenu();
        if ( typeof this.props.onMessageAction === 'function' ){
            this.props.onMessageAction(action, this.state.message);
        }
    }

    _handleContextMenuOverlayClick(){
        this.closeContextMenu();
    }

    _handleContextMenuOpenerClick(){
        this.openContextMenu();
    }

    _handleAttachmentClick(attachmentID, downloadedAttachmentList){
        if ( typeof this.props.onAttachmentClick === 'function' ){
            this.props.onAttachmentClick(attachmentID, downloadedAttachmentList);
        }
    }

    _handleTouchMove(){
        window.clearTimeout(this.#longTouchTimeoutID);
        this.#longTouchTimeoutID = null;
    }

    _handleTouchStart(event){
        const direction = event.target.closest('div[data-direction]')?.getAttribute('data-direction');
        const isLongTouchEventDisabled = event.target.closest('.long-touch-event-disabled') !== null;
        const isInMessageWrapper = event.target.closest('div.message-wrapper-hook') !== null;
        if ( !isInMessageWrapper || isLongTouchEventDisabled || direction !== 'sent' ){
            window.clearTimeout(this.#longTouchTimeoutID);
            this.#longTouchTimeoutID = null;
        }else if ( this.#longTouchTimeoutID === null ){
            this.#longTouchTimeoutID = window.setTimeout(() => this._handleLongTouch(), 250);
            event.stopPropagation();
            event.preventDefault();
        }
    }

    _handleLongTouch(){
        this.#longTouchTimeoutID = null;
        this.openContextMenu();
    }

    _handleTouchEnd(){
        window.clearTimeout(this.#longTouchTimeoutID);
        this.#longTouchTimeoutID = null;
    }

    constructor(props){
        super(props);

        this.state = { contextmenuEnabled: false, message: this.props.message, attachmentList: [] };
        this._handleContextMenuOverlayClick = this._handleContextMenuOverlayClick.bind(this);
        this._handleContextMenuOpenerClick = this._handleContextMenuOpenerClick.bind(this);
        this._handleContextMenuActionClick = this._handleContextMenuActionClick.bind(this);
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleLongTouch = this._handleLongTouch.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('messageEdit', (message) => {
            if ( message.getID() === this.state.message.getID() ){
                this.setState((prev) => ({ ...prev, message: message }));
            }
        });
        this.#setupParentMutationObserver();
    }

    componentWillUnmount(){
        this.#parentMutationObserver?.disconnect();
    }

    async loadAttachments(){
        await Promise.all([
            this.#messageContentWrapperRef.current?.fetchAttachments(),
            this.#attachmentViewerRef.current?.fetchAttachments()
        ]);
    }

    closeContextMenu(){
        this.setState((prev) => ({ ...prev, contextmenuEnabled: false }));
        return this;
    }

    openContextMenu(){
        if ( this.#messageCardRef.current.getAttribute('data-direction') === 'sent' ){
            const wrapperElement = this.#messageCardRef.current.closest('div.conversation-viewer-message-list-hook');
            const wrapperElementHeight = parseFloat(window.getComputedStyle(wrapperElement).height);
            const boundingClientRect = this.#messageCardRef.current.getBoundingClientRect();
            const position = boundingClientRect.y + boundingClientRect.height;
            const isInverted = position > ( wrapperElementHeight - 250 );
            this.#contextMenuRef.current.setAttribute('data-is-inverted', isInverted);
            this.setState((prev) => ({ ...prev, contextmenuEnabled: ( !prev.contextmenuEnabled ) }));
        }
        return this;
    }

    render(){
        const authenticatedUserID = App.getAuthenticatedUser().getID();
        const messageUserID = this.state.message.getUser()?.getID();
        const direction = messageUserID === authenticatedUserID ? 'sent' : 'received';
        const className = direction === 'sent' ? ' message-bubble-sent' : ' message-bubble-received';
        const showAttachmentViewer = this.state.message.getType() !== MessageType.VOICE_MESSAGE;
        return (
            <div className={styles.messageCard} data-direction={direction} data-message-id={this.state.message.getID()} ref={this.#messageCardRef} onTouchStart={this._handleTouchStart} onTouchMove={this._handleTouchMove} onTouchCancel={this._handleTouchEnd} onTouchEnd={this._handleTouchEnd}>
                <div className={styles.wrapper + className + ' message-wrapper-hook'} data-without-background={this.#isWithoutBackground()}>
                    <MessageContentWrapper message={this.state.message} ref={this.#messageContentWrapperRef} />
                    { showAttachmentViewer && <AttachmentViewer ref={this.#attachmentViewerRef} message={this.state.message} onAttachmentClick={this._handleAttachmentClick} /> }
                    <div className={styles.date}>{this.#renderEditedLabel()}{this.#getMessageTime()}</div>
                    { direction === 'sent' && this.#renderContextMenu() }
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageCard);
