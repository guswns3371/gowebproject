const Bulletin = function (infos) {
    this.id = infos.id;
    this.name = infos.name;
}

const PostItem = function (infos) {
    this.id = infos.id;
    this.title = infos.title;
    this.content = infos.content;
    this.userInfoId = infos.userInfoId;
    this.postId = infos.postId;
    this.createdAt = infos.createdAt.format("yy-MM-dd hh:mm");
    this.updatedAt = infos.updatedAt;
    this.view_cnt = infos.view_cnt;
    this.like_cnt = infos.like_cnt;
    this.UserInfo = {
        id : infos.UserInfo.id,
        user_id : infos.UserInfo.user_id,
        email : infos.UserInfo.email,
        name : infos.UserInfo.name
    }
}

const Reply = function (infos) {
    this.id = infos.id;
    this.content = infos.content;
    this.createdAt = infos.createdAt.format("yy-MM-dd hh:mm");
    this.updatedAt = infos.updatedAt;

    this.UserInfoId = infos.UserInfoId;
    this.PostItemId = infos.PostItemId;
    this.ReplyId = infos.ReplyId;
    if (infos.UserInfo !== null) {
        this.UserInfo = {
            id: infos.UserInfo.id,
            user_id: infos.UserInfo.user_id,
            email: infos.UserInfo.email,
            name: infos.UserInfo.name
        }
    }
    if (infos.SubReply !== undefined){
        this.SubReply = []
        infos.SubReply.forEach(reply=>{
            // console.log('reply ',JSON.parse(JSON.stringify(reply)))
            this.SubReply.push(new Reply(reply))
            // this.SubReply.push({
            //     id : reply.id,
            //     content : reply.content,
            //     createdAt : reply.createdAt.format("yy-MM-dd hh:mm"),
            //     updatedAt : reply.updatedAt,
            //     UserInfoId : reply.UserInfoId,
            //     PostItemId : reply.PostItemId,
            //     ReplyId : reply.ReplyId,
            //     UserInfo : {
            //         id : reply.UserInfo.id,
            //         user_id : reply.UserInfo.user_id,
            //         email : reply.UserInfo.email,
            //         name : reply.UserInfo.name
            //     }
            // })
        })
    }
}

