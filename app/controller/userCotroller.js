const UserModel = require('../model/userModel');
const jwt = require('jsonwebtoken')
const secretObj = require("../../config/jwt");
const auth = require('../util/authentication');

const User = function (infos) {
    this.id = infos.id;
    this.user_id = infos.user_id;
    this.password = infos.password;
    this.profile_image = infos.profile_image;
    this.email = infos.email;
    this.name = infos.name;
    this.salt = infos.salt;
};

exports.createUser = function (req,res) {
    const newUser = new UserModel(req.body);
    console.log('newUser',newUser);
    UserModel.createUser(newUser,function (err,content) {
        if (err)
            res.json(err);
        res.redirect('/login');
    })
};

exports.checkEmailValidation = function (req, res) {
    UserModel.checkEmailValidation(req.params.email,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    })
};


exports.checkIdValidation = function(req, res){
    UserModel.checkIdValidation(req.params.id,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    })
};

exports.checkLogin = function (req,res) {
    console.log("query",req.query);
    console.log("body",req.body);
    const loginInfo = new User(req.body);
    UserModel.checkLogin(loginInfo,function (err,content) {
        if (err)
            res.json(err);
        console.log('checkLogin content',content);

        if (content.isCorrect && content.isConfirmed){
            let expiresIn = '1h';

            if(req.body.autoLoginCheck)
                expiresIn = '5h';
            console.log("req.body.autoLoginCheck",req.body.autoLoginCheck)
            console.log("expiresIn",expiresIn)
            let token = jwt.sign({
                    userIndex : content.id
                },
                secretObj.secret ,    // 비밀 키
                {
                    expiresIn: expiresIn  // 유효 시간은 5분
                });
            res.cookie("user_cookie",token);
            content.token = token;
        }
        res.json(content); //jsonp 사용 했으면 json 사용 하지 말거라 : ERR_HTTP_HEADERS_SENT
    })
};

exports.verifyEmail = function (req,res) {
    console.log("query",req.query);
    console.log("body",req.body);

    UserModel.verifyEmail(req.body,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    })
};

exports.resendSecretToken = function (req, res) {
    console.log("query",req.query);
    console.log("body",req.body);

    UserModel.resendToken(req.body,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    })
};

exports.getAllUserDatas = function (req,res) {
    console.log("getAllUserDatas params",req.params);
    UserModel.getAllUserDatas(req.params.id,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    })
};

exports.getUserData = async function (req, res) {
    try {
        let userId = res.locals.userIndex
        const user = await db.UserInfo.findByPk(userId);
        let userData = new User(user)
        if (userData.profile_image === null){
            userData.profile_image = '/images/account_default.jpg'
        }
        res.render('user/edit', {session: res.locals, userData : userData})
    }catch (e) {

    }
}

exports.editUserData = function (req,res) {
    console.log("editUserData req.body",req.body);
    console.log("editUserData req.file",req.file);

    UserModel.editUserData(req, res,function (err, content) {
        if (err)
            res.json(err);
        res.render('index', {session: res.locals, title : "BlahBlah"})
    }).then(r  => {
        console.log("editUserData then : ",r)
    })
};

exports.updateFCMToken = function (req,res) {
    UserModel.updateFCMToken(req.body,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("updateFCMToken then : ",r)
    })
};

exports.deleteFCMToken = function (req,res) {
    UserModel.deleteFCMToken(req.params.id,function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("deleteFCMToken then : ",r)
    })
};