const jwt = require('jsonwebtoken')
const secretObj = require("../../../config/jwt");

const verifyToken = async (req, res, next) => {
    try {
        const clientToken = req.cookies.user_cookie;
        const decoded = jwt.verify(clientToken, secretObj.secret);
        if (decoded) {
            const user = await db.UserInfo.findOne({where : {id : decoded.userIndex}})

            res.locals.userId = user.user_id;
            res.locals.userName = user.name;
            res.locals.email = user.email;
            res.locals.userIndex = user.id;
            if (user.profile_image !== null){
                res.locals.profile_image = user.profile_image;
            }else {
                res.locals.profile_image = "/images/account_default.jpg"
            }


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