exports.getBoardAndPosts = async function (req, res, next) {
    try{
        let response = {}
        let bulletinList = []
        let postList = []
        let tabs =[]
        let userId = res.locals.userIndex
        let category = req.query.id;
        let pageNum = req.query.page;
        let offSet = 0;
        let limit = 10

        if (pageNum > 1) {
            offSet = limit * (pageNum - 1);
        }

        await db.Bulletin.findAll()
            .then(result =>{
                result.forEach(bulletin=>{
                    bulletinList.push(new Bulletin(bulletin))
                    response.bulletinList = bulletinList
                })
                console.log(JSON.parse(JSON.stringify(bulletinList)))
            }).catch(err=>{
                console.log("getBulletinBoard err : "+err)
            })

        let postItemList=  await db.PostItem.findAndCountAll({
            where:{
              BulletinId : category
            },
            offset: offSet,
            limit: limit,
            include : [{
                model : db.UserInfo
            }]
        });

        if (postItemList){
            for (const post of postItemList.rows) {
                let result = new PostItem(post)

                console.log(result.id)
                await db.ViewPostItem.findAndCountAll({
                    where: {
                        PostItemId: result.id
                    }
                }).then(result1=>{
                    console.log('fuck')
                    result.view_cnt = result1.count
                })

                await db.LikePostItem.findAndCountAll({
                    where: {
                        PostItemId: result.id
                    }
                }).then(result2=>{
                    result.like_cnt = result2.count
                })

                postList.push(result)
            }

            let count = postItemList.count
            let tabCount = Math.ceil(count/limit)
            for (let i =1; i <= tabCount; i++)
                tabs.push(i)
            response.success = true
            response.message = postList
            response.tabList = tabs

            // JSON.parse(JSON.stringify(result)) 로 json object를 포함한
            // 결과를 JSON 형태로 볼수 있다
            console.log(JSON.parse(JSON.stringify(postItemList)))
        }else {
            response.success = false
            response.message = "게시물 목록 불러오기 실패"
        }

        res.render('bulletin/bulletin', {session: res.locals,bulletinList: bulletinList,
            contents: response.message, tabList:response.tabList ,title:bulletinList[category-1].name});
    }catch (e) {
        console.error('getPosts err',e);
    }

}
exports.getPost = async function (req, res, next) {
    try {
        let response = {}
        let userId = res.locals.userIndex
        let postItemId = req.query.id
        let replyList = []

        await db.PostItem.findOne({
            where : {
                id : postItemId
            },
            include : [{
                model : db.UserInfo
            },{
                model : db.Bulletin
            }]
        }).then(post =>{
            console.log(post)
            let result = new PostItem(post)
            response.success = true
            response.message = result
            response.bulletinName = post.Bulletin.name
            response.bulletinId = post.Bulletin.id
        }).catch(err =>{
            response.success = false
            response.message = "게시물 내용 불러오기 실패" + err.message
            console.log('getPost err1',err)
        })

        // 조회수 확인후 +1
        await db.ViewPostItem.findAndCountAll({
            where : {
                PostItemId : postItemId,
                UserInfoId : userId
            }
        }).then(result=>{
            if (result.count === 0)
                db.ViewPostItem.create({PostItemId: postItemId, UserInfoId: userId})

        })
        await db.ViewPostItem.findAndCountAll({
            where : {
                PostItemId : postItemId,
                UserInfoId : userId
            }
        }).then(result=>{
            response.views =  result.count
        })

        // 좋아요수
        await db.LikePostItem.findAndCountAll({
            where : {
                PostItemId : postItemId,
                UserInfoId : userId
            }
        }).then(result=>{
            response.likes =  result.count
        })
        console.log('response',JSON.parse(JSON.stringify(response)))

        // 댓글
        await db.Reply.findAll({
            where:{
                PostItemId : postItemId,
                ReplyId : null
            },
            include : [{
                model : db.UserInfo
            },{
                model : db.Reply,
                as : 'SubReply',
                include:[{
                    model : db.UserInfo,
                    as : 'UserInfo'
                }]

                // include:[{
                //     all : true,
                //     nested : true
                // }]

            }]
        }).then(result=>{
            // console.log('result ',JSON.parse(JSON.stringify(result)))
            result.forEach(row=>{

                replyList.push(new Reply(row))
            })

            // 대댓글이 중복으로 나타나는 부분 해결
            // replyList.forEach(row=>{
            //     if (row.SubReply) {
            //         row.SubReply.forEach(inner=>{
            //             replyList = replyList.filter(function (obj){
            //                 return obj.id !== inner.id;
            //             })
            //         })
            //     }
            // })

            response.replyList = replyList
            console.log('replyList result',JSON.parse(JSON.stringify(replyList)))
        })

        res.render('bulletin/inner', {inner: response, session: res.locals,replyList : replyList,
            title: response.message.title});
    } catch (e) {
        console.error('getPost err2', e);
        next(e);
    }
}

exports.updatePost = async function (req, res,next) {
    // 좋아요 버튼
    let respons = {}
    let userId = res.locals.userIndex
    let postItemId = req.body.postItemId
    await db.LikePostItem.findAndCountAll({
        where : {
            PostItemId : postItemId,
            UserInfoId : userId
        }
    }).then(result=>{
        if (result.count === 0){
            db.LikePostItem.create({PostItemId: postItemId, UserInfoId: userId})
            respons.success = true
            respons.message = '이 글에 공감하였습니다.'
        }else {
            respons.success = false
            respons.message = '이미 공감한 글입니다'
        }
        res.json(respons)
    })
}

exports.addPost = async function (req, res,next) {
    try{
        let response = {}
        console.log('Post.addPost', req.body)

        await db.PostItem.create({
            title: req.body.title,
            content: req.body.content,
            UserInfoId: res.locals.userIndex,
            BulletinId : req.body.bulletinId
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

exports.getWritePageWithBulletinList =  async function (req, res, next) {
    try {
        let bulletinList = []
        await db.Bulletin.findAll()
            .then(result =>{
                result.forEach(bulletin=>{
                    bulletinList.push(new Bulletin(bulletin))
                    res.bulletinList = bulletinList
                })
            }).catch(err=>{
                console.log("getBulletinBoard err : "+err)
            })
        res.render('bulletin/write', {session: res.locals, title:"글쓰기",bulletinList:bulletinList});
    }catch (e) {

    }
}

exports.writeReply = async function (req, res,next) {
    try {
        let response = {}
        console.log('Post.writeReply', req.body)

        await db.Reply.create({
            content: req.body.content,
            UserInfoId: res.locals.userIndex,
            PostItemId : req.body.postItemId,
            ReplyId : req.body.replyId
        }).then(res => {
            response.success = true
            response.message = "댓글 작성 성공"
        }).catch(err => {
            response.success = false
            response.message = "댓글 작성 실패" + err.message
        })
        res.json(response)
    }catch (e) {
        console.error('addPost err',e);
        next(e);
    }
}

