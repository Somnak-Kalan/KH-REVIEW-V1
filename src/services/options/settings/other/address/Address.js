import httpCommon from 'utils/http-common'

//address
const getProvinceOpt = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/other/province_opts', {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
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
const getDistrictOpt = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/other/district_opts/' + payload.doc.id, {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
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
const getCommuneOpt = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .get('/other/commune_opts/' + payload.doc.id, {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
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

//address
const SettingOtherAddressOptServices = {
  //address
  getProvinceOpt,
  getDistrictOpt,
  getCommuneOpt,
  //end address
}
//
export default SettingOtherAddressOptServices
