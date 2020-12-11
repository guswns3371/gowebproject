
module.exports =  (io)=> {

    const controller = require('./socketController');
    const myController = require('./controller');

    io.on('connection',function (socket) {

        console.log('  ');
        console.log('<|> ========== [ Socket Connected ] ========== <|>');

        socket.on('enter',(user)=>{
            myController.entered(io,user,socket)
        })

        socket.on('send',(data)=>{
            myController.messageReceived(io,data,socket)
        })

        // socket.on('online_user',(user)=>{controller.userConnected(io,user,socket)});
        //
        // socket.on('offline_user',(user) =>{controller.userDisconnected(io,user,socket)});
        //
        // socket.on('chat_room_enter',(user) => {controller.enterChatRoom(io, user, socket)
        //     .then(r =>{
        //         console.log("enterChatRoom then",r)})});
        //
        // socket.on('chat_room_exit',(user) => {controller.exitChatRoom(io,user,socket)});
        //
        // socket.on('chat_message',(chat) => {controller.chatMessage(io, chat, socket).then(r =>{
        //     console.log("chatMessage then ",r);
        // })});
        //
        // socket.on('on_typing',controller.onTyping);

    });
};