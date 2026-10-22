import httpCommon from 'utils/http-common'
const fetchProfileInfo = async (payload) => {
  try {
    // Proceed to create role
    const response = await httpCommon.get('/profile', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating role:', error.response?.data || error.message)
    throw error
  }
}
const updatePassword = async (payload) => {
  try {
    // Proceed to create role
    const response = await httpCommon.put('/profile/password', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating role:', error.response?.data || error.message)
    throw error
  }
}
const updateProfileInfo = async (payload) => {
  try {
    // Proceed to create role
    const response = await httpCommon.put('/profile', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating role:', error.response?.data || error.message)
    throw error
  }
}

//
const AdminProfileInfoService = {
  fetchProfileInfo,
  updatePassword,
  updateProfileInfo,
}
export default AdminProfileInfoService
