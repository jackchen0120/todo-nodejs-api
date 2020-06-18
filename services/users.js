const { querySql, queryOne } = require('../utils/index');

// 登录
function login(username, password) {
  const query = `select * from sys_user where username ='${username}' and password ='${password}'`;
  return querySql(query);
}

// 注册
function register(username, password) {
  const query = `insert into sys_user(username, password) values('${username}', '${password}')`;
  return querySql(query);
}

// 通过用户名查询用户
function findUser(username) {
  const query = `select id, username from sys_user where username = '${username}'`;
  return queryOne(query);
}

module.exports = {
  login,
  register,
  findUser
}
