import httpCommon from 'utils/http-common'
//
const Create_Attendance_Rule = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/add_attendance_rule', payload.doc, {
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
/*------[Update_Attendance_Rule] Edit Attendance_Rule--------*/
const Update_Attendance_Rule = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .put('/hr/update_attendance_rule', payload.doc, {
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
/*------end [Update_Attendance_Rule] Edit Attendance_Rule--------*/
/*------[Get_Attendance_Rule] List Attendance_Rule--------*/
const Get_Attendance_Rule = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/get_attendance_rule', payload.doc, {
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
/*------end [Get_Attendance_Rule] List Attendance_Rule--------*/
/*------[Remove_Attendance_Rule] update to inactive---------------*/
const Remove_Attendance_Rule = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .delete('/hr/remove_attendance_rule/' + payload.doc.id, {
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
/*------end [Remove_Attendance_Rule] update to inactive---------------*/

//
const AttendanceRuleService = {
  Create_Attendance_Rule,
  Update_Attendance_Rule,
  Remove_Attendance_Rule,
  Get_Attendance_Rule,
}
//
export default AttendanceRuleService
