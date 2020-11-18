module.exports = function(app) {

    const userRouter = require("./userRouter");
    const chatRouter = require("./chatRouter");
    const postRouter = require("./postRouter");

    userRouter(app);
    chatRouter(app);
    postRouter(app);

    /* GET home page. */
    app.get('/', function(req, res, next) {
        let token = req.cookies.user_cookie;
        let decoded = jwt.verify(token, secretObj.secret,null,function (err,decode) {
            if (err){
                console.log("[토큰 만료] 다시 로그인 해주세요.\n"+err);
                req.authenticated = false;
                req.decode = null;
                res.redirect('/login');
            }else {
                console.log("[토큰 인증 성공]\n");
                req.decoded = decode;
                req.authenticated = true;
            }

        });

        console.log('session',req.decoded)
        res.render('index', { title: 'Express', session : req.decoded});
    });

};
