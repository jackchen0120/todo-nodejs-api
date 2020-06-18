// 数据库增删改查操作

const sqlMap = {
	user: {
		// add: 'insert into sys_user (username, account, password, repeatPass, email, phone, card, birth, sex) values (?,?,?,?,?,?,?,?,?)',
  //       select_name: 'select * from sys_user', 
  //       update_user: 'update sys_user set'
	    queryAll: 'SELECT * FROM ??',
	    queryById: 'SELECT * FROM ?? WHERE id=?',
	    update: 'UPDATE ?? SET',
	    del: 'DELETE FROM ?? WHERE id=?',
	}
};

module.exports = sqlMap;