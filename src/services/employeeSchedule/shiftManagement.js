import httpCommon from 'utils/http-common'
//
const Create_Shift_Management = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/add_shift_management', payload.doc, {
        headers: {
          token: payload.access_token,
        },
      })
      .then((res) => {
        resolve(res.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
/*------[Update_Shift_Management] Edit Shift_Management--------*/
const Update_Shift_Management = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .put('/hr/update_shift_management', payload.doc, {
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
/*------end [Update_Shift_Management] Edit Shift_Management--------*/
/*------[Get_Shift_Management] List Shift_Management--------*/
const Get_Shift_Management = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/hr/get_shift_management', {
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
/*------end [Get_Shift_Management] List Shift_Management--------*/
/*------[Remove_Shift_Management] update to inactive---------------*/
const Remove_Shift_Management = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .delete('/hr/remove_shift_management/' + payload.doc.id, {
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
const Validate_Create_Shift_name = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/validate_create_shift_name', payload.doc, {
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
const Validate_Update_Shift_Name = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/validate_update_shift_name', payload.doc, {
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

/*------end [Remove_Shift_Management] update to inactive---------------*/

//
const ShiftManagementService = {
  Create_Shift_Management,
  Update_Shift_Management,
  Remove_Shift_Management,
  Get_Shift_Management,
  //
  Validate_Create_Shift_name,
  Validate_Update_Shift_Name,
  //
}
//
export default ShiftManagementService
