import request from '@/utils/request'
import store from '../store'

export function fetchList(query) {
  return request({
    url: '/v1/gscan/user/device',
    method: 'get',
    params: {
      email: store.getters.userinfo.email,
      body: new Buffer(JSON.stringify(query)).toString('base64')
    }
  })
}

export function unbind(sn) {
  return request({
    url: '/v1/device/unbind',
    method: 'post',
    params: {
      sn
    }
  })
}
