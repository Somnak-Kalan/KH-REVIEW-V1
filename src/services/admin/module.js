import httpCommon from 'utils/http-common'
const createModule = async (payload) => {
  try {
    // Proceed to create module
    const response = await httpCommon.post('/admin/module', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error(
      'Error creating module:',
      error.response?.data || error.message
    )
    throw error
  }
}
//
const updateModule = async (payload) => {
  try {
    console.log(payload.doc, 'payload update module')

    const response = await httpCommon.put('/admin/module', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error(
      'Error creating module:',
      error.response?.data || error.message
    )
    throw error
  }
}
//
//
const deleteModule = async (payload) => {
  try {
    const response = await httpCommon.delete('/admin/module/' + payload._id, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error(
      'Error creating module:',
      error.response?.data || error.message
    )
    throw error
  }
}
//
//
const fetchModule = async (payload) => {
  try {
    const response = await httpCommon.get('/admin/module', {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error(
      'Error creating module:',
      error.response?.data || error.message
    )
    throw error
  }
}
//
const fetchModuleById = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/admin/module/' + `${payload.doc._id}`,
      {
        headers: { Authorization: `Bearer ${payload.access_token}` },
      }
    )
    return response.data
  } catch (error) {
    console.error(
      'Error creating module:',
      error.response?.data || error.message
    )
    throw error
  }
}

const ModuleServices = {
  createModule,
  updateModule,
  deleteModule,
  fetchModule,
  fetchModuleById,
}
export default ModuleServices
