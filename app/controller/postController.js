const postModel = require('../model/postModel');

const Post = function (infos) {
    this.id = infos.id;
    this.title = infos.title;
    this.content = infos.content;
    this.writer_id = infos.writer_id;
    this.like_cnt = infos.like_cnt;
    this.createdAt = infos.createdAt;
    this.updatedAt = infos.updatedAt;
    this.UserInfo = {
        id : infos.UserInfo.id,
        email : infos.UserInfo.email,
        name : infos.UserInfo.name
    }
}

exports.getPosts = async function (req, res, next) {
    try{
        let response = {}
        let postList = []
        let tabs =[]
        let pageNum = req.params.page;
        let offSet = 0;
        let limit = 10

        if (pageNum > 1) {
            offSet = limit * (pageNum - 1);
        }

        await db.Post.findAndCountAll({
            offset: offSet,
            limit: limit,
            include : [{
                model : db.UserInfo
            }]
        }).then(result => {
            result.rows.forEach(post => {
                let result = new Post(post)
                result.createdAt = result.createdAt.format("yy-MM-dd hh:mm")
                postList.push(result)
            })
            let count = result.count
            let tabCount = Math.ceil(count/limit)
            for (let i =1; i <= tabCount; i++)
                tabs.push(i)
            response.success = true
            response.message = postList
            response.tabCount = tabs

            // JSON.parse(JSON.stringify(result)) 로 json object를 포함한
            // 결과를 JSON 형태로 볼수 있다
            console.log(JSON.parse(JSON.stringify(result)))
        }).catch(err => {
            console.log('Post.getPosts err', err)
            response.success = false
            response.message = "게시물 목록 불러오기 실패" + err.message
        });

        res.render('post/bulletin', {contents: response.message, tabCount:response.tabCount ,session: res.locals});
    }catch (e) {
        console.error('getPosts err',e);
        next(e);
    }

}
exports.getPost = async function (req, res, next) {
    try {
        let response = {}
        await db.Post.findOne({
            where : {
                id : req.params.id
            },
            include : [{
                model : db.UserInfo
            }]
        }).then(post =>{
            console.log(post)
            let result = new Post(post)
            result.createdAt = result.createdAt.format("yy-MM-dd hh:mm")
            response.success = true
            response.message = result
        }).catch(err =>{
            response.success = false
            response.message = "게시물 내용 불러오기 실패" + err.message
            console.log('getPost err1',err)
        })

        res.render('post/inner', {inner: response.message, session: res.locals});
    } catch (e) {
        console.error('getPost err2', e);
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
            content: post.content,
            writer_id: res.locals.userIndex
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