const path = require('path');
const multer = require('multer');
const upload = multer({
    storage : multer.diskStorage({
        destination : function (req,file,cb) {
            cb(null,'../../images/');
        },
        filename : function(req,file,cb) {
            // 이미지 파일 명 : 유저아이디_필드네임_확장자
            // ex) 1_user_img.jpg
            cb(null, `${req.body.id}_${file.fieldname}_${file.originalname}`)
        }
    })});

module.exports = upload;