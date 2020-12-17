
module.exports =  (io)=> {

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

    });
};