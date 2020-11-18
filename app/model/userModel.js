const sql = require('../../dbConnection');
const crypto = require('crypto');
const mailer = require('../util/mailer');
const randomString = require('randomstring');
const fs = require('fs');

const db = require('../../models');

const User = function (infos) {
    this.user_id = infos.user_id;
    this.password = infos.password;
    this.email = infos.email;
    this.name = infos.name;
    this.secretToken = infos.secretToken;
};

const getHashPassword = (inputPassword,salt)=>{
    return  crypto.createHash("sha512").update(inputPassword+salt).digest("hex");
};
const getSalt = () =>{
    return Math.round((new Date().valueOf()*Math.random())) + "";
};

const sendSecretToken = (secretToken,email) =>{
    // email에 담길 내용
    const subject = "[BLAHBLAH] 이메일 인증이 필요합니다";
    const html =
        `Welcome to BLAHBLAH
            <br/>
            GOTIFY 가입을 축하드립니다!
            <br/>
            GOTIFY 계정 활성화를 위해 아래 코드를 입력해주세요
            <br/><br/>
            [코드]<br/><b>${secretToken}</b>`;

    // send an email
    mailer.sendEmail('GOTIFY admin', email, subject, html);
}
User.createUser = function (newInfo,result) {
    let inputPassword = newInfo.password;
    let salt = getSalt();
    let hashPassword = getHashPassword(inputPassword,salt);

    //Generate secret token
    const secretToken = randomString.generate();

    db.UserInfo.create({
        user_id : newInfo.user_id,
        password : hashPassword,
        email : newInfo.email,
        name : newInfo.name,
        secretToken : secretToken,
        salt : salt
    })
        .then(res =>{
            console.log("createUser success");
            sendSecretToken(secretToken,newInfo.email);
            result(null,{isRegistered : true});
        })
        .catch(err=>{
            console.log("createUser fail",err);
            result({isRegistered : false, err : err},null);
        });
};

User.checkEmailValidation = function(email, result){
    db.UserInfo.count({where : {email : email}})
        .then(count =>{
            console.log("checkEmailValidation : ",count);
            if (count !== 0)
                result(null,{isEmailOk : false});
            else
                result(null,{isEmailOk : true});
        })
        .catch(err =>{
            console.log("err checkEmailValidation err : ",err);
            result(err,null);
        });
};
User.checkIdValidation = function (id, result) {
    db.UserInfo.count({where : {user_id : id}})
        .then(count =>{
            console.log("checkIdValidation : ",count);
            if (count !== 0)
                result(null,{isIdOk : false});
            else
                result(null,{isIdOk : true});
        })
        .catch(err =>{
            console.log("err checkIdValidation err : ",err);
            result(err,null);
        });
};

User.checkLogin = function(loginInfo,result){
    let UserData;
    let isCorrect = false;
    let isConfirmed = false;
    let id,userId,userName;

    db.UserInfo.findOne({where : {email : loginInfo.email}})
        .then(user =>{
            if (user === null) // 존재하지 않는 email
                isCorrect = false;
            else // 존재하는 email
            {
                console.log("checkLogin ",user.dataValues);
                UserData = user.dataValues;
                isCorrect = UserData.password
                    === getHashPassword(loginInfo.password,UserData.salt);
                isConfirmed = UserData.confirmed;
                id = UserData.id;
                userId = UserData.user_id;
                userName = UserData.name;
            }

            result(null,{
                isCorrect : isCorrect,
                isConfirmed : isConfirmed === true,
                id : id,
                userId : userId,
                userName : userName
            });
        })
        .catch(err =>{
            console.log("checkLogin err ",err);
            result(err,null);
        })
};

User.verifyEmail = function(body,result){
    let UserData;
    let isConfirmed = false;
    let id;

    db.UserInfo.findOne({
        where : {
            email : body.email,
            secretToken : body.secretToken
    }})
        .then(user =>{
            if (user !== null)
            {
                UserData = user.dataValues;
                isConfirmed = body.secretToken === UserData.secretToken;
                id = UserData.id;
            }
            if(isConfirmed){
                db.UserInfo.update(
                    {confirmed: true},
                    {where : {email : body.email}}
                    )
                    .then(()=>{
                        console.log("verifyEmail confirmed = true")})
                    .catch(err =>{
                        console.log("verifyEmail confirmed err ",err)
                    })
            }
            result(null,{
                isConfirmed : isConfirmed,
                id : id
            });
        })
        .catch(err =>{
            console.log("checkLogin err ",err);
            result(err,null);
        })
};

