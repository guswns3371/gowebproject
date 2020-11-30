$('#imageFileOpenInput').change(function (e){
    let imageFile = e.target.files[0]
    let imagePath = URL.createObjectURL(imageFile)
    $("#editImage").attr('src',imagePath)
});
//
// $("#editBtn").on('click',function (){
//     let imageFile = $("#imageFileOpenInput")[0].files[0]
//     let email = $("#edit-userEmail").val()
//     let name = $("#edit-userName").val()
//
//     let formData = new FormData();
//     formData.append("email", email);
//     formData.append("name", name);
//     formData.append("file", imageFile);
//
//     $.ajax({
//         url :'http://localhost:3000/user/edit',
//         async: true,
//         type:'POST',
//         data: formData,
//         datatype : 'formData',
//         success:function(jqXHR) {
//             const value = JSON.parse(jqXHR)
//             if (value.isResent === true) {
//                 alert("토큰이 재전송 되었습니다.")
//             }else {
//                 alert("[토큰 재전송 오류] 관리자에게 문의해주세요.")
//             }
//         }
//     })
// })