'use strict';

import WebSocketClientInjector from '../services/injectors/WebSocketClientInjector';
import MessageDeleteEventListener from '../listeners/MessageDeleteEventListener';
import MessageEditEventListener from '../listeners/MessageEditEventListener';
import EventBrokerInjector from '../services/injectors/EventBrokerInjector';
import UserTypingEventListener from '../listeners/UserTypingEventListener';
import MessageEventListener from '../listeners/MessageEventListener';
import InjectionManager from '../support/InjectionManager';
import WebSocketClient from '../support/WebSocketClient';
import Provider from './Provider';
import ConversationDeleteEventListener from '../listeners/ConversationDeleteEventListener';

class EventProvider extends Provider {
    static #registerListeners(){
        const eventBrokerInjector = new EventBrokerInjector();
        eventBrokerInjector.inject().on('ext:conversationDelete', ConversationDeleteEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:messageDelete', MessageDeleteEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:messageEdit', MessageEditEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:userTyping', UserTypingEventListener.getClosure());
        eventBrokerInjector.inject().on('ext:message', MessageEventListener.getClosure());
    }

    async run(){
        const webSocketClient = new WebSocketClient();
        InjectionManager.getInstance().register('WebSocketClient', new WebSocketClientInjector(webSocketClient));
        InjectionManager.getInstance().register('EventBroker', new EventBrokerInjector());
        EventProvider.#registerListeners();
    }
}

export default EventProvider;
