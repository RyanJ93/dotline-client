'use strict';

import ConversationDeleteEventListener from '../listeners/ConversationDeleteEventListener';
import WebSocketClientInjector from '../services/injectors/WebSocketClientInjector';
import MessageDeleteEventListener from '../listeners/MessageDeleteEventListener';
import MessageEditEventListener from '../listeners/MessageEditEventListener';
import EventBrokerInjector from '../services/injectors/EventBrokerInjector';
import UserTypingEventListener from '../listeners/UserTypingEventListener';
import MessageEventListener from '../listeners/MessageEventListener';
import MessageSyncManager from '../support/MessageSyncManager';
import InjectionManager from '../support/InjectionManager';
import WebSocketClient from '../support/WebSocketClient';
import Event from '../facades/Event';
import Provider from './Provider';

class EventProvider extends Provider {
    /**
     * Registers external events listeners.
     */
    static #registerListeners(){
        const eventBrokerInjector = new EventBrokerInjector();
        eventBrokerInjector.inject().on('ext:conversationDelete', ConversationDeleteEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:messageDelete', MessageDeleteEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:messageEdit', MessageEditEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:userTyping', UserTypingEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:message', MessageEventListener.getClosure());
    }

    /**
     * Registers connection related events listeners.
     */
    static #registerConnectionStatusListeners(){
        Event.getBroker().on('WSReconnected', () => MessageSyncManager.getInstance().initMessageSync());
        window.addEventListener('online', () => MessageSyncManager.getInstance().initMessageSync());
    }

    /**
     * Sets up event management mechanism and general event listeners.
     *
     * @returns {Promise<void>}
     */
    async run(){
        const webSocketClient = new WebSocketClient();
        InjectionManager.getInstance().register('WebSocketClient', new WebSocketClientInjector(webSocketClient));
        InjectionManager.getInstance().register('EventBroker', new EventBrokerInjector());
        EventProvider.#registerConnectionStatusListeners();
        EventProvider.#registerListeners();
    }
}

export default EventProvider;
