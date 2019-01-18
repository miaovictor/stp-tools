import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
// import { getToken } from '@/utils/auth'
import crypto from 'crypto'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    // if (store.getters.token) {
    //   config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    // }

    var md5 = crypto.createHash('md5')
    var contentMD5 = md5.update(JSON.stringify(config.data)).digest('base64')
    var resource = config.url
    if (config.params) {
      var sortKeys = Object.keys(config.params).sort()
      sortKeys.forEach(function(v, k) {
        if (k === 0) {
          resource += '?'
        }
        resource += v + '=' + config.params[v]
        if (k < sortKeys.length - 1) {
          resource += '&'
        }
      })
    }

    var expires = parseInt(new Date().getTime() / 1000) + 7200
    console.log(expires)

    var canonicalString = `${config.method}\n${contentMD5}\n${
      config.headers['Content-Type']
    }\n${expires}\n${resource}`

    var signature = crypto
      .createHmac('sha1', store.getters.appkey)
      .update(canonicalString)
      .digest('base64')

    config.params = {
      ...config.params,
      appid: store.getters.appid,
      expires,
      signature
    }
    console.log(signature)

    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code !== 20000) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
