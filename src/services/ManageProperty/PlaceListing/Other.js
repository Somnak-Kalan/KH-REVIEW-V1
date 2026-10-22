import httpCommon from 'utils/http-common'
const updateStatusNonBusinessProperty = async (payload) => {
  try {
    const response = await httpCommon.post(
      '/place/update_status/' + payload?.doc?.id,
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
const addComment = async (payload) => {
  try {
    const response = await httpCommon.post(
      '/place/add_comment/' + payload?.doc?.id,
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
const addRemark = async (payload) => {
  try {
    const response = await httpCommon.post(
      '/place/add_remark/' + payload?.doc?.id,
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
//
const saveAlbum = async (payload) => {

  try {
    const response = await httpCommon.post(
      '/place/save_gallery/' +
      payload?.locationId +
      '/' +
      payload?.category_gallery,
      payload?.formData,
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
const updateAlbum = async (payload) => {
  try {
    const response = await httpCommon.post(
      '/place/update_gallery/' + payload?.locationId + '/' + payload?.albumId,
      payload?.formData,
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
const removeAlbum = async (payload) => {
  try {
    const response = await httpCommon.delete(
      '/place/delete_gallery/' + payload?.locationId + '/' + payload?.albumId,
      {
        headers: {
          // 'Content-Type': 'multipart/form-data',
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

const OtherServiceNonBusinessProperty = {
  updateStatusNonBusinessProperty,
  addComment,
  addRemark,
  saveAlbum,
  updateAlbum,
  removeAlbum,
}
export default OtherServiceNonBusinessProperty
