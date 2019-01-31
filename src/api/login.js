import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/v1/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      email: username,
      password: password
    }
  })
}
