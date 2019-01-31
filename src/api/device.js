import request from '@/utils/request'
import store from '../store'

export function scanDevice(query) {
  return request({
    url: '/v1/gscan/user/device',
    method: 'get',
    params: {
      email: store.getters.userinfo.email,
      body: new Buffer(JSON.stringify(query)).toString('base64')
    }
  })
}

export function bindDevice(device) {
  return request({
    url: '/v1/device/bind',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      sn: device.sn,
      group_id: device.groupId,
      commit: device.commit ? new Buffer(device.commit).toString('base64') : ''
    }
  })
}

export function updateDevice(device) {
  return request({
    url: '/v1/device',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      sn: device.sn,
      group_id: device.groupId,
      commit: device.commit ? new Buffer(device.commit).toString('base64') : ''
    }
  })
}

export function unbindDevice(sn) {
  return request({
    url: '/v1/device/unbind',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      sn
    }
  })
}
