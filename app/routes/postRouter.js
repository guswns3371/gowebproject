module.exports = function(app) {
    const upload = require("../util/uploadUtils");
    const post = require('../controller/postController');

    app.route('/post')
        .get(post.getPosts)
        .post(post.addPost)
    app.route('/post/write')
        .get(function (req,res){
            res.render('post/write')
        })
}