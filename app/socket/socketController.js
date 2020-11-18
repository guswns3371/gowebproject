const models = require('../../models');
const moment = require('moment');
const fcmSender = require('../util/fcmSender');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// offline online
var whoIsOn = {};

// room enter exit
var User_Rooms = {};

exports.userConnected = function (io,user,sockets) {
    console.log("[on]\nwho is on",whoIsOn);
    console.log("online user ",user);
    console.log('socket id : ',sockets.id);

    delete whoIsOn[user.id];
    whoIsOn[user.id] = sockets.id;

    /** 아래와 같이 하면 그냥 String 으로 넘어가므로 쉽게 파싱을 할 수 있습니다.
     * 그냥 넘기면 JSONArray로 넘어가서 복잡해집니다.
     */
    let whoIsOnJson = [];
    for(let key in whoIsOn){
        whoIsOnJson.push(key);
    }

    // console.log(whoIsOnJson);
    console.log({whoIsOn});

    io.emit('__online_user',`${whoIsOnJson}`)
};


exports.userDisconnected = function (io,user,sockets) {
    console.log("[off]\nwho is on",whoIsOn);
    console.log("offline user ",user);
   // console.log("offline user is Empty ?",user.id === undefined);

    if (user.id !== undefined && typeof user.id !== "undefined"){
        delete whoIsOn[user.id];

        let whoIsOnJson = [];
        for(let key in whoIsOn){
            whoIsOnJson.push(key);
        }
        // console.log(whoIsOnJson);
        console.log({whoIsOn});

        let data = {
            whoIsOn : `${whoIsOnJson}`,
            disconnected : user.id
        };

        io.emit('__offline_user',data);
    }
};

exports.enterChatRoom = async function(io,user,sockets){
    console.log(" ==============> [enter] ",user);

    //유저가 방을 들어오면 Rooms 배열에서 방 추가
    let isExist = false;
    for (let key in User_Rooms){
        if (key === user.id)
            isExist = key === user.id;
    }
    let array = [];
    let currentRoomUserList = [];
    let read_people_list_on_DB =[];
    let one = "";

    if (user.chat_room_id !== undefined && user.id !== undefined){
        if (isExist){
            // 이미 존재한 경우
            let isDuplicate = User_Rooms[user.id].some(room => {
                return room === user.chat_room_id;
            });

            if (!isDuplicate){
                array = User_Rooms[user.id];
                array.push(user.chat_room_id);
                User_Rooms[user.id]=array;
            }
        }else {
            // 존재 하지 않은 경우
                array.push(user.chat_room_id);
                User_Rooms[user.id]=array;
            }

        console.log({User_Rooms});
        for (let user_id in User_Rooms){
            if (User_Rooms[`${user_id}`].includes(user.chat_room_id))
                currentRoomUserList.push(`${user_id}`);
        }

        // 방금 메시지 읽은 사람정보 업데이트
        // 이전에 읽은 메시지는 업데이트 하면 안됨
        // 채팅 기록의 id가 꼭있어야 한다
        const history = await models.ChatHistory.findAll({
            attributes : ["read_people","id"],
            where : {chat_room_id : user.chat_room_id}
        });

        for (const chat of history){
            //.replace(/"/gi,""); /문자/gi 하면 replaceAll 처럼 사용가능
            // 단순 문자열 "1,48" =>  1,48 ==> ["1","48"] 로 만드는 과정
            // console.log({chat : chat.dataValues.read_people});
            read_people_list_on_DB = (chat.dataValues.read_people).split(",");

            // 메시지를 읽은 사람(read_people_list)중 자신이 없을때에만 ChatHistory의 read_people 업데이트
            //console.log(`[${user.id}] include ? `,read_people_list_on_DB.includes(user.id));
            if (!read_people_list_on_DB.includes(user.id)){
                // 자신을 추가하고나서
                read_people_list_on_DB.push(user.id);

                //오름차순 정렬렬
               read_people_list_on_DB.sort(function (a, b) {
                    return a < b ? -1 : a > b ? 1 : 0;
                });

               // ChatHistory의 read_people 업데이트
               await models.ChatHistory.update(
                    {
                        read_people: `${read_people_list_on_DB}`
                    },
                    {
                        where: {
                            chat_room_id : user.chat_room_id,
                            id : chat.id
                        }
                    }
                ).then(res=>{
                    console.log("ChatHistory updated!");
                }).catch(err=>{
                    console.log("ChatHistory not updated :(",err);
                });

               await models.UserChatRoom.update(
                    {
                        unread_num: 0
                    },
                    {
                        where : {user_id : user.id, chat_room_id : user.chat_room_id}
                    }
                ).then(res=>{
                    console.log("UserChatRoom updated!");
                }).catch(err=>{
                    console.log("UserChatRoom not updated :(",err);
                });

            }
        }




        // socket join
        sockets.join('room'+user.chat_room_id,()=>{
            console.log(`[join] [유저 ${user.id}] ${user.chat_room_id}번방`);
            console.log("[room]",sockets.adapter.rooms['room'+user.chat_room_id]);
        });
    }

    // Rooms={};

    console.log({currentRoomUserList});
    io.emit('__chat_room_enter'+user.chat_room_id,`${currentRoomUserList}`);
};



