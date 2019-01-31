import request from '@/utils/request'
import store from '../store'

export function scanGroup(query) {
  return request({
    url: '/v1/gscan/user/group',
    method: 'get',
    params: {
      email: store.getters.userinfo.email,
      body: new Buffer(JSON.stringify(query)).toString('base64')
    }
  })
}

export function createGroup(body) {
  return request({
    url: '/v1/group',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      name: new Buffer(body.name).toString('base64'),
      parent_id: body.parentId
    }
  })
}

export function updateGroup(body) {
  return request({
    url: '/v1/group',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      group_id: body.id,
      name: new Buffer(body.name).toString('base64'),
      parent_id: body.parentId
    }
  })
}

export function deleteGroup(id) {
  return request({
    url: '/v1/group',
    method: 'delete',
    params: {
      email: store.getters.userinfo.email,
      group_id: id
    }
  })
}
