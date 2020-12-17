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
    let UserData,id,token,name;
    let isCorrect = false;
    let isConfirmed = false;

    db.UserInfo.findOne({where : {email : loginInfo.email}})
        .then(user =>{
            if (user === null) // 존재하지 않는 email
                isCorrect = false;
            else // 존재하는 email
            {
                console.log("checkLogin ",user.dataValues);
                UserData = user.dataValues;
                isCorrect = UserData.password
                    === auth.getHashPassword(loginInfo.password,UserData.salt);
                isConfirmed = UserData.confirmed;
                id = UserData.id;
                name = UserData.name;
            }

            if (isCorrect && isConfirmed){
                let expiresIn = '1h';

                if(req.body.autoLoginCheck)
                    expiresIn = '5h';
                console.log("req.body.autoLoginCheck",req.body.autoLoginCheck)
                console.log("expiresIn",expiresIn)
                token = jwt.sign({
                        userIndex : id
                    },
                    secretObj.secret ,    // 비밀 키
                    {
                        expiresIn: expiresIn  // 유효 시간은 5분
                    });
                res.cookie("user_cookie",token);
            }
            res.json({
                isCorrect : isCorrect,
                isConfirmed : isConfirmed === true,
                id : id,
                name : name,
                token : token
            }); //jsonp 사용 했으면 json 사용 하지 말거라 : ERR_HTTP_HEADERS_SENT
        })
        .catch(err =>{
            console.log("checkLogin err ",err);
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
        res.redirect('/')
    }).then(r  => {
        console.log("editUserData then : ",r)
    })
};
