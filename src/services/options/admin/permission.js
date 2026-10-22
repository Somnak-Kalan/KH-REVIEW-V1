import httpCommon from 'utils/http-common'


/*------[fetch permission] List permission--------*/

const fetchPermission = (payload) => {

  return new Promise((resolve, reject) => {

    httpCommon
      .get('/opts/permission', {

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


/*------end [fetch permission] List permission--------*/





/*------[fetch permission by module]--------*/

const fetchPermissionByModule = (payload) => {

  return new Promise((resolve, reject) => {

    httpCommon

      .post('/opts/permission_by_module', payload.doc, {

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


/*------end [fetch permission by module]--------*/







/*------[fetch module users]--------*/


const fetchModuleUsers = (payload) => {


  return new Promise((resolve, reject) => {


    httpCommon

      .get(
        `/admin/module/users?moduleId=${payload.moduleId}`,
        {

          headers: {

            Authorization:
              `Bearer ${payload.access_token}`,

          },

        }

      )

      .then((res) => {


        resolve(res.data)


      })

      .catch((error) => {


        reject(error)


      })


  })


}



/*------end [fetch module users]--------*/








const PermissionOptService = {

  fetchPermission,

  fetchPermissionByModule,

  fetchModuleUsers,

}



export default PermissionOptService