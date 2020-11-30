
const crypto = require('crypto');
module.exports = {
    getHashPassword(inputPassword, salt) {
        return crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
    },
    getSalt() {
        return Math.round((new Date().valueOf() * Math.random())) + "";
    }
}
