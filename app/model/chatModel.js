const db = require('../../models');

const Chat = function (infos) {
    this.chat_user_id = infos.chat_user_id;
    this.chat_room_id = infos.chat_room_id;
    this.chat_room_people = infos.chat_room_people;
    this.chat_current_room_people = infos.chat_current_room_people;
};

Chat.makeChatRoom = async function(chatRoom,result){
    let user_id = chatRoom.chat_user_id;
    let room_id = chatRoom.chat_room_id;
    let room_people = chatRoom.chat_room_people;
    let send = {};
    let _room_id_ = "";
    let userName;
    let roomName ="";
    let user;
    let array = [];

    if (room_id !== null && typeof room_id !== "undefined"){
        // chat fragment에서 채팅을 연 경우 => 이미 존재
        console.log(" chat fragment에서 채팅을 연 경우");

        const findChatRoom = await db.ChatRoom.findOne({where: {id: room_id}});
        if (findChatRoom){
            // 존재하는 방
            _room_id_ = findChatRoom.id;

            const user_chat_room_info_0 = await db.UserChatRoom.findOne({
                where: {user_id: user_id, chat_room_id: _room_id_}
            });
            send.success = true;
            send.chat_room_id = `${_room_id_}`;
            send.chat_room_people = `${room_people}`;
            send.chat_room_name = user_chat_room_info_0.room_name;
            send.message = "존재하는 채팅방";

            for (const person of room_people){

                // 자신의 정보는 뺀다
                if (person !== user_id || room_people.length === 1 ){
                    const userInfo = await db.UserInfo.findByPk(person);
                    user = userInfo.dataValues;

                    // 이과정을 해줘야 패스워드 가 나타나지 않는다
                    array.push( {
                        id :  user.id,
                        user_id :  user.user_id,
                        email :  user.email,
                        name :  user.name,
                        message :  user.message,
                        profile_image :  user.profile_image,
                        back_image :  user.back_image
                    });
                }
            }

            send.chat_room_people_info_list =array;

        }else {
            // 없는 방
            send.success = false;
            send.message = "존재하지 않는 채팅방";
       }

    }else {
        // chat_room_id가 null 인경우 (1:1 채팅 또는 나와의 채팅)
        console.log(" 1:1 채팅을 연 경우 또는 단톡방");

        //JSON.stringify 하면 ['1','3'] => ["1","3"] 으로 변환 가능
        //의미 없네 ㅅㅂ
        console.log(JSON.stringify(room_people)+"");

        let RoomData ;

        const findChatRoom = await db.ChatRoom.findAll();
        for (let key in findChatRoom){
            if (findChatRoom[key].dataValues.people === JSON.stringify(room_people))
                RoomData = findChatRoom[key].dataValues;
        }
        const room__data = await db.ChatRoom.findOne({where:{people : `${room_people}`}});

       // console.log(room__data.dataValues.people)
        //check
        if (room__data) {
            // 이미 존재하는 채팅방
            console.log("  이미 존재하는 채팅방");
            _room_id_ = room__data.id;

            if (room_id === undefined){
                // 유저 프로필에서 방을 들어올때 또는 채팅방을 새로 만들경우
                console.log(" 유저 프로필에서 방을 들어올때 또는 채팅방을 새로 만들경우");
               // UserChatRoom에 기록
                const createUser_ChatRoom = await db.UserChatRoom.findOne({
                    where : {user_id : user_id,chat_room_id : _room_id_}
                });

                if (createUser_ChatRoom === null){
                    // UserChatRoom에 저장이 안된 방
                     const user_char_room_info =   await db.UserChatRoom.create({
                        user_id : user_id,chat_room_id : _room_id_
                    });

                    send.chat_room_name = user_char_room_info.dataValues.room_name;
                }else {
                    send.chat_room_name = createUser_ChatRoom.dataValues.room_name;
                }
            }

            send.success = true;
            send.chat_room_id = `${_room_id_}`;
            send.chat_room_people = `${room_people}`;
            send.message = "이미 존재하는 채팅방";
            for (const person of room_people){

                // 자신의 정보는 뺀다
                if (person !== user_id || room_people.length === 1 ){
                    const userInfo = await db.UserInfo.findByPk(person);
                    user = userInfo.dataValues;

                    // 이과정을 해줘야 패스워드 가 나타나지 않는다
                    array.push( {
                        id :  user.id,
                        user_id :  user.user_id,
                        email :  user.email,
                        name :  user.name,
                        message :  user.message,
                        profile_image :  user.profile_image,
                        back_image :  user.back_image
                    });
                }
            }

            send.chat_room_people_info_list =array;

        } else {
            // 만들어진적이 없는 채팅방
            console.log("  만들어진적이 없는 채팅방");
           // console.log({room_people});
            //console.log("room_people.length",room_people.length);

            // 채팅방의 사람들과 이름을 ChatRoom디비에 저장
            if (room_people === undefined){
                console.log({room_people});
                console.log("room_people 이 undefined이므로 채팅방이 만들어지지 않았습니다!");
            }
            const createChatRoom = await db.ChatRoom.create({
                people: `${room_people}`
            });

            _room_id_ = createChatRoom.id;

            if (createChatRoom) {

                let room__Name ="";
                for (const roomUserId of room_people){

                    // 채팅방 이름 생성
                    for(const room_user_id of room_people){
                        if (room_user_id !== roomUserId || room_people.length === 1){
                            const roomUserInfo = await db.UserInfo.findByPk(room_user_id);
                            userName = roomUserInfo.dataValues.name;
                            roomName += `${userName},`
                        }
                    }
                    //채팅방 이름 마지막 쉼표 없애기
                    roomName = roomName.substring(0, roomName.length - 1);
                    //console.log({roomName});

                    // UserChatRoom에 기록
                    const createUser_ChatRoom = await db.UserChatRoom.count({
                        where : {
                            user_id : roomUserId,
                            chat_room_id : _room_id_
                        }
                    });

                    if (createUser_ChatRoom === 0){
                        // UserChatRoom에 저장이 안된 방
                      const user_chat_room_info_2 = await db.UserChatRoom.create({
                            user_id : roomUserId,
                            chat_room_id : _room_id_,
                            room_name : roomName
                        });

                      if (user_id === roomUserId)
                          send.chat_room_name = user_chat_room_info_2.room_name;
                    }
                    roomName = ""
                }

                send.success = true;
                send.chat_room_id = `${_room_id_}`;
                send.chat_room_people = `${room_people}`;
                send.message = "채팅방 사람목록 생성 됨";

                for (const person of room_people){

                    // 자신의 정보는 뺀다
                    if (person !== user_id || room_people.length === 1 ){ 
                        const userInfo = await db.UserInfo.findByPk(person);
                        user = userInfo.dataValues;

                        // 이과정을 해줘야 패스워드 가 나타나지 않는다
                        array.push( {
                            id :  user.id,
                            user_id :  user.user_id,
                            email :  user.email,
                            name :  user.name,
                            message :  user.message,
                            profile_image :  user.profile_image,
                            back_image :  user.back_image
                        });
                    }
                }

                send.chat_room_people_info_list =array;
            } else {
                send.success = false;
                send.message = "채팅방 사람목록 생성 안됨";
            }
        }
        console.log("ChatRoom id",_room_id_);
        console.log("ChatRoom people",room_people);
 
    }
    result(null,send);
};

