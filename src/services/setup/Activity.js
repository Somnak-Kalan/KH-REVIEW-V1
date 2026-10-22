import httpCommon from 'utils/http-common'
const createActivity = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/setup/activity/create`,
      payload?.doc,
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
const updateActivity = async (payload) => {
  try {
    const response = await httpCommon.put(
      `/setup/activity/update`,
      payload?.doc,
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
const removeActivity = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/activity/` + payload?.doc?._id,
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
const fetchActivity = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/activity/list?search=' + payload?.doc?.search,
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
const fetchActivityById = async (payload) => {
  try {
    const response = await httpCommon.get(
      `/setup/activity/${payload?.doc?._id}`,
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

const ActivityServices = {
  createActivity,
  updateActivity,
  removeActivity,
  fetchActivity,
  fetchActivityById,
}
export default ActivityServices
