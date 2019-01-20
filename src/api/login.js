import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/v1/login',
    method: 'post',
    data: {
      email: username,
      password: password
    }
  })
}
