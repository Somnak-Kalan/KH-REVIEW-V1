import httpCommon from 'utils/http-common'

//
const createUser = async (payload) => {
  try {
    // Proceed to create user
    const response = await httpCommon.post('/admin/user', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}

//
const deleteUser = async (payload) => {

  try {
    const response = await httpCommon.delete(
      '/admin/user/' + payload?.doc._id,
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
//

const fetchUser = async (payload) => {
  try {
    const response = await httpCommon.get('/admin/user', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}
//
const fetchUserById = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/admin/user/' + `${payload.doc._id}`,
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
//
const updateUserInfo = async (payload) => {
  try {
    const response = await httpCommon.put('/admin/user_info', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}
const updatePassword = async (payload) => {
  console.log(payload, 'somnak');

  try {
    const response = await httpCommon.put('/admin/user_password', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message)
    throw error
  }
}
const updatePermission = async (payload) => {
  try {
    const response = await httpCommon.put(
      '/admin/user_permission',
      payload.doc,
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

const AdminUserServices = {
  createUser,
  deleteUser,
  fetchUser,
  fetchUserById,
  updateUserInfo,
  updatePassword,
  updatePermission,
}
export default AdminUserServices
