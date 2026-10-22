import httpCommon from 'utils/http-common'
const createAmenity = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/setup/amenity/create`,
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
const updateAmenity = async (payload) => {
  try {
    const response = await httpCommon.put(
      `/setup/amenity/update`,
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
const removeAmenity = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/amenity/` + payload?.doc?._id,
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
const fetchAmenity = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/amenity/list?search=' + payload?.doc?.search,
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
const fetchAmenityById = async (payload) => {
  try {
    const response = await httpCommon.get(
      `/setup/amenity/${payload?.doc?._id}`,
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

const AmenityServices = {
  createAmenity,
  updateAmenity,
  removeAmenity,
  fetchAmenity,
  fetchAmenityById,
}
export default AmenityServices
