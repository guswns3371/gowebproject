// write
$('#writeBtn').on('click',function (e) {
    const title = $('#title').val();
    const content = $('textarea#content').val();

    if (title.length === 0 || content.length === 0) {
        alert("제목, 본문을 정확히 입력해주세요")
        return
    }

    $.ajax({
        url :'http://localhost:3000/post/write',
        async: true,
        type:'POST',
        data: {
            title: title,
            content: content
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.success === true) {
                window.location.href="/post"
            }else {
                alert("게시물을 작성하지 못했습니다. 관리자에게 문의하세요 "+value.message);
            }
        }
    })
})