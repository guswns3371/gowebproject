require('dotenv').config(); // .env file의 내용을 가져온단다

module.exports ={
    MAILGUGN_USER: process.env.MAILGUGN_USER,
    MAILGUGN_PASS: process.env.MAILGUGN_PASS
};

//https://app.mailgun.com/app/sending/domains/sandbox63a16207e1d3455189432e478f2349c4.mailgun.org