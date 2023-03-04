// 登录/注册页面的操作
// 提示函数
function tips(obj, tip) {
    document.getElementById(obj).innerHTML = tip;
}

$(function(){
    // 请求后端的url
    localStorage.setItem("backend_url", "http://localhost:8080");

    // 最终用于登录的手机号
    var finPhone = "";
    // 最终用于登录的验证码
    var finCode = "";
    // 获取验证码输入框
    var codeInput = $("#code").get(0);
    // 获取发送验证码按钮
    var send = $("#send").get(0);
    // 验证码发送的倒计时初值
    var times = 60;

    // 手机号输入框失去焦点 → 验证手机号格式是否合法
    $("#phone").on("blur", function() {
        var phone = this.value.trim();
        var phone_regex = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
        if (phone == ""){
            tips("phoneMsg", "手机号不能为空!");
            finPhone = "";
        } else if(!phone_regex.test(phone)) {
            tips("phoneMsg","请输入正确手机号!");
            finPhone = "";
        } else {
            // 手机号合法
            tips("phoneMsg", "√");
            finPhone = phone;
        }
    });

    // 发送验证码
    $("#send").on("click",function(){
        // 手机号合法才能发送验证码
        if (finPhone != "") {
            // 启用验证码输入框
            codeInput.disabled = false;
            tips("codeMsg", "");
            // 向后台发送验证码请求
            var url = localStorage.getItem("backend_url") + "/user/code";
            $.post(url, {"phone" : finPhone}, function(res){
                // 判断请求是否成功
                if (res.status == "0") {
                    // 开启计时器（60s，验证码有效期2分钟）
                    downToZero();
                } else {
                    tips("codeMsg", "验证码发送失败!");
                }
            }, "json");
        } else {
            tips("phoneMsg","请输入正确手机号!");
        }
    })

    // 验证码用于计时的函数
    function downToZero() {
        send.disabled = true;
        if(times > 0){
            // 更新发送按钮文本
            send.value = (times--) + "s";
            // 通过定时器再次调用函数本身
            setTimeout(downToZero, 1000);
        }else{
            // 将文本复原
            send.value = "获取验证码";
            // 将按钮置为可用
            send.disabled = false;
            // 将倒计时还原为初值，以便再次计数
            times = 60;
        }
    }

    // 验证码输入框失去焦点 → 判断验证码是否为6位数字
    $("#code").on("blur", function() {
        var code = this.value.trim();
        var code_regex = /^\d{6}$/;
        if (code == "") {
            tips("codeMsg", "验证码不能为空!");
            finCode = "";
        } else if(!code_regex.test(code)) {
            tips("codeMsg","请输入6位数字验证码!");
            finCode = "";
        } else {
            // 验证码合法
            tips("codeMsg", "√");
            finCode = code;
        }
    });

    // 登录/注册
    $("#submit").on("click",function(){
        // 判断登录/注册信息是否有误
        if(finPhone == ""){
            tips("phoneMsg", "手机号格式有误!");
        } else if(finCode == "") {
            tips("codeMsg", "验证码格式有误!");
        } else {
            // 手机号和验证码已正确填写，发送登录请求
            var url = localStorage.getItem("backend_url") + "/user/login";
            var data = {"phone": finPhone, "code": finCode};
            $.post(url, data, function(res){
                if(res.status == "0"){
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("phone", finPhone);
                    url = "http://localhost:3000/setToken";
                    data = {"token": res.data.token};
                    $.get(url, data, function (res) {
                        location.href = "http://localhost:3000";
                    })
                } else {
                    tips("codeMsg", res.msg);
                }
            },"json");
        }
    })
})