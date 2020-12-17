// login

$('#loginBtn').on('click',function (e) {
    const email = $('#emailInput').val();
    const password = $('#passwordInput').val();
    const autoLoginCheck = $('#customCheck').is(":checked");

    if (email.length ===0 || password.length === 0) {
        alert("이메일, 비밀번호를 정확히 입력해주세요")
        return
    }

    $.ajax({
        url:'http://localhost:3000/login',
        async: true,
        type:'POST',
        data: {
            email: email,
            password: password,
            autoLoginCheck : autoLoginCheck
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        beforeSend:function(jqXHR) {
        },// 서버 요청 전 호출 되는 함수 return false; 일 경우 요청 중단
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.isCorrect === true){
                $('#loginErr').text("")
                if (value.isConfirmed === true){
                    localStorage.userIndex = value.id
                    localStorage.userName = value.name
                    //localStorage.getItem('userIndex')로 가져온다
                    window.location.href = "/"
                }else {
                    window.location.href = `/verify?email=${email}`
                }
            }else {
                $('#loginErr').text("이메일, 비밀번호를 확인해주세요")
            }
        },// 요청 완료 시
        error:function(jqXHR) {
        },// 요청 실패.
        complete:function(jqXHR) {
        }// 요청의 실패, 성공과 상관 없이 완료 될 경우 호출
    });
})

$('#verifyBtn').on('click',function () {
    const secretToken = $('#secretToken').val();
    const email = $('#emailSpan').text();

    if (secretToken.length === 0) {
        alert('정확한 토큰을 입력해주세요')
        return
    }

    $.ajax({
        url :'http://localhost:3000/verify',
        async: true,
        type:'POST',
        data: {
            email: email,
            secretToken: secretToken
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.isConfirmed === true) {
                alert("이메일 인증이 완료되었습니다\n다시 로그인해주세요")
                window.location.href="/login"
            }else {
                $('#secretTokenErr').text("토큰을 확인해주세요")
            }
        }
    })
})

$('#tokenResendLink').on('click', function () {
    const email = $('#emailSpan').text();

    $.ajax({
        url :'http://localhost:3000/verify/resend',
        async: true,
        type:'POST',
        data: {
            email: email
        },// 전송할 데이터
        dataType:'html',// xml, json, script, html
        success:function(jqXHR) {
            const value = JSON.parse(jqXHR)
            if (value.isResent === true) {
                alert("토큰이 재전송 되었습니다.")
            }else {
                alert("[토큰 재전송 오류] 관리자에게 문의해주세요.")
            }
        }
    })
})
// register

const userIdReg = RegExp(/^(?=.*[a-z])(?=.*\d).{5,12}$/i)
const userNameReg = RegExp(/^[가-힣]{2,6}$/)
const userEmailReg = RegExp(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/)
const userPasswordReg = RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,14}$/)
let validationName = false
let validationPass = false
let validationPassRe = false
let doubleCheck = false
let idCheck = false

$.validator.unobtrusive.options = {
    errorPlacement: function ($error, $element) {
        $element.triggerHandler("onValidationId");
        $element.triggerHandler("onValidationName");
        $element.triggerHandler("onValidationEmail");
        $element.triggerHandler("onValidationPassword");
        $element.triggerHandler("onValidationPassRepeat");
    }
};

$('#userId').on({
    onValidationId: function () {
        const userId = $('#userId').val()
        if (userIdReg.test(userId)){
            $.post(`http://localhost:3000/register/id/${userId}`,{id : userId},
                function (result) {
                    idCheck = result.isIdOk;

                    if (idCheck)
                    {
                        $('#userIdErr').css('color', 'green').text('사용가능한 아이디입니다');
                    }
                    else
                    {
                        $('#userIdErr').css('color', 'red').text('이미 사용중인 아이디입니다')
                    }

                }).fail(function (){
                $('#userIdErr').css('color', 'red').text("사용불가능한 아이디입니다")
            })
        } else {
            console.log('userName','onError')
            $('#userIdErr').css('color', 'red').text("아이디는 영어,숫자포함 5~12자")
            idCheck = false
        }
    }
})

$('#userName').on({
    onValidationName: function () {
        if (userNameReg.test($('#userName').val())){
            console.log('userName','onSuccess')
            $('#userNameErr').text("")
            validationName = true
        } else {
            console.log('userName','onError')
            $('#userNameErr').text("이름은 2~6글자의 한글")
            validationName = false
        }
    }
})

$('#userEmail').on({
    onValidationEmail: function () {
        const checkBtn = $('#checkEmailBtn')

        if (userEmailReg.test($('#userEmail').val())){
            console.log('userEmail','onSuccess')
            $('#userEmailErr').text("")
            checkBtn.prop('disabled',false)
        } else {
            console.log('userEmail','onError')
            $('#userEmailErr').text("이메일 형식이 맞지 않습니다")
            checkBtn.prop('disabled',true)
        }
    }
})

$('#userPassword').on({
    onValidationPassword: function () {
        const userRepeatPassword = $('#userRepeatPassword')
        if (userPasswordReg.test($('#userPassword').val())){
            console.log('userPassword','onSuccess')
            $('#userPasswordErr').text("")
            validationPass = true
            userRepeatPassword.attr('readonly',false)
        } else {
            console.log('userPassword','onError')
            $('#userPasswordErr').text("영대소문자,숫자,특수문자 포함 8~14자")
            validationPass = false
            userRepeatPassword.attr('readonly',true)
        }
    }
})

$('#userRepeatPassword').on({
    onValidationPassRepeat: function () {
        const userRepeatPassword = $('#userRepeatPassword').val()
        if (userRepeatPassword === $('#userPassword').val()
            && userRepeatPassword.length !== 0){
            console.log('userRepeatPassword','onSuccess')
            $('#userRepeatPasswordErr').text("")
            validationPassRe = true
        } else {
            console.log('userRepeatPassword','onError')
            $('#userRepeatPasswordErr').text("비밀번호와 일치하지 않습니다")
            validationPassRe = false
        }
    }
})

$('#checkEmailBtn').on('click', function () {
        const email = $('#userEmail').val()

        $.post(`http://localhost:3000/register/email/${email}`,{email : email},
            function (result) {
            doubleCheck = result.isEmailOk;

            if (doubleCheck)
                alert('사용가능한 이메일입니다');
            else
                alert('이미 사용중인 이메일입니다')

        }).fail(function (){
            alert('이메일 중복확인 오류')
            doubleCheck = false
        })
    }
)
$('#registerBtn').on('click',function (e) {

    if (validationPassRe === false || validationPass === false || validationName === false){
        alert('회원정보를 올바르게 입력해주십시오')
        e.preventDefault()
        e.stopPropagation()
    }
    else if (doubleCheck === false){
        alert('이메일 중복확인이 필요합니다')
        e.preventDefault()
        e.stopPropagation()
    }
    else if (idCheck === false){
        alert('사용불가능한 아이디입니다')
        e.preventDefault()
        e.stopPropagation()
    }
})

$(function () {
    $('#registerForm').valid();
});

