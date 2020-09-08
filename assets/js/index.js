$(function () {
  // 调用 getUserInfo 获取用户基本信息
  getUserInfo()
})

// 获取用户的基本信息
function getUserInfo() {
  $.ajax({
    method: 'GET',
    url: '/my/userinfo',
    // headers 就是请求头配置对象
    headers: {
      Authorization: localStorage.getItem('token') || ''
    },
    success: function (res) {
      console.log(res)
    }
  })
}
