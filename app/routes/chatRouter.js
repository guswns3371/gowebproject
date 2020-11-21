module.exports = function(app) {

    const upload = require("../util/uploadUtils");
    const chat = require('../controller/chatController');
    const {verifyToken} = require('./middleware/authorization');

    app.route('/chat')
        .post(upload.fields([{name : 'chat_image_1'}, {name: 'chat_image_2'}]),
            chat.makeHistory);

    app.route('/chat/:id')
        .get(chat.getChatHistory);

    app.route('/chat/list/:id')
        .get(chat.getChatRoomList);

    app.route('/chat/room/make')
        .post(chat.makeChatRoom);

}
