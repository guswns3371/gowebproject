
let roomId

function refreshChatRoomList() {
    $.ajax({
        url :'http://localhost:3000/chat/list',
        async: true,
        type:'GET',
        context: document.body,
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)

            roomId = value[0].chat_room_id
            getChatHistory(roomId)

            let html = ""
            value.forEach(data=>{
                let user_id = data.user_id;
                let chat_room_id = data.chat_room_id;
                let user_image = data.user_image;
                let room_name = data.room_name;
                let last_content = data.last_content;
                let last_time = data.last_time;

                if (typeof last_content === 'undefined')
                    last_content = ""

                if (user_image === null)
                    user_image = "/images/account_default.jpg"

                html += `                
                <div class="row chat-room-list" name="${chat_room_id}">
                    <div class="col-xl-2 col-lg-5">
                        <img src="${user_image}" style="width: 50px; height: 50px" id="${user_id}">
                    </div>

                    <div class="col-xl-10 col-lg-7">
                        <h4 class="small font-weight-bold text-gray-900">${room_name} <span class="float-right">${last_time}</span></h4>
                        ${last_content}
                    </div>
                </div>`
            })
            $('#chatListBox').empty().append(html)
        }
    })
}

// 채팅방 기록 가져오기
function getChatHistory(roomId) {
    $.ajax({
        url :'http://localhost:3000/chat/history',
        async: true,
        type:'POST',
        data: {
            chat_room_id: roomId
        },// 전송할 데이터
        context: document.body,
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            let html = ""

            value.forEach(data =>{
                let mine = data.mine;
                let chat_history_id = data.chat_history_id;
                let user_id = data.user_id;
                let user_name = data.user_name;
                let user_image = data.user_image;
                let content = data.content;
                let time = data.time;
                let val = ""

                if (mine)
                    val = `
                    <div class="col-xl-7 col-lg-0"></div>
                    `
                else
                    val=`
                        <div class="col-xl-0 col-lg-1">
                            <img src="${user_image}" style="width: 40px; height: 40px" id="${user_id}">
                        </div>
                    `
                html += `
                <div class="chat-history ">
                    <div class="row" name="${chat_history_id}">
                        ${val}
                        <div class="col-xl-5 col-lg-7">
                            <h4 class="small font-weight-bold text-gray-900">${user_name} <span class="float-right">${time}</span></h4>
                            ${content}
                        </div>
                    </div>
                </div>

                `
            })
            $('#chatHistoryBox').empty().append(html)
        }
    })
}

function sendMessage(message) {
    $.ajax({
        url :'http://localhost:3000/chat/message',
        async: true,
        type:'POST',
        data: {
            chat_room_id: roomId,
            message : message
        },// 전송할 데이터
        context: document.body,
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            $('#chatSendInput').val('')
            getChatHistory(roomId)
        }
    })
}
// 채팅방 리스트 새로고침
$("#refreshChatList").on('click', function () {
    refreshChatRoomList()
})

// 채팅 보내기
$("#sendChatBtn").on('click', function () {
    const message = $('#chatSendInput').val()
    sendMessage(message)
})

// 채팅방 클릭
$(document).on('click','.chat-room-list',function (){
    roomId = $(this).attr('name')
    getChatHistory(roomId)
})

$(document).ready(function () {
    if ($("#chatListBox").html().length > 0) {
        refreshChatRoomList()
    }
})

let ws = new WebSocket("http://localhost:3000/")