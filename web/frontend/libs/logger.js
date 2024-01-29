'use strict';
const logContent = (event = '', shop = '', message = '', user_define_msg = '', result = '') => {
    const messageStr =
        message instanceof Error
            ? JSON.stringify(message, Object.getOwnPropertyNames(message))
            : JSON.stringify(message);
    const userMessageStr =
        user_define_msg instanceof Error
            ? JSON.stringify(user_define_msg, Object.getOwnPropertyNames(user_define_msg))
            : JSON.stringify(user_define_msg);

    return {
        event: event,
        shop: shop,
        message: messageStr,
        user_define_msg: userMessageStr,
        result: result,
        time:
            new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }) +
            ' ' +
            new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    };
};

export default {
    /**
     * @param {string} event
     * @param {string} shop Shop domain
     * @param {string | object} message
     * @param {string | object} user_define_msg
     * @param {'success' | 'warning' | 'info'} result
     */
    writeLog: function (event = '', shop = '', message = '', user_define_msg = '', result = '') {
        console.info(JSON.stringify(logContent(event, shop, message, user_define_msg, result)));
    },
    /**
     * @param {string} event
     * @param {string} shop Shop domain
     * @param {string | object} message
     * @param {string | object} user_define_msg
     * @param {'failed'} result
     */
    writeError: function (event = '', shop = '', message = '', user_define_msg = '', result = '') {
        console.error(JSON.stringify(logContent(event, shop, message, user_define_msg, result)));
    },
};
