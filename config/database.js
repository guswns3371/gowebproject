require('dotenv').config(); // .env file의 내용을 가져온단다

module.exports = {
    host     : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    port       : 3306,
    dateStrings: 'date', // 2020-01-03T15:20:04.000Z => 2020-01-03 15:20:04
    database   : 'cocoa'
};