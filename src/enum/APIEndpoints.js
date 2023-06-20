'use strict';

/**
 * Enum for all the available API endpoints.
 *
 * @enum {string}
 * @readonly
 */
export default Object.freeze({
    ATTACHMENT_GET: '/api/conversation/:conversationID/message/:messageID/attachment/:attachmentID/get',
    MESSAGE_MARK_AS_READ: '/api/conversation/:conversationID/message/:messageID/mark-as-read',
    MESSAGE_LIST_COMMITS: '/api/conversation/:conversationID/message/list-commits',
    MESSAGE_DELETE: '/api/conversation/:conversationID/message/:messageID/delete',
    CONVERSATION_MARK_AS_READ: '/api/conversation/:conversationID/mark-as-read',
    MESSAGE_EDIT: '/api/conversation/:conversationID/message/:messageID/edit',
    STICKER_GET: '/api/sticker-pack/:stickerPackID/sticker/:stickerID/get',
    CONVERSATION_DELETE: '/api/conversation/:conversationID/delete',
    MESSAGE_SEND: '/api/conversation/:conversationID/message/send',
    MESSAGE_LIST: '/api/conversation/:conversationID/message/list',
    STICKER_LIST: '/api/sticker-pack/:stickerPackID/sticker/list',
    USER_SESSION_DELETE: '/api/user/session/:accessToken/delete',
    CONVERSATION_COMMIT_STATS: '/api/conversation/commit-stats',
    CONVERSATION_GET: '/api/conversation/:conversationID/get',
    USER_SESSION_DELETE_ALL: '/api/user/session/delete-all',
    USER_VERIFY_USERNAME: '/api/user/verify-username',
    CONVERSATION_CREATE: '/api/conversation/create',
    CONVERSATION_STATS: '/api/conversation/stats',
    USER_SETTINGS_EDIT: '/api/user/settings/edit',
    USER_SETTINGS_GET: '/api/user/settings/get',
    USER_SESSION_LIST: '/api/user/session/list',
    CONVERSATION_LIST: '/api/conversation/list',
    STICKER_PACK_LIST: '/api/sticker-pack/list',
    USER_SEARCH: '/api/user/search',
    USER_SIGNUP: '/api/user/signup',
    USER_LOGOUT: '/api/user/logout',
    USER_LOGIN: '/api/user/login',
    USER_EDIT: '/api/user/edit',
    USER_INFO: '/api/user/info'
});
