const postModel = require('../model/PostModel');

exports.getPosts = function (req,res) {
    postModel.getPosts(req, function (err,content) {
        if (err)
            res.json(err);
        // res.json(content);
        console.log(content)

        let token = req.cookies.user_cookie;
        let decoded = jwt.verify(token, secretObj.secret,null,function (err) {
            console.log("[토큰 만료] 다시 로그인 해주세요.\n"+err.message);
            res.redirect('/login');
        });

        res.render('post/bulletin', {contents: content.message, session : decoded});
    }).then(r  => {
        console.log("postModel.getPosts then :",r)
    });
}

exports.addPost = function (req, res) {
    postModel.addPost(req, function (err,content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("postModel.addPost then :",r)
    });
}