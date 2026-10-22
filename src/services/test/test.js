import httpCommon from 'utils/http-common'
//
const uploadTest = (payload) => {
  return new Promise((resolve, reject) => {
    httpCommon
      .post('/hr/upload_files', payload.doc, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

const UploadImage = {
  uploadTest,
}
//
export default UploadImage
