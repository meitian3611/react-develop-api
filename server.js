/** @format */
const express = require("express")
const jsonServer = require("json-server")
const bcryptjs = require("bcryptjs")
const Axios = require("axios")
const routes = jsonServer.router("./db.json")
const middlewares = jsonServer.defaults()

Axios.defaults.baseURL = "http://localhost:9090"

const server = express()

// req 的处理
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

// 自己写接口

//注册功能
server.post("/sign-up", async (req, res) => {
  // 获取前端传递过来的 username password gender
  // 使用 axios 调用 json-server 的 users 接口 存入数据
  const response = await Axios.get("/users", {
    params: { username: req.body.username }
  })
  if (response.data.length > 0) {
    // 用户名已经注册过
    res.send({
      code: -1,
      msg: "用户名已经注册过了"
    })

    return
  }
  const { data } = await Axios.post("/users", {
    ...req.body,
    password: await bcryptjs.hash(req.body.password, 10)
  })
  res.send({
    code: 0,
    msg: "注册成功",
    data
  })
})

// 登录功能
server.post("/sign-in", async (req, res) => {
  const { username, password } = req.body

  const { data } = await Axios.get("/users", {
    params: {
      username
    }
  })
  if (data.length <= 0) {
    res.send({
      code: -1,
      msg: "用户名或密码错误"
    })

    return
  }

  const user = data[0]
  const isOk = await bcryptjs.compare(password, user.password)

  if (isOk) {
    res.send({
      code: 0,
      msg: "登录成功",
      data: user
    })
  }else{
    res.send({
      code: -1,
      msg: '用户名或密码错误'
    })
  }
})
// json-server 数据
server.use(middlewares)
server.use(routes)

server.listen(9090)
