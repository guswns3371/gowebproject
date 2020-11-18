module.exports = function(app) {

    const userRouter = require("./userRouter");
    const chatRouter = require("./chatRouter");
    const postRouter = require("./postRouter");
    const {verifyToken} = require('./middleware/authorization');

    userRouter(app);
    chatRouter(app);
    postRouter(app);

    /* GET home page. */
    app.get('/', verifyToken, function(req, res, next) {
        console.log('session',res.locals)
        res.render('index', { title: 'Express', session : res.locals});
    });

};
