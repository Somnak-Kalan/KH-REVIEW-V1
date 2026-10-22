import httpCommon from 'utils/http-common'
/*------[Get_Company] List Company--------*/
const Get_Employee_Otp_By_Dept_Id = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/hr/opts/employee/' + payload.doc.id, {
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
/*------end [Get_Company] List Company--------*/

//
const EmployeeOtpService = {
  Get_Employee_Otp_By_Dept_Id,
}
//
export default EmployeeOtpService
