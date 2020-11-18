const postModel = require('../model/PostModel');

const Post = function (infos) {
    this.id = infos.id;
    this.title = infos.title;
    this.content = infos.content;
    this.like_cnt = infos.like_cnt;
    this.createdAt = infos.createdAt;
    this.updatedAt = infos.updatedAt;
}

exports.getPosts = async function (req, res, next) {
    try{
        let response = {}
        let postList = []
        let pageNum = req.query.page;
        let offSet = 0;
        let limit = 10

        if (pageNum > 1) {
            offSet = limit * (pageNum - 1);
        }

        await db.Post.findAll({
            offset: offSet,
            limit: limit
        }).then(posts => {
            posts.forEach(post => {
                let _post = new Post(post)
                _post.createdAt = _post.createdAt.format("yy-MM-dd hh:mm")
                postList.push(new Post(_post))
            })
            response.success = true
            response.message = postList
            console.log(posts)
        }).catch(err => {
            console.log('Post.getPosts err', err)
            response.success = false
            response.message = "게시물 불러오기 실패" + err.message
        });

        res.render('post/bulletin', {contents: response.message, session: res.locals});
    }catch (e) {
        console.error('getPosts err',e);
        next(e);
    }

}

exports.addPost = async function (req, res,next) {
    try{
        let post = new Post(req.body)
        let response = {}
        console.log('Post.addPost', post)

        await db.Post.create({
            title: post.title,
            content: post.content
        }).then(res => {
            response.success = true
            response.message = "게시물 작성 성공"
        }).catch(err => {
            response.success = false
            response.message = "게시물 작성 실패" + err.message
        })
        res.json(response)
    }catch (e) {
        console.error('addPost err',e);
        next(e);
    }
}