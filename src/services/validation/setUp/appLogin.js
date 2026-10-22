import httpCommon from 'utils/http-common'
//
const Validate_Employee_Id_App_Login = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/check_employee_id', payload.doc, {
        headers: { token: payload.access_token },
      })
      .then((res) => {
        resolve(res.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
const ValidateAppLoginService = {
  Validate_Employee_Id_App_Login,
}
export default ValidateAppLoginService
