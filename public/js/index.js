// 主页面的操作
$(function(){
    $("#logout").on("click", function () {
        var flag = confirm("你是否确认退出登录？");
        if(flag){
            // 发送退出登录请求
            var url = localStorage.getItem("backend_url") + "/user/logout";
            var token = localStorage.getItem("token");
            var headers = {"authorization": token}
            var data = {"token": token};
            $.ajax({
                url: url,
                type: "POST",
                headers: headers,
                data: data,
                success: function (res) {
                    console.log(res)
                    if(res.status == "0"){
                        // 用户已退出登录
                        // 删除本地存储的token和phone
                        localStorage.removeItem("token");
                        localStorage.removeItem("phone");
                        // 删除node环境中的token再跳转到登录页
                        url = "http://localhost:3000/deleteToken";
                        $.get(url, "", function (res) {
                            location.href = "http://localhost:3000";
                        })
                    }
                }
            })
        }
    })
})