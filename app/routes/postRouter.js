module.exports = function(app) {
    const upload = require("../util/uploadUtils");
    const post = require('../controller/postController');
    const {verifyToken} = require('./middleware/authorization');


    app.route('/bulletin/:category')
        .get(verifyToken, post.getBoardAndPosts);

    app.route('/post')
        .get(verifyToken, post.getPost);

    app.route('/post/like')
        .post(verifyToken, post.updatePost);

    app.route('/post/write')
        .get(verifyToken,post.getWritePageWithBulletinList)
        .post(verifyToken, post.addPost);

    app.route('/post/reply')
        .post(verifyToken, post.writeReply);
}