Chat.getChatHistory = async function(chatRoodId,result){
    let res = [];
    let historyData;
    const history = await db.ChatHistory.findAll({
        attributes : ["id","chat_room_id","chat_user_id","content","read_people","time"],
        where : {chat_room_id : chatRoodId}
    });
    //console.log({history});

    if (history){

        /** forEach는 await 함수를 사용 못하는데
         * for .. of 는 사용가능하다~~~~!!!!!!
         */
        for (const his of history) {
            historyData = his.dataValues;
            let time = historyData.time;
           // historyData.read_people = `${historyData.read_people}`;
            historyData.time = time.format("a/p hh:mm");
            const user = await db.UserInfo.findByPk(historyData.chat_user_id);

            if (user === undefined){
                historyData["user_info"] = {
                    id :  null,
                    user_id :  null,
                    email : null,
                    name :  "알수없음",
                    message :  null,
                    profile_image :  null,
                    back_image :  null
                };
            }else {
                historyData["user_info"] = {
                    id :  user.id,
                    user_id :  user.user_id,
                    email :  user.email,
                    name :  user.name,
                    message :  user.message,
                    profile_image :  user.profile_image,
                    back_image :  user.back_image
                };
            }


            //console.log(historyData);
            res.push(historyData);
        }
    }else {

    }
    //console.log("getChatHistory res",res);

    result(null,res);
};

