import httpCommon from 'utils/http-common'
const createType = async (payload) => {
  try {
    const response = await httpCommon.post(`/setup/type/create`, payload?.doc, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${payload.access_token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const updateType = async (payload) => {
  try {
    const response = await httpCommon.put(`/setup/type/update`, payload?.doc, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${payload.access_token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const removeType = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/type/` + payload?.doc?._id,
      {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const fetchType = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/type/list?search=' +
        payload?.doc?.search +
        '&type=' +
        payload?.doc?.type,
      {
        headers: { Authorization: `Bearer ${payload.access_token}` },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const fetchTypeById = async (payload) => {
  try {
    const response = await httpCommon.get(`/setup/type/${payload?.doc?._id}`, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}

const TypeServices = {
  createType,
  updateType,
  removeType,
  fetchType,
  fetchTypeById,
}
export default TypeServices
