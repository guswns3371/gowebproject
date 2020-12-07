// url 파라미터 값 추출 메소드
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
        return null;
    }
    else{
        return results[1] || 0;
    }
}

// write
let menuId = -1
$('.dropdown-item').on('click',function (e) {
    menuId = $(this).attr('id');
    const menuName = $(this).text();
    $('#dropdownMenuButton').html(menuName)
})

$('#writeBtn').on('click',function (e) {
    const title = $('#title').val();
    const content = $('textarea#content').val();

    if (title.length === 0 || content.length === 0 || menuId === -1) {
        alert("게시판, 제목, 본문을 정확히 입력해주세요")
        return
    }

    $.ajax({
        url :'http://localhost:3000/post/write',
        async: true,
        type:'POST',
        data: {
            title: title,
            content: content,
            bulletinId: menuId
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.success === true) {
                window.location.href="/bulletin/"+menuId
            }else {
                alert("게시물을 작성하지 못했습니다. 관리자에게 문의하세요 "+value.message);
            }
        }
    })
})
// 댓글쓰기 버튼
$('#reply-write').on('click',function (){
    let replyContent = $('textarea#reply-content').val()
    let postItemId = parseInt($.urlParam('id'))

    if (replyContent.length === 0)
        return

    $.ajax({
        url :'http://localhost:3000/post/reply',
        async: true,
        type:'POST',
        data: {
            content: replyContent,
            postItemId: postItemId
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.success === true) {
                window.location.href="/post?id="+postItemId
                $('textarea#reply-content').html('')
            }else {
                alert("댓글을 작성하지 못했습니다. 관리자에게 문의하세요 "+value.message);
            }
        }
    })
});
// 대댓글 버튼
let replyIndex =-1
$('.re-reply').on('click',function (){
    replyIndex = $(this).attr('name')
    $('.re-reply-card').css('display','none')
    $('#re-reply-card-'+replyIndex).css('display','block')
});
// 대댓글 쓰기 버튼
$('.re-reply-write').on('click',function (){
    let replyContent = $('textarea#re-reply-content-'+replyIndex).val()
    let postItemId = parseInt($.urlParam('id'))
    let replyId = replyIndex

    if (replyContent.length === 0 || replyId === -1)
        return

    $.ajax({
        url :'http://localhost:3000/post/reply',
        async: true,
        type:'POST',
        data: {
            content: replyContent,
            postItemId: postItemId,
            replyId: replyId
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.success === true) {
                window.location.href="/post?id="+postItemId
                $('textarea#re-reply-content-'+replyIndex).html('')
            }else {
                alert("댓글을 작성하지 못했습니다. 관리자에게 문의하세요 "+value.message);
            }
        }
    })
});
// 대댓글 취소 버튼
$('.re-reply-cancel').on('click',function (){
    $('#re-reply-card-'+replyIndex).css('display','none')
});
$('#reply-reload').on('click',function (){
    location.reload();
});

// inner
$('#likeBtn').on('click',function (){
    let page = parseInt($.urlParam('id'))
    let result = confirm("이 글에 공감하시겠습니까?")

    if (result){
        let likeCount = parseInt($(this).text())

        $.ajax({
            url :'http://localhost:3000/post/like',
            async: true,
            type:'POST',
            data: {
                postItemId: page
            },// 전송할 데이터
            context: document.body,
            dataType:'html',// xml, json, script, html
            success:function(jqXHR) {
                const value = JSON.parse(jqXHR)
                if (value.success) {
                    likeCount++
                    $('#likeBtn').html(' '+likeCount)
                }else {
                    alert(value.message);
                }
            }
        })
    }

})

let category
$(document).ready(function () {
    // paging
    let page = parseInt($.urlParam('page'))
    category = parseInt($.urlParam('id'))
    if (isNaN(page))
        page = 1

    $('#page'+page).css("background","#4e73df").css("color",'#ffffff')

    $('textarea#reply-content').html('')
})
//페이징 버튼
$(".page-link").on('click',function (){
    let page = $(this).attr('name')
    window.location.href='http://localhost:3000/bulletin?id='+category+"&page="+page;
})

