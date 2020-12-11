

exports.entered = function (io,user,sockets) {
    console.log("online user index : ",user);
    console.log('socket id : ',sockets.id);
};

exports.messageReceived = async function (io, data, sockets) {
    console.log("messageReceived", data)

    await db.ChatHistory.create({
        chat_room_id: data.roomId,
        chat_user_id: data.userIndex,
        content: data.message
    }).then(result => {
        console.log(result)
    }).catch(err => {
        console.log(err)
    })

    let response
    let roomId = data.roomId;
    let chatHistory = await db.ChatHistory.findAll({
        where : {
            chat_room_id : roomId
        },
        include: [{model : db.UserInfo}]
    })

    for (const history of chatHistory) {
        let userInfo = history.UserInfo
        response ={
            chat_history_id : history.id,
            chat_room_id : roomId,
            user_id : userInfo.user_id,
            user_index : userInfo.id,
            user_name : userInfo.name,
            user_image : userInfo.profile_image,
            content : history.content,
            time : history.createdAt.format("hh:mm")
        }
    }
    sockets.emit('sendToEvery',response)
    sockets.broadcast.emit('sendToEvery',response)
}
