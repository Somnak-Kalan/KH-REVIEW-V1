import httpCommon from 'utils/http-common'


// Get module list
const fetchModule = (payload) => {


  return new Promise((resolve, reject) => {


    httpCommon
      .get('/opts/module', {

        headers: {
          Authorization:
            `Bearer ${payload.access_token}`
        }

      })
      .then(res => {

        resolve(res.data)

      })
      .catch(error => {

        reject(error)

      })


  })


}



// Get module detail by id

const fetchModuleDetail = (payload) => {


  return new Promise((resolve, reject) => {


    httpCommon
      .get(`/admin/module/${payload.moduleId}`, {


        headers: {
          Authorization:
            `Bearer ${payload.access_token}`
        }


      })
      .then(res => {

        resolve(res.data)

      })
      .catch(error => {

        reject(error)

      })



  })


}



const ModuleOptService = {


  fetchModule,

  fetchModuleDetail


}



export default ModuleOptService