exports.exitChatRoom = function(io,user,sockets){
    console.log(" ==============> [exit] ",user);


    if (User_Rooms[user.id] !== undefined && typeof User_Rooms[user.id] !== "undefined" && user.id !== undefined){
        //유저가 방을 나간후 Rooms 배열에서 방 삭제
        let array = [];
        User_Rooms[user.id].filter(room =>{
            if (room !== user.chat_room_id)
                array.push(room);
        });

        User_Rooms[user.id] = array;

        //socket leave
        sockets.leave('room'+user.chat_room_id,()=> {
            console.log(`[leave] [유저 ${user.id}] ${user.chat_room_id}번방`);
            console.log("[room]",sockets.adapter.rooms['room'+user.chat_room_id]);
        });
    }

    // Rooms={};
    console.log({User_Rooms});

    let currentRoomUserList = [];
    for (let user_id in User_Rooms){
        if (User_Rooms[`${user_id}`].includes(user.chat_room_id))
            currentRoomUserList.push(user_id);
    }
    console.log({currentRoomUserList});
    io.emit('__chat_room_exit'+user.chat_room_id,`${currentRoomUserList}`);
};
 
exports.chatMessage = async function (io, chat, sockets) {
    console.log("==============>> [chat] message :  ", chat);
    // 한국 시간
    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    let fcmTitle = "";
    let fcmWho = "";
    let fcmImage = "";
    let fcmContent = "";
    let fcmToken = "";

    const user = await models.UserInfo.findByPk(chat.chat_user_id);

    fcmContent = chat.content;
    fcmWho = user.name;
    fcmImage = user.profile_image;

    models.ChatHistory.create({
        chat_room_id: chat.chat_room_id,
        chat_user_id: chat.chat_user_id,
        content: chat.content,
        //read_people 가 제이슨이라서 그래도 가면 안됨 => string 화 시켜준다
        read_people: `${chat.chat_current_room_people}`,
        time: now

    }).then(res=>{
        let object;
        let msg = res.dataValues;
        let time = msg.time;
        msg.time = time.format("a/p hh:mm");

        object = msg;
        object.read_people = `${object.read_people}`;
        object["user_info"] ={
            id :  user.id,
            user_id :  user.user_id,
            email :  user.email,
            name :  user.name,
            message :  user.message,
            profile_image :  user.profile_image,
            back_image :  user.back_image
        };

        // ChatRoom 데이터베이스 정보 업데이트
        models.ChatRoom.update(
            {
                people : `${chat.chat_room_people}`,
                last_content : chat.content,
                last_time : now
            },
            {
                where : {id : chat.chat_room_id}
            }
        ).then(res=>{
            console.log("chatroom updated!");
        }).catch(err=>{
            console.log("chatroom update err ",err);
        });

        // unread num 을 업데이트 하기 위해 UserChatRoom 디비 정보 업데이트
        // chat_room_people.length - chat_current_room_people.length = 안읽은 메시지 개수
        models.ChatHistory.findAll({
            attributes: ["read_people"],
            where : {chat_room_id : chat.chat_room_id}
        }).then(res=>{
            let ReadPeople ={};
            let ReadPeopleList = [];
            let read_people_list = [];
            let unread_count = 0;

            //console.log("[유저] : 안읽은 메시지 수");
            // 전체 채팅방 사람들
            for (var id in chat.chat_room_people){

                // 채팅 읽은 사람들
                for (var key in res){
                    // 채팅을 읽은 사람 리스트
                    read_people_list = (res[`${key}`].dataValues.read_people).split(",");
                    //console.log({read_people_list});
                    if (!read_people_list.includes(chat.chat_room_people[id]))
                        unread_count++;
                }

                // [{ "유저" : 안읽은메시지 개수},{"유저" : 안읽} , ... ]
                ReadPeople= {};
                ReadPeople[`${chat.chat_room_people[id]}`] = unread_count;
                ReadPeopleList.push(ReadPeople);
                //console.log({ReadPeopleList});
                unread_count=0;
            }


            for (const user of ReadPeopleList){
                for (let key in user){
                    // key = user_id, user[key] = 안읽은 메시지
                    console.log(`[${key}] 안읽은 메시지 : ${user[key]}개`);
                    models.UserChatRoom.update(
                        {
                            unread_num : user[key]
                        },
                        {
                            where : {user_id : key, chat_room_id : chat.chat_room_id}
                        }
                    ).then(res=>{
                        console.log("UserChatRoom updated")
                    }).catch(err=>{
                        console.log("UserChatRoom update fail ",err)
                    })
                }

            }

            if (msg !== null){
                //메시지를 현재 room안에 있는 유저에게만 emit
                io.in('room'+chat.chat_room_id).emit('__chat_message',object);

                let peopleForPushMessage;
                let currentChatRoomPeopleArray;
                let whoIsOnArray = [];

                console.log(chat.chat_room_people);
                console.log({whoIsOn});

                peopleForPushMessage = chat.chat_room_people;
                currentChatRoomPeopleArray = chat.chat_current_room_people;

                console.log({currentChatRoomPeopleArray});
                for(let key in whoIsOn){
                    whoIsOnArray.push(key);

                    if (chat.chat_room_people.includes(key)){
                        // 채팅방 멤버중 현재 서버에 접속해있지만

                        if(!chat.chat_current_room_people.includes(key)){
                            // 채팅방 안에는 없는 맴버에게만 emit => fragment update를 위해
                            console.log("socket id ", whoIsOn[`${key}`]);
                            io.to(whoIsOn[`${key}`]).emit('__chat_message_not_in_room', object);
                        }
                    }
                }

                peopleForPushMessage = peopleForPushMessage.filter(item => !currentChatRoomPeopleArray.includes(item));
                console.log({chatRoomPeopleArray: peopleForPushMessage});

                for (const user of peopleForPushMessage){
                    //채팅방 멤버중 현재 접속하지 않은 멤버에게만 push message
                    console.log(`fcm 푸쉬 메시지 보내기 시작 [유저 ${user}]`);

                    models.UserInfo.findOne({where : {id :user}})
                        .then(res=>{
                            models.UserChatRoom.findOne({
                                where:{
                                    chat_room_id : chat.chat_room_id,
                                    user_id : user
                                }
                            })
                                .then(res2=>{
                                    fcmToken = res.dataValues.fcm_token;
                                    fcmTitle = res2.dataValues.room_name;
                                    if (fcmToken !== null){
                                        fcmSender.sendTopicMessage(fcmTitle,fcmWho,fcmImage,fcmContent,fcmToken,
                                            chat.chat_room_id,`${chat.chat_room_people}`);
                                        console.log(`1 [유저 ${user}] fcm 푸쉬 메시지 보냄`);
                                    }else {
                                        console.log(`1 [유저 ${user}] fcmToken가 null`);
                                    }
                                })
                                .catch(err=>{
                                    console.log(`1 [유저 ${user}] fcm 푸쉬 메시지 err`,err);
                                });

                        })
                        .catch(err=>{
                            console.log(`2 [유저 ${user}] fcm 푸쉬 메시지 err`,err);
                        });
                }

            }else {
                io.in('room'+chat.chat_room_id).emit('__chat_message',`메세지 저장 실패`);
                console.log("chat message didn't save");
            }
        }).catch(err=>{
            console.log("ChatHistory find all err ",err);
        });

    }).catch(err=>{
        console.log("chat message didn't save err ",err);
    });



};

exports.onTyping = function (user) {

};

/**
 * @return {null}
 */
function StringtoJSON(str){
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

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
Number.prototype.zf = function(len){return this.toString().zf(len);};
