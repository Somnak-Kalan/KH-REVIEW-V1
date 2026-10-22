import httpCommon from 'utils/http-common'
//
/*------[Apply_Shift_To_Department] Apply to Department of shift management---------------*/
const List_Employee_Schedule = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/hr/shift_management_list', {
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
/*------[Apply_Shift_To_Department] Apply to Department of shift management---------------*/
/*------[Apply_Shift_To_Department] Apply to Department of shift management---------------*/
const Apply_Shift_To_Dept = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/apply_shift_management_to_department', payload.doc, {
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
/*------[Apply_Shift_To_Department] Apply to Department of shift management---------------*/
/*------[Apply_Shift_To_Employee] Apply to employee of shift management---------------*/
const Apply_Shift_Mgmt_To_Employee = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/apply_shift_management_to_employee', payload.doc, {
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
/*------End [ Apply_Shift_To_Employee] Apply to employee of shift management---------------*/

//
const EmployeeSchedule = {
  List_Employee_Schedule,
  Apply_Shift_To_Dept,
  Apply_Shift_Mgmt_To_Employee,
}
//
export default EmployeeSchedule