User.resendToken = async function(body,result){

    const user = await db.UserInfo.findOne({where : {email : body.email}});
    if (user == null)
        return;

    let UserData = user.dataValues;
    let isConfirmed = UserData.confirmed;
    let isResent = false;

    if(!isConfirmed){
        const secretToken = randomString.generate();
        await db.UserInfo.update(
            {secretToken : secretToken},
            {where : {email : body.email}}
        ).then(()=>{
            sendSecretToken(secretToken,UserData.email);
            console.log("토큰 재전송 완료");
            isResent = true;
        }).catch(err =>{
            console.log("토큰 재전송 실패",err);
        })

    } else {
        console.log("이미 인증받은 사용자입니다.");
    }

    result(null,{isResent : isResent});
};

User.getAllUserDatas = function(id,result){
    db.UserInfo.findAll({
        attributes : ["id","profile_image","back_image","user_id","email","name","message"]
    })
        .then(user => {

            let myJson;
            let friendJson =[];
            user.filter(data =>{
                // 로그인한 사람의 id는 myJson에 삽입
                // 나머지 사람들의 id는 friendJson에 삽입
                if(data.id != id) friendJson.push(data);
                else myJson= data;
            });

            // myJson를 friendJson의 앞에 삽입
            // 로그인한 사람의 정보를 맨 앞에 보내기 위함
            if (myJson !== undefined) {
                friendJson.unshift(myJson);
                result(null,friendJson)
            }else
                result(null,[{err : "존재하지 않은 회원입니다"}]);
        })
        .catch(err =>{
            console.log("getAllUserDatas err ",err);
            result(err,null);
        })
};


User.editUserData = async function(req,result){
    let body = req.body;
    let file = req.files;
    var updateOptions = {};

    const user = await db.UserInfo.findByPk(body.id);
    console.log(user.profile_image);

    if (typeof body.user_id !== "undefined"){
        updateOptions.user_id = body.user_id;
    }
    if (typeof body.name !== "undefined"){
        updateOptions.name = body.name;
    }
    if (typeof body.message !== "undefined"){
        updateOptions.message = body.message;
    }
    if (typeof file.user_img !== "undefined"){
        updateOptions.profile_image = file.user_img[0].path.replace('/var/www/html','');
    }
    if (typeof file.back_img !== "undefined"){
        updateOptions.back_image = file.back_img[0].path.replace('/var/www/html','');
    }
    console.log("editUserData updateOptions",updateOptions);

    db.UserInfo.update(
        updateOptions,
        {   where : {id : body.id} })
        .then(res =>{
            console.log("editUserData ",res);

            if (typeof file.user_img !== "undefined" && user.profile_image !== null){
                try {fs.unlinkSync('/var/www/html'+user.profile_image);
                }catch (e) {console.log("unlinkSync err",e)}
            }
            if (typeof file.back_img !== "undefined" && user.back_image !== null){
                try {fs.unlinkSync('/var/www/html'+user.back_image)
                }catch (e) {console.log("unlinkSync err",e)}
            }

            let send = {};
            if (res){
                send.success = true;
                send.message = "편집 완료"
            }else {
                send.success = false;
                send.message = "편집 실패"
            }
            result(null,send);
        })
        .catch(err =>{
            console.log("editUserData err ",err);
            result(err,null)
        })
};

User.updateFCMToken = async function(body,result){
    console.log({body});
    let send = {};

    db.UserInfo.update(
        {
            fcm_token : body.fcm_token
        },
        {
            where : {id : body.id}
        }
    ).then(res =>{
        console.log("updateFCMToken success",res);

        if (res === 1){
            send.success = true;
            send.message = "fcm token update 성공";
            send.message_two =`${res}`;
        }else {
            send.success = false;
            send.message = "fcm token update 알수 없는 실패";
            send.message_two = `${res}`;
        }


        result(null,send);
    }).catch(err =>{
        console.log("updateFCMToken err",err);
        send.success = false;
        send.message = "fcm token update 실패";

        result(err,null);

    });
};

User.deleteFCMToken = async function(id,result){
    console.log({id});
    let send = {};

    db.UserInfo.update(
        {
            fcm_token : null
        },
        {
            where : {id : id}
        }
    ).then(res =>{
        console.log("deleteFCMToken success",res);

        if (res === 1){
            send.success = true;
            send.message = "fcm token delete 성공";
            send.message_two =`${res}`;
        }else {
            send.success = false;
            send.message = "fcm token delete 알수 없는 실패";
            send.message_two = `${res}`;
        }


        result(null,send);
    }).catch(err =>{
        console.log("deleteFCMToken err",err);
        send.success = false;
        send.message = "fcm token delete 실패";

        result(err,null);

    });
};

module.exports = User;