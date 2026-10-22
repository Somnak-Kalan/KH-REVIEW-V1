import httpCommon from 'utils/http-common'
const createSubCategory = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/setup/sub_category/create`,
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
const updateSubCategory = async (payload) => {
  try {
    const response = await httpCommon.put(
      `/setup/sub_category/update`,
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
const removeSubCategory = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/sub_category/` + payload?.doc?._id,
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
const fetchSubCategory = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/sub_category/list?search=' + payload?.doc?.search,
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
const fetchSubCategoryById = async (payload) => {
  try {
    const response = await httpCommon.get(
      `/setup/sub_category/${payload?.doc?._id}`,
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

const SubCategoryServices = {
  createSubCategory,
  updateSubCategory,
  removeSubCategory,
  fetchSubCategory,
  fetchSubCategoryById,
}
export default SubCategoryServices
