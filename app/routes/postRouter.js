module.exports = function(app) {
    const upload = require("../util/uploadUtils");
    const post = require('../controller/postController');
    const {verifyToken} = require('./middleware/authorization');


    app.route('/post')
        .get(verifyToken, post.getPosts);

    app.route('/post/page/:page')
        .get(verifyToken, post.getPosts);

    app.route('/post/id/:id')
        .get(verifyToken, post.getPost);

    app.route('/post/write')
        .get(verifyToken, function (req,res){
            res.render('post/write', {session: res.locals});
        })
        .post(verifyToken, post.addPost);
}