import httpCommon from 'utils/http-common'
//
const getModuleOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/setting/module', {
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
//
const getPermissionOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/setting/permission', {
        headers: { token: payload.access_token },
      })
      .then((result) => {

        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
//
const getCompanyOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/hr/opts/company', {
        headers: { token: payload.access_token },
      })
      .then((result) => {

        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
//
const getDepartmentOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get(`/hr/opts/department/${payload.id}`, {
        headers: { token: payload.access_token },
      })
      .then((result) => {

        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
//
const getPositionOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get(`/hr/opts/position/${payload.id}`, {
        headers: { token: payload.access_token },
      })
      .then((result) => {
        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
//
const getShiftManagementOptions = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get(`/hr/opts/shift_management`, {
        headers: { token: payload.access_token },
      })
      .then((result) => {
        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
//

//

//
const OptionsService = {
  getModuleOptions,
  getPermissionOptions,
  //
  getCompanyOptions,
  getDepartmentOptions,
  getPositionOptions,
  getShiftManagementOptions,
}
//
export default OptionsService
