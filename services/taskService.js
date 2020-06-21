/**
 * 描述: 业务逻辑处理 - 任务相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('../utils/index');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');


// 查询任务列表
function queryTaskList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, status } = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 1;
    pageNo = pageNo ? pageNo : 1;
    status = (status || status == 0) ? status : null;

    let query = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire from sys_task d`;
    querySql(query)
    .then(data => {
    	// console.log('任务列表查询===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: null 
        })
      } else {

        // 计算数据总条数
        let total = data.length; 
        // 分页条件 (跳过多少条)
        let n = (pageNo - 1) * pageSize;
        // 拼接分页的sql语句命令
        if (status) {
          let query_1 = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire from sys_task d where status='${status}' order by d.gmt_create desc`;
          querySql(query_1)
          .then(result_1 => {
            console.log('分页1===', result_1);
            if (!result_1 || result_1.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: null 
              })
            } else {
              let query_2 = query_1 + ` limit ${n} , ${pageSize}`;
              querySql(query_2)
              .then(result_2 => {
                console.log('分页2===', result_2);
                if (!result_2 || result_2.length === 0) {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '暂无数据', 
                    data: null 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '查询数据成功', 
                    data: {
                      rows: result_2,
                      total: result_1.length,
                      pageNo: parseInt(pageNo),
                      pageSize: parseInt(pageSize),
                    } 
                  })
                }
              })
            }
          })
        } else {
          let query_3 = query + ` order by d.gmt_create desc limit ${n} , ${pageSize}`;
          querySql(query_3)
          .then(result_3 => {
            console.log('分页2===', result_3);
            if (!result_3 || result_3.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: null 
              })
            } else {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '查询数据成功', 
                data: {
                  rows: result_3,
                  total: total,
                  pageNo: parseInt(pageNo),
                  pageSize: parseInt(pageSize),
                } 
              })
            }
          })
        }
      }
    })
  }
}

// 添加任务
function addTask(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { title, content, gmt_expire } = req.body;
    findTask(title, 1)
    .then(task => {
      if (task) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '任务名称不能重复', 
          data: null 
        })
      } else {
        const query = `insert into sys_task(title, content, status, is_major, gmt_expire) values('${title}', '${content}', 0, 0, '${gmt_expire}')`;
        querySql(query)
        .then(data => {
          // console.log('添加任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '添加数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '添加数据成功', 
              data: null 
            })
          }
        })
      }
    })

  }
}

// 编辑任务
function editTask(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, title, content, gmt_expire } = req.body;
    findTask(id, 2)
    .then(task => {
      if (task) {
        findTask(title, 1)
        .then(result => {
          if (result) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '任务名称不能重复', 
              data: null 
            })
          } else {
            const query = `update sys_task set title='${title}', content='${content}', gmt_expire='${gmt_expire}' where id='${id}'`;
            querySql(query)
            .then(data => {
              // console.log('编辑任务===', data);
              if (!data || data.length === 0) {
                res.json({ 
                  code: CODE_ERROR, 
                  msg: '更新数据失败', 
                  data: null 
                })
              } else {
                res.json({ 
                  code: CODE_SUCCESS, 
                  msg: '更新数据成功', 
                  data: null 
                })
              }
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '参数错误或数据不存在', 
          data: null 
        })
      }
    })

  }
}

// 操作任务状态
function updateTaskStatus(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, status } = req.body;
    findTask(id, 2)
    .then(task => {
      if (task) {
        const query = `update sys_task set status='${status}' where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('操作任务状态===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '操作数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '操作数据成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '参数错误或数据不存在', 
          data: null 
        })
      }
    })

  }
}

// 点亮红星标记
function updateMark(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, is_major } = req.body;
    findTask(id, 2)
    .then(task => {
      if (task) {
        const query = `update sys_task set is_major='${is_major}' where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('点亮红星标记===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '操作数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '操作数据成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '参数错误或数据不存在', 
          data: null 
        })
      }
    })

  }
}

// 删除任务
function deleteTask(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, status } = req.body;
    findTask(id, 2)
    .then(task => {
      if (task) {
        const query = `update sys_task set status='${status}' where id='${id}'`;
        // const query = `delete from sys_task where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('删除任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '删除数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '删除数据成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '数据不存在', 
          data: null 
        })
      }
    })

  }
}

// 通过任务名称或ID查询数据是否存在
function findTask(param, type) {
  let query = null;
  if (type == 1) { // 1:添加类型 2:编辑或删除类型
    query = `select id, title from sys_task where title='${param}'`;
  } else {
    query = `select id, title from sys_task where id='${param}'`;
  }
  return queryOne(query);
}


module.exports = {
  queryTaskList,
  addTask,
  editTask,
  updateTaskStatus,
  updateMark,
  deleteTask
}
