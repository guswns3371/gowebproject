require("dotenv-json")(); // .env file의 내용을 가져온단다

const admin = require("firebase-admin");
const http = require('http');
const FCM = require("fcm-node");
const serverKey = process.env.api_key;
const fcm = new FCM(serverKey);

const serviceAccount = {
    "type": process.env.type,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key,
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports ={
    sendPushMessage(title,content,token) {
        return new Promise((resolve,reject) => {
            let message = {
                /**
                 * notification => 안드로이드에서 onMessageReceived 함수를 거치지 않는다
                 *                  (App이 실행중이지 않을 때)
                 * data => 안드로이드에서 onMessageReceived 함수를 거침
                 * */
                notification:{
                    title : title,
                    body : content
                },
                token : token
            };

            admin.messaging().send(message)
                .then(res=>{
                    console.log('메시지 보내기 성공',message);
                    resolve(res)
                })
                .catch(err=>{
                    console.log('메시지 보내기 실패',err);
                    reject(err)
                })
        });
    }
};

module.exports = {
    sendTopicMessage(title, who,user_image,content,token,roomId,roomPeople) {
        let push_data = {
            to: token,
            priority: "high",
            /**
             * notification => 안드로이드에서 onMessageReceived 함수를 거치지 않는다
             *                  (App이 실행중이지 않을 때)
             * data => 안드로이드에서 onMessageReceived 함수를 거침
             * */
            data: {
                title: title,
                who : who,
                user_image : user_image,
                body : content,
                sound: "default",
                click_action: "OPEN_THIS_ACT",
                room_id : roomId,
                room_people : roomPeople
            }
        };

        fcm.send(push_data,(err,response)=>{
            if (err){
                console.error('메시지 발송 실패',err);
                return;
            }
            console.log('메시지 발송 성공',token);
        });
    }
} ;