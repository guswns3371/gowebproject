module.exports = function(app) {
    const upload = require("../util/uploadUtils");
    const post = require('../controller/postController');
    const {verifyToken} = require('./middleware/authorization');


    app.route('/post')
        .get(verifyToken, post.getPosts);

    app.route('/post/write',verifyToken)
        .get(verifyToken, function (req,res){
            res.render('post/write')
        })
        .post(verifyToken, post.addPost);
}