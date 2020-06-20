/**
 * 描述: 入口文件
 * 作者: Jack Chen
 * 日期: 2020-06-12
*/

const bodyParser = require('body-parser'); // 引入body-parser模块
const express = require('express'); // 引入express模块
const cors = require('cors'); // 引入cors模块
const routes = require('./routes'); //导入自定义路由文件，创建模块化路由
const app = express();

app.use(bodyParser.json()); // 解析json数据格式
app.use(bodyParser.urlencoded({extended: true})); // 解析form表单提交的数据application/x-www-form-urlencoded

app.use(cors()); // 注入cors模块解决跨域


app.use('/', routes);


app.listen(8088, () => { // 监听8088端口
	console.log('服务已启动 http://localhost:8088');
})