const ChatModel = require('../model/chatModel');

exports.makeChatRoom = function (req,res) {
    const chatRoom = new ChatModel(req.body);
    console.log(chatRoom);

    ChatModel.makeChatRoom(chatRoom, function (err, content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("makeChatRoom then :",r)
    });
};

exports.getChatHistory = function (req,res) {
    console.log("===>>  getChat__History room_id : ",req.params.id);

    ChatModel.getChatHistory(req.params.id, function (err,content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("getChatHistory then :",r)
    });
};

exports.getChatRoomList = function (req,res) {
    console.log("===>>  getChat__RoomList user_id : ",req.params.id);

    ChatModel.getChatRoomList(req.params.id, function (err,content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("getChatRoomList then :",r)
    });
};

exports.makeHistory = function (req,res) {
    console.log("makeHistory req.body",req.body);
    console.log("makeHistory req.files",req.files);

    ChatModel.makeHistory(req, function (err,content) {
        if (err)
            res.json(err);
        res.json(content);
    }).then(r  => {
        console.log("makeHistory then :",r)
    });
};