Chat.getChatRoomList = async function(userId,result){
    let room_info_list = [];
    let res = [];
    let array = [];
    let user;
    let room_infos;
    let roomInfoData;


    // 유저가 들어간 채팅방 id 정보들
    const chatRoomList = await db.UserChatRoom.findAll({
        attributes : ["chat_room_id","unread_num","room_name"],
        where : {user_id : userId}
    });

    for(const chatRoom of chatRoomList){
        room_info_list.push(chatRoom.dataValues);
    }


    // 유저가 들어간 채팅방의 모든 정보들
    for (const room of room_info_list){
        room_infos = await db.ChatRoom.findByPk(room.chat_room_id);

        if (room_infos !== null){
            if (room_infos.dataValues.last_time !== null){
                roomInfoData = room_infos.dataValues;
                let time = roomInfoData.last_time;
                roomInfoData.real_time = time;
                roomInfoData.last_time = time.format("a/p hh:mm");
                room["chat_room_info"] = roomInfoData;
                room["user_info"] = [];

                // 단순 문자열"1,48" =>  1,48 ==> ["1","48"] 로 만드는 과정
                console.log(roomInfoData.people);


                array = (roomInfoData.people).split(",");
                console.log({array});
               // return ;
                for (const id of array){

                    // 자신의 정보는 뺀다다
                   if (id !== userId || array.length === 1 ){
                        const userInfo = await db.UserInfo.findByPk(id);
                        user = userInfo.dataValues;

                        // 이과정을 해줘야 패스워드 가 나타나지 않는다다
                        room["user_info"].push( {
                            id :  user.id,
                            user_id :  user.user_id,
                            email :  user.email,
                            name :  user.name,
                            message :  user.message,
                            profile_image :  user.profile_image,
                            back_image :  user.back_image
                        });
                    }
                }

                res.push(room);
            }
        }

    }

    // 가장 최근에 갱신된 순서로 sorting 한다다
   res.sort(function (a,b) {
        return a.chat_room_info.real_time > b.chat_room_info.real_time
            ? -1 : a.chat_room_info.real_time < b.chat_room_info.real_time ? 1 : 0;
    });

    // console.log({res});

    result(null,res);
};

Chat.makeHistory = async function(req,result){
    let send = {};
    let body = req.body;
    let file = req.files;
    let now = new Date();

    const history = await db.ChatHistory.create({
        chat_room_id : body.chat_room_id,
        chat_user_id : body.chat_user_id,
        content : body.content,
        read_people : null,
        time : now
    });

    if (history){
        const chatRoom = await db.ChatRoom.findOne({where : { id : body.chat_room_id}});

        if (chatRoom){
            send.success = true;
            send.chat_room_id = `${history.chat_room_id}`;
            send.chat_room_people = `${chatRoom.people}`;
            send.message = "채팅 기록 완료";
        }else {

        }

    }else {
        send.success = false;
        send.chat_room_id = `${history.chat_room_id}`;
        send.message = "채팅 기록 실패";
    }

    result(null,send);
};

module.exports = Chat;




/**
 * @return {boolean}
 */
function IsJsonString(str) {
    try {
        var json = JSON.parse(str);
        return (typeof json === 'object');
    } catch (e) {
        return false;
    }
}

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

/**
 * @return {string}
 */
function JSONtoString(json){
    try {
        return JSON.stringify(json);
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