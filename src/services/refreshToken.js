import httpCommon from 'utils/http-common'
//
const RefreshToken = (access_token) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post(
        '/admin/refresh_token',
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
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
export default RefreshToken
