const express = require('express');
const router = express.Router();
const md5 = require('../utils/md5');
const { 
  login, 
  register, 
  resetPwd, 
  validateUser,
  findUser 
} = require('../services/users');
const { body, validationResult } = require('express-validator');
const boom = require('boom');
const jwt = require('jsonwebtoken');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');


// 登录/注册校验
const vaildator = [
  body('username').isString().withMessage('用户名类型错误'),
  body('password').isString().withMessage('密码类型错误')
]

// 重置密码校验
const resetPwdVaildator = [
  body('username').isString().withMessage('用户名类型错误'),
  body('oldPassword').isString().withMessage('密码类型错误'),
  body('newPassword').isString().withMessage('密码类型错误')
]

// 用户登录
router.post('/login', vaildator, (req, res, next) => {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    // md5加密
    password = md5(password);
    login(username, password)
    .then(user => {
    	console.log('用户登录===', user);
      if (!user || user.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '用户名或密码错误', 
        	data: null 
        })
      } else {
        // 登录成功，签发一个token并返回给前端
        const token = jwt.sign(
          // payload：签发的 token 里面要包含的一些数据。
          { username },
          // 私钥
          PRIVATE_KEY,
          // 设置过期时间
          { expiresIn: JWT_EXPIRED }
        )
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '登录成功', 
        	data: { token } 
        })
      }
    })
  }
})

// 用户注册
router.post('/register', vaildator, (req, res, next) => {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    findUser(username)
  	.then(data => {
  		// console.log('用户注册===', user);
  		if (data) {
  			res.json({ 
	      	code: CODE_ERROR, 
	      	msg: '用户已存在', 
	      	data: null 
	      })
  		} else {
	    	password = md5(password);
  			register(username, password)
		    .then(user => {
		    	console.log('用户注册===', user);
		      if (!user || user.length === 0) {
		        res.json({ 
		        	code: CODE_ERROR, 
		        	msg: '注册失败', 
		        	data: null 
		        })
		      } else {
		        // 注册成功，签发一个token并返回给前端
		        const token = jwt.sign(
		          // payload：签发的 token 里面要包含的一些数据。
		          { username },
		          // 私钥
		          PRIVATE_KEY,
		          // 设置过期时间
		          { expiresIn: JWT_EXPIRED }
		        )
		        res.json({ 
		        	code: CODE_SUCCESS, 
		        	msg: '注册成功', 
		        	data: { token } 
		        })
		      }
		    })
  		}
  	})
   
  }
})

// 密码重置
router.post('/resetPwd', resetPwdVaildator, (req, res, next) => {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { username, oldPassword, newPassword } = req.body;
    oldPassword = md5(oldPassword);
    validateUser(username, oldPassword)
    .then(data => {
      console.log('校验用户名和密码===', data);
      if (data) {
        if (newPassword) {
          newPassword = md5(newPassword);
          resetPwd(username, newPassword)
          .then(user => {
            console.log('密码重置===', user);
            if (!user || user.length === 0) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '重置密码失败', 
                data: null 
              })
            } else {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '重置密码成功', 
                data: null
              })
            }
          })
        } else {
          res.json({ 
            code: CODE_ERROR, 
            msg: '新密码不能为空', 
            data: null 
          })
        }
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '用户名或旧密码错误', 
          data: null 
        })
      }
    })
   
  }
})

// 查询用户信息
router.get('/info', (req, res, next) => {
  // 解析token，并且token存在
  const token = decode(req) || {};
  findUser(token.username)
  .then(user => {
    if (user) {
			res.json({ 
				code: CODE_SUCCESS, 
				msg: '用户信息查询成功', 
				data: user 
			})
    } else {
      res.json({ 
      	code: CODE_ERROR, 
      	msg: '用户信息查询失败', 
      	data: null 
      })
    }
  })
})

module.exports = router;

