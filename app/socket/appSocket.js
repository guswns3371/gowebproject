module.exports = function (io) {

    io.sockets.on('connection',function (socket) {

        const controller = require('./socketController');

        console.log('  ');
        console.log('<|> ========== [ Socket Connected ] ========== <|>');

        socket.on('online_user',(user)=>{controller.userConnected(io,user,socket)});

        socket.on('offline_user',(user) =>{controller.userDisconnected(io,user,socket)});

        socket.on('chat_room_enter',(user) => {controller.enterChatRoom(io, user, socket)
            .then(r =>{
                console.log("enterChatRoom then",r)})});

        socket.on('chat_room_exit',(user) => {controller.exitChatRoom(io,user,socket)});

        socket.on('chat_message',(chat) => {controller.chatMessage(io, chat, socket).then(r =>{
            console.log("chatMessage then ",r);
        })});

        socket.on('on_typing',controller.onTyping);

    });
};