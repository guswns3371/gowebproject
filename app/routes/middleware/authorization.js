const jwt = require('jsonwebtoken')
const secretObj = require("../../../config/jwt");

const verifyToken = (req, res, next) => {
    try {
        const clientToken = req.cookies.user_cookie;
        const decoded = jwt.verify(clientToken, secretObj.secret);
        if (decoded) {
            res.locals.userId = decoded.userId;
            res.locals.userName = decoded.userName;
            res.locals.email = decoded.email;
            res.locals.userIndex = decoded.userIndex;

            console.log('[토큰 인증 성공]')
            next();
        } else {
            console.log('[토큰 유효기간 초과]')
            res.redirect('/login')
        }
    } catch (err) {
        console.log('[인증 안된 토큰]')
        res.redirect('/login')
    }
};
exports.verifyToken = verifyToken;