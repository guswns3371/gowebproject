module.exports = function(app) {
    const chat = require('../controller/chatController');
    const {verifyToken} = require('./middleware/authorization');

    app.route('/chat')
        .get(verifyToken, chat.getChatHome);

    app.route('/chat/list')
        .get(verifyToken, chat.getChatRoomList);

    app.route('/chat/history')
        .post(verifyToken, chat.getChatHistory);

    app.route('/chat/message')
        .post(verifyToken,chat.makeHistory);


}
