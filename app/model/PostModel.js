const db = require('../../models');

const Post = function (infos) {
    this.id = infos.id;
    this.title = infos.title;
    this.content = infos.content;
    this.like_cnt = infos.like_cnt;
    this.createdAt = infos.createdAt;
    this.updatedAt = infos.updatedAt;
}

Post.getPosts = async function (req, result) {
    let response = {}
    let postList = []
    let pageNum = req.query.page;
    let offSet = 0;
    let limit = 10

    if (pageNum>1){
        offSet = limit*(pageNum-1);
    }

    await db.Post.findAll({
        offset: offSet,
        limit: limit
    }).then(posts  => {
        posts.forEach(post => {
            let _post = new Post(post)
            _post.createdAt = _post.createdAt.format("yy-MM-dd hh:mm")
            postList.push(new Post(_post))
        })
        response.success = true
        response.message = postList
        console.log(posts)
    }).catch(err => {
        console.log('Post.getPosts err',err)
        response.success = false
        response.message = "게시물 불러오기 실패" + err.message
    });

    result(null,response);
}

Post.addPost = async function (req,result) {
    let post = new Post(req.body)
    let response = {}
    console.log('Post.addPost',post)

    await db.Post.create({
        title: post.title,
        content: post.content
    }).then(res=> {
        response.success = true
        response.message = "게시물 작성 성공"
    }).catch(err => {
        response.success = false
        response.message = "게시물 작성 실패" + err.message
    })

    result(null,response);
}

module.exports = Post;


Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
