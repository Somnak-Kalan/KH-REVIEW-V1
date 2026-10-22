import httpCommon from 'utils/http-common'
//
const Validate_Create_Employee_Card_id = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/validate_employee_id', payload.doc, {
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
const Validate_Update_Employee_Card_id = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/validate_employee_id_update', payload.doc, {
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

//
const ValidationEmployees = {
  Validate_Create_Employee_Card_id,
  Validate_Update_Employee_Card_id,
}
//
export default ValidationEmployees
