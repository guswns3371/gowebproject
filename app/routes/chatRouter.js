module.exports = function(app) {

    const upload = require("../util/uploadUtils");
    const chat = require('../controller/chatController');
    const {verifyToken} = require('./middleware/authorization');

    app.route('/chat')
        .get(verifyToken, chat.getChatHome);

    app.route('/chat/list')
        .get(verifyToken, chat.getChatRoomList);

    app.route('/chat/history')
        .post(verifyToken, chat.getChatHistory);
        // .post(upload.fields([{name : 'chat_image_1'}, {name: 'chat_image_2'}]),
        //     chat.makeHistory);

    app.route('/chat/message')
        .post(verifyToken,chat.makeHistory);

    // app.route('/chat/:id')
    //     .get(chat.getChatHistory);
    //
    // app.route('/chat/list/:id')
    //     .get(chat.getChatRoomList);
    //
    // app.route('/chat/room/make')
    //     .post(chat.makeChatRoom);


}
