import httpCommon from 'utils/http-common'
const fetchGroupTypeByType = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/group_setup?type=' + payload?.doc?.type,
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

const GroupTypeService = {
  fetchGroupTypeByType,
}
export default GroupTypeService
