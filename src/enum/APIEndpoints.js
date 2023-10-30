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
    USER_PROFILE_PICTURE_GET: '/api/user/:userID/profile-picture/:profilePictureID/get',
    MESSAGE_LIST_COMMITS: '/api/conversation/:conversationID/message/list-commits',
    MESSAGE_DELETE: '/api/conversation/:conversationID/message/:messageID/delete',
    CONVERSATION_MARK_AS_READ: '/api/conversation/:conversationID/mark-as-read',
    MESSAGE_EDIT: '/api/conversation/:conversationID/message/:messageID/edit',
    STICKER_GET: '/api/sticker-pack/:stickerPackID/sticker/:stickerID/get',
    USER_REGENERATE_RECOVERY_KEY: '/api/user/regenerate-recovery-key',
    USER_PROFILE_PICTURE_REMOVE: '/api/user/profile-picture/remove',
    USER_PROFILE_PICTURE_CHANGE: '/api/user/profile-picture/change',
    CONVERSATION_DELETE: '/api/conversation/:conversationID/delete',
    MESSAGE_SEND: '/api/conversation/:conversationID/message/send',
    MESSAGE_LIST: '/api/conversation/:conversationID/message/list',
    USER_INIT_ACCOUNT_RECOVERY: '/api/user/init-account-recovery',
    STICKER_LIST: '/api/sticker-pack/:stickerPackID/sticker/list',
    USER_SESSION_DELETE: '/api/user/session/:accessToken/delete',
    CONVERSATION_COMMIT_STATS: '/api/conversation/commit-stats',
    CONVERSATION_GET: '/api/conversation/:conversationID/get',
    FETCH_LINK_OG_PROPERTIES: '/api/fetch-link-og-properties',
    USER_SESSION_DELETE_ALL: '/api/user/session/delete-all',
    USER_RECOVER_ACCOUNT: '/api/user/recover-account',
    USER_CHANGE_PASSWORD: '/api/user/change-password',
    USER_VERIFY_USERNAME: '/api/user/verify-username',
    CONVERSATION_CREATE: '/api/conversation/create',
    CONVERSATION_STATS: '/api/conversation/stats',
    USER_SETTINGS_EDIT: '/api/user/settings/edit',
    USER_SETTINGS_GET: '/api/user/settings/get',
    USER_SESSION_LIST: '/api/user/session/list',
    CONVERSATION_LIST: '/api/conversation/list',
    STICKER_PACK_LIST: '/api/sticker-pack/list',
    SERVER_INFO: '/api/server/info',
    USER_SEARCH: '/api/user/search',
    USER_SIGNUP: '/api/user/signup',
    USER_LOGOUT: '/api/user/logout',
    USER_LOGIN: '/api/user/login',
    USER_EDIT: '/api/user/edit',
    USER_INFO: '/api/user/info'
});
