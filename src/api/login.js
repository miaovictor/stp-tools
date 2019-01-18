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

// export function login(username, password) {
//   return request({
//     url: '/v1/device',
//     method: 'PUT',
//     params: {
//       sn: '407bb96a-ec7ad3fe',
//       email: 'example@stp.com'
//     },
//     data: {
//       sn: 'addfedfas-asdfeade',
//       commit: '18912345678'
//     }
//   })
// }

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
