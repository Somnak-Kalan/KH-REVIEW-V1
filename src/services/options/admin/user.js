import httpCommon from 'utils/http-common'

const fetchUserForRole = async (payload) => {
  try {
    const response = await httpCommon.get('/opts/user_for_role', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })

    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}
const fetchUserForRoleById = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/opts/user_for_role?userId=' + payload.doc._id,
      {
        headers: { Authorization: `Bearer ${payload.access_token}` },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}
const fetchModuleUsers = (payload) => {


  return new Promise((resolve, reject) => {


    httpCommon
      .get('/admin/module/users', {

        params: {
          moduleId: payload.moduleId
        },


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


const UserOptService = {
  fetchUserForRole,
  fetchUserForRoleById,
  fetchModuleUsers
}
export default UserOptService
