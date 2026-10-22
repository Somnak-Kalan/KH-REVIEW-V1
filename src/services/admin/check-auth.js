import httpCommon from 'utils/http-common'
//
const getUserInfoWhenRefreshPage = (access_token) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post(
        '/admin/check_token',
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
//
const CheckAuth = { getUserInfoWhenRefreshPage }
export default CheckAuth
