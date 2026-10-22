import httpCommon from 'utils/http-common'
const createPrivacy = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/setup/privacy/create`,
      payload?.doc,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
const updatePrivacy = async (payload) => {
  try {
    const response = await httpCommon.put(
      `/setup/privacy/update`,
      payload?.doc,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
const removePrivacy = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/privacy/` + payload?.doc?._id,
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
const fetchPrivacy = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/privacy/list?search=' + payload?.doc?.search,
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
const fetchPrivacyById = async (payload) => {
  try {
    const response = await httpCommon.get(
      `/setup/privacy/${payload?.doc?._id}`,
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

const PrivacyServices = {
  createPrivacy,
  updatePrivacy,
  removePrivacy,
  fetchPrivacy,
  fetchPrivacyById,
}
export default PrivacyServices
