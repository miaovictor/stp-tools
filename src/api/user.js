import request from '@/utils/request'
import store from '../store'
import crypto from 'crypto'

export function scanRootUser(query) {
  return request({
    url: '/v1/gscan/root_user/root_user',
    method: 'get',
    params: {
      email: store.getters.userinfo.email,
      body: new Buffer(JSON.stringify(query)).toString('base64')
    }
  })
}

export function scanRamUser(query) {
  return request({
    url: '/v1/gscan/root_user/ram_user',
    method: 'get',
    params: {
      email: store.getters.userinfo.email,
      body: new Buffer(JSON.stringify(query)).toString('base64')
    }
  })
}

export function createRootUser(body) {
  return request({
    url: '/v1/root_user',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      email: body.email,
      password: crypto.createHash('md5').update(body.password).digest('base64'),
      phone: body.phone,
      company: new Buffer(body.company).toString('base64'),
      commit: new Buffer(body.commit).toString('base64')
    }
  })
}

export function createRamUser(body) {
  return request({
    url: '/v1/ram_user',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      email: body.email,
      password: crypto.createHash('md5').update(body.password).digest('base64'),
      phone: body.phone,
      company: new Buffer(body.company).toString('base64'),
      commit: new Buffer(body.commit).toString('base64'),
      permission: 0
    }
  })
}

export function updateRootUser(body) {
  return request({
    url: '/v1/root_user',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email: body.email
    },
    data: {
      phone: body.phone,
      company: new Buffer(body.company).toString('base64'),
      commit: new Buffer(body.commit).toString('base64')
    }
  })
}

export function updateRamUser(body) {
  return request({
    url: '/v1/ram_user',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email: body.email
    },
    data: {
      phone: body.phone,
      company: new Buffer(body.company).toString('base64'),
      commit: new Buffer(body.commit).toString('base64')
    }
  })
}

export function updateRootUserState(email, state) {
  return request({
    url: '/v1/root_user/state',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email
    },
    data: {
      state
    }
  })
}

export function updateRamUserState(email, state) {
  return request({
    url: '/v1/ram_user/state',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email
    },
    data: {
      state
    }
  })
}

export function updateRamUserPermission(email, permission) {
  return request({
    url: '/v1/ram_user/state',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email
    },
    data: {
      permission
    }
  })
}

export function updateRootUserPassword(email, password) {
  return request({
    url: '/v1/root_user/password',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email
    },
    data: {
      old_password: crypto.createHash('md5').update(password.oldPassword).digest('base64'),
      new_password: crypto.createHash('md5').update(password.newPassword).digest('base64')
    }
  })
}

export function updateRamUserPassword(email, password) {
  return request({
    url: '/v1/ram_user/password',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      email
    },
    data: {
      old_password: crypto.createHash('md5').update(password.oldPassword).digest('base64'),
      new_password: crypto.createHash('md5').update(password.newPassword).digest('base64')
    }
  })
}

