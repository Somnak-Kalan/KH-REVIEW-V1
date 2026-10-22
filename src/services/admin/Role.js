import httpCommon from 'utils/http-common'

//
const createRole = async (payload) => {
  try {
    // Proceed to create role
    const response = await httpCommon.post('/admin/role', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating role:', error.response?.data || error.message)
    throw error
  }
}

//
const deleteRole = async (payload) => {
  try {
    const response = await httpCommon.delete('/admin/Role/' + payload._id, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating Role:', error.response?.data || error.message)
    throw error
  }
}
//
//
const fetchRole = async (payload) => {
  try {
    const response = await httpCommon.get('/admin/role', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating Role:', error.response?.data || error.message)
    throw error
  }
}
//
const fetchRoleById = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/admin/role/' + `${payload.doc._id}`,
      {
        headers: { Authorization: `Bearer ${payload.access_token}` },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating Role:', error.response?.data || error.message)
    throw error
  }
}
//
const updateRoleInfo = async (payload) => {
  try {
    const response = await httpCommon.put('/admin/role', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating Role:', error.response?.data || error.message)
    throw error
  }
}
const AdminRoleServices = {
  createRole,
  fetchRole,
  fetchRoleById,
  updateRoleInfo,
  deleteRole,
}
export default AdminRoleServices
