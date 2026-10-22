import httpCommon from 'utils/http-common'
const createAlbum = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/setup/album/create`,
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
const updateAlbum = async (payload) => {
  try {
    const response = await httpCommon.put(`/setup/album/update`, payload?.doc, {
      headers: {
        Authorization: `Bearer ${payload.access_token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const removeAlbum = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/setup/album/` + payload?.doc?._id,
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
const fetchAlbum = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/album/list?search=' + payload?.doc?.search,
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
const fetchAlbumById = async (payload) => {
  try {
    const response = await httpCommon.get(`/setup/album/${payload?.doc?._id}`, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}

const AlbumServices = {
  createAlbum,
  updateAlbum,
  removeAlbum,
  fetchAlbum,
  fetchAlbumById,
}
export default AlbumServices
