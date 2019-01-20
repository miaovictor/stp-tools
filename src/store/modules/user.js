import { login } from '@/api/login'
import { getToken } from '@/utils/auth'
import crypto from 'crypto'

const user = {
  state: {
    info: {
      appid: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
      appkey: ''
    },
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_APPID: (state, appid) => {
      state.appid = appid
    },
    SET_APPKEY: (state, appkey) => {
      state.appkey = appkey
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_USERINFO: (state, info) => {
      state.info = info
      if (state.info.commit) {
        state.info.commit = new Buffer(state.info.commit, 'base64').toString()
      }
      if (state.info.company) {
        state.info.company = new Buffer(state.info.company, 'base64').toString()
      }
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      var md5 = crypto.createHash('md5')
      const password = md5.update(userInfo.password).digest('base64')
      return new Promise((resolve, reject) => {
        login(username, password)
          .then(response => {
            commit('SET_USERINFO', response)
            resolve()
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise(resolve => {
        commit('SET_APPKEY', '')
        resolve()
      })
    }
  }
}

export default user
