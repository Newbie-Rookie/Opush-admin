// 加载模块
const express = require('express');
const http = require('http');
const path = require('path');
const reload = require('reload');
const bodyParser = require('body-parser');
const logger = require('morgan');
const request = require('request');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
localStorage.setItem('backend_url', 'http://localhost:8080');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json()); // Parses json, multi-part (file), url-encoded

app.use('/public', express.static('public'));
app.use('/pages', express.static('pages'));

// 跨域配置
// app.all('*', (req, res, next) =>{
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//     res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
//     res.header('X-Powered-By', '3.2.1');
//     res.header('Content-type', 'application/json;charset=utf-8');
//     next()
// })

// 设置请求对应的处理函数
app.get('/setToken', function (req, res) {
    // 设置token
    localStorage.setItem("token", req.query.token);
    res.end();
});

app.get('/deleteToken', function (req, res) {
    // 删除token
    localStorage.removeItem("token");
    res.end();
});

app.get('/*', function (req, res) {
    // Java后端接口
    var url = localStorage.getItem("backend_url") + "/static";
    // token（未登录为null）
    var token = localStorage.getItem("token");
    // 向后端发送请求，判断用户是否登录
    request({
        url: url,
        method: 'GET',
        headers: {"authorization": token, "sign": "static"}
    },function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // 请求成功的处理逻辑
            var data = JSON.parse(response.body);
            if(data.status === "-1"){
                res.sendFile(path.join(__dirname, './login.html'));
            }else{
                res.sendFile(path.join(__dirname, './index.html'));
            }
        }
    });
});

// app.get('/index.html', function (req, res) {
//     // Java后端接口
//     let url = localStorage.getItem("backend_url") + "/static/index";
//     // token（未登录为null）
//     let token = localStorage.getItem("token");
//     // 向后端发送请求，判断用户是否登录
//     request({
//         url: url,
//         method: 'GET',
//         headers: {"authorization": token, "sign": "index"}
//     },function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             // 请求成功的处理逻辑
//             var data = JSON.parse(response.body);
//             if(data.status === "-1"){
//                 res.sendFile(path.join(__dirname, './login.html'));
//             }else{
//                 res.sendFile(path.join(__dirname, './index.html'));
//             }
//         }
//     });
// });

// app.get('/*', function (req, res) {
//     // Java后端接口
//     let url = localStorage.getItem("backend_url");
//     // token
//     let token = localStorage.getItem("token") === null ? "" : localStorage.getItem("token");
//     // 向后端发送请求，判断用户是否登录
//     request({
//         url: url,
//         method: 'POST',
//         headers: {"authorization": token},
//         form: {"sign": "sign"}
//     },function (error, response, body) {
//         console.log(response);
//     });
//     // 根据请求结果
//     // res.sendFile(path.join(__dirname, './index.html'));
//     // res.sendFile(path.join(__dirname, './login.html'));
// });

const server = http.createServer(app);

// Reload code here
reload(app)
  .then(function (reloadReturned) {
    // reloadReturned is documented in the returns API in the README

    // Reload started, start web server
    server.listen(app.get('port'), function () {
      console.log(
        'Web server listening on port http://localhost:' + app.get('port')
      );
    });
  })
  .catch(function (err) {
    console.error(
      'Reload could not start, could not start server/sample app',
      err
    );
  });
