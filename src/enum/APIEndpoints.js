'use strict';

/**
 *
 *
 * @enum {string}
 * @readonly
 */
export default Object.freeze({
    MESSAGE_DELETE: '/api/conversation/:conversationID/message/:messageID/delete',
    MESSAGE_EDIT: '/api/conversation/:conversationID/message/:messageID/edit',
    CONVERSATION_DELETE: '/api/conversation/:conversationID/delete',
    MESSAGE_SEND: '/api/conversation/:conversationID/message/send',
    MESSAGE_LIST: '/api/conversation/:conversationID/message/list',
    CONVERSATION_GET: '/api/conversation/:conversationID/get',
    USER_VERIFY_USERNAME: '/api/user/verify-username',
    CONVERSATION_CREATE: '/api/conversation/create',
    CONVERSATION_STATS: '/api/conversation/stats',
    CONVERSATION_LIST: '/api/conversation/list',
    USER_SEARCH: '/api/user/search',
    USER_SIGNUP: '/api/user/signup',
    USER_LOGIN: '/api/user/login',
    USER_INFO: '/api/user/info'
});
