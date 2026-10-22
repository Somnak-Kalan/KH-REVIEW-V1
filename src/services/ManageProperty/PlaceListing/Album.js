import httpCommon from 'utils/http-common'
const getAuthorizationHeader = accessToken => {
  const token = String(accessToken || '')
    .replace(/^Bearer\s+/i, '')
    .replace(/^"|"$/g, '')
    .trim()

  return token
    ? `Bearer ${token}`
    : ''
}

const AddAlbumProperty = async payload => {
  try {
    const response = await httpCommon.post(
      `/place/add_media/${payload?._id}`,
      payload?.formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization:
            getAuthorizationHeader(
              payload?.access_token
            ),
        },
      }
    )

    return response.data
  } catch (error) {
    console.error(
      'Error creating album:',
      error?.response?.data ||
      error?.message
    )

    throw error
  }
}

const AddImageToGalleryProperty =
  async payload => {
    try {
      const response =
        await httpCommon.post(
          `/place/add_image_gallery/${payload?._id}/${payload?.albumId}`,
          payload?.formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization:
                getAuthorizationHeader(
                  payload?.access_token
                ),
            },
          }
        )

      return response.data
    } catch (error) {
      console.error(
        'Error adding gallery images:',
        error?.response?.data ||
        error?.message
      )

      throw error
    }
  }

const removeImageGallery =
  async payload => {
    try {
      const response =
        await httpCommon.post(
          `/place/remove_image_gallery/${payload?._id}/${payload?.albumId}`,
          payload?.doc,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization:
                getAuthorizationHeader(
                  payload?.access_token
                ),
            },
          }
        )

      return response.data
    } catch (error) {
      console.error(
        'Error removing gallery image:',
        error?.response?.data ||
        error?.message
      )

      throw error
    }
  }

const removeAlbumProperty =
  async payload => {
    try {
      const response =
        await httpCommon.delete(
          `/place/delete_gallery/${payload?._id}/${payload?.albumId}`,
          {
            headers: {
              Authorization:
                getAuthorizationHeader(
                  payload?.access_token
                ),
            },
          }
        )

      return response.data
    } catch (error) {
      console.error(
        'Error removing album:',
        error?.response?.data ||
        error?.message
      )

      throw error
    }
  }

const PropertyAlbumServices = {
  AddAlbumProperty,
  removeAlbumProperty,
  AddImageToGalleryProperty,
  removeImageGallery,
}

export default PropertyAlbumServices