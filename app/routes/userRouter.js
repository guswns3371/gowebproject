module.exports = function(app) {
    const user = require('../controller/userCotroller');
    const upload = require("../util/uploadUtils");
    const {verifyToken} = require('./middleware/authorization');

    app.route('/user/info/:id')
        .get(user.getAllUserDatas);

    app.route('/user/edit')
        .get(verifyToken,user.getUserData)
        .post(verifyToken, upload.single('profile_image'), user.editUserData);

    app.route('/register')
        .get(function (req,res) {
            res.render('auth/register')
        })
        .post(user.createUser);

    app.route('/register/email/:email')
        .post(user.checkEmailValidation);

    app.route('/register/id/:id')
        .post(user.checkIdValidation)

    app.route('/login')
        .get(function (req,res) {
            res.render('auth/login')
        })
        .post(user.checkLogin);

    app.route('/verify')
        .get(function (req,res) {
            res.render('auth/verify',{email : req.query.email})
        })
        .post(user.verifyEmail);

    app.route('/verify/resend')
        .post(user.resendSecretToken);

    app.route('/user/fcm')
        .post(user.updateFCMToken);

    app.route('/user/fcm/:id')
        .delete(user.deleteFCMToken);

    app.route('/logout')
        .get(function (req, res) {
            req.session.destroy() // 세션 삭제
            res.clearCookie('user_cookie'); // 세션 쿠키 삭제
            res.redirect('/')
        })
}