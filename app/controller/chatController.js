
exports.getChatHistory = async function (req,res) {
    try {
        let response = []
        let roomId = req.body.chat_room_id;
        let chatHistory = await db.ChatHistory.findAll({
            where : {
                chat_room_id : roomId
            },
            include: [{model : db.UserInfo}]
        })

        for (const history of chatHistory) {
            let userInfo = history.UserInfo
            let mine = res.locals.userIndex === userInfo.id;
            response.push({
                mine:mine,
                chat_history_id : history.id,
                user_id : userInfo.user_id,
                user_name : userInfo.name,
                user_image : userInfo.profile_image,
                content : history.content,
                time : history.createdAt.format("hh:mm")
            })
        }

        res.json(response)
    } catch (e) {

    }
};

exports.getChatRoomList = async function (req, res) {
    try {
        let response = []
        let roomData = await db.UserChatRoom.findAll({
            where : {user_id : res.locals.userIndex},
            include: [{model : db.ChatRoom}]
        });

        for (const room of roomData) {
            let people = room.ChatRoom.people
            let bulletin = await db.Bulletin.findByPk(people)
            response.push({
                user_id: bulletin.id,
                chat_room_id: room.chat_room_id,
                user_image: bulletin.profile_image,
                room_name : bulletin.name,
                last_content : room.last_content,
                last_time : room.createdAt.format("hh:mm")
            })
        }
        res.json(response)
    } catch (e) {

    }
};

exports.makeHistory = async function (req,res) {
    try {
        let roomId = req.body.chat_room_id;
        let message = req.body.message;

        await db.ChatHistory.create({
            chat_room_id : roomId,
            chat_user_id : res.locals.userIndex,
            content : message
        }).then(result=>{
            console.log(result)
        }).catch(err=>{
            console.log(err)
        })
        res.json({})
    }catch (e) {

    }
};


exports.getChatHome = async function (req, res) {
    try {
        let chatRoomList
        let bulletin = await db.Bulletin.findAll()

        // 모든 유저들과의 1대1 방 추가
        for (const bulletinElement of bulletin) {
            chatRoomList = []
            chatRoomList.push(bulletinElement.id)
            let chatRoomOneToOne = await db.ChatRoom.findOrCreate({
                where : {people : `${chatRoomList}`.trim()},
                defaults : {people : `${chatRoomList}`.trim()}
            })
            let chatRoomData = chatRoomOneToOne[0]

            await db.UserChatRoom.findOrCreate({
                where :{
                    user_id : res.locals.userIndex,
                    chat_room_id : chatRoomData.id
                },
                defaults:{
                    user_id : res.locals.userIndex,
                    chat_room_id : chatRoomData.id
                }
            })


        }

        res.render('chat/home',{session : res.locals})
    }catch (e) {

    }
}