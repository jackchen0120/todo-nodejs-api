const bodyParser = require('body-parser'); // 引入body-parser模块
const express = require('express'); // 引入express模块
const app = express();
const mysql = require('mysql'); // 引入mysql模块

app.use(bodyParser.json());
app.use(bodyParser.urlencoded())

 // 创建mysql实例
const connection = mysql.createConnection();

connection.connect(); // 与数据库建立连接

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

app.all('*', (req, res) => {
	res.send('hello world'); // 服务器响应请求
})

connection.end(); //关闭连接  

app.listen(8088, () => { // 监听8088端口
	console.log('服务已启动 http://localhost:8088');
})