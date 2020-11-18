const nodeMailer = require('nodemailer');
// const mailConfig = require('../../config/mailer');
require('dotenv').config(); // .env file의 내용을 가져온단다
const transport = nodeMailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.GMAIL_USER,
        pass : process.env.GMAIL_PASS
    }
});
//https://myaccount.google.com/lesssecureapps  에서 보안수준이 낮은 앱의 액세스를 허용해야한다
//앱선택 : 기타(맞춤 이름)으로 선택해야 인식한다!

module.exports ={
    sendEmail(from,to,subject,html) {
        return new Promise((resolve,reject) => {
            transport.sendMail({from, to, subject, html}, (err, info) => {
                if (err)
                    reject(err);

                resolve(info);
            });
        });
    }
};