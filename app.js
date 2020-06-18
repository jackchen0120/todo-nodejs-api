const bodyParser = require('body-parser'); // 引入body-parser模块
const express = require('express'); // 引入express模块
const mysql = require('mysql'); // 引入mysql模块
const cors = require('cors'); // 引入cors模块
const routes = require('./routes'); //导入自定义路由文件,创建模块化路由
const app = express();

app.use(bodyParser.json()); // 解析json数据格式
app.use(bodyParser.urlencoded({extended: false})); //解析form表单提交的数据application/x-www-form-urlencoded
app.use(cors()); // 设置跨域

// const connection = mysql.createConnection(); // 创建mysql实例

// connection.connect(); // 与数据库建立连接

// let sql = 'select * from websites';
// let str = '';
// connection.query(sql, (err, result) => {
// 	if (err) {
// 		console.log('[select error]:', err.message);
// 		return;
// 	}
// 	str = JSON.stringify(result);
// 	console.log(str); // 数据库查询结果返回到result中
// })

app.use('/', routes);

// app.all('*', (req, res) => {
// 	res.send('hello world'); // 服务器响应请求
// })

// connection.end(); //关闭连接  

app.listen(8088, () => { // 监听8088端口
	console.log('服务已启动 http://localhost:8088');
})