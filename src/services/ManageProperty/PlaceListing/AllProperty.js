import httpCommon from 'utils/http-common'
import PropertyAlbumServices from './Album'

const authHeader = accessToken => ({
  Authorization: `Bearer ${accessToken}`,
})

const createNonBusinessProperty =
  async ({
    access_token,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        '/place/save_location/',
        doc,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',

            ...authHeader(
              access_token
            ),
          },
        }
      )

    return response.data
  }

const updateNonBusinessProperty =
  async ({
    access_token,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        '/place/update_place/',
        doc,
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const updatePropertyInformation =
  async ({
    access_token,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        `/place/update_info/${doc._id}`,
        doc,
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const updatePropertyAddress =
  async ({
    access_token,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        `/place/update_address/${doc._id}`,
        doc,
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const updatePropertyThumbnail =
  async ({
    access_token,
    _id,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        `/place/update_image/${_id}`,
        doc,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',

            ...authHeader(
              access_token
            ),
          },
        }
      )

    return response.data
  }

const updatePropertyVideo =
  async ({
    access_token,
    _id,
    doc,
  }) => {
    const response =
      await httpCommon.post(
        `/place/update_video/${_id}`,
        doc,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',

            ...authHeader(
              access_token
            ),
          },
        }
      )

    return response.data
  }

const addPropertyMedia =
  async ({
    access_token,
    propertyId,
    formData,
  }) => {
    const response =
      await httpCommon.post(
        `/place/add_media/${propertyId}`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',

            ...authHeader(
              access_token
            ),
          },
        }
      )

    return response.data
  }

const removeActivity =
  async ({
    access_token,
    doc,
  }) => {
    const response =
      await httpCommon.delete(
        `/setup/activity/${doc._id}`,
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const fetchAllProperty =
  async ({
    access_token,
    filters,
  }) => {
    const response =
      await httpCommon.post(
        '/place/place_list',
        filters,
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const fetchNonBusinessPropertyById =
  async ({
    access_token,
    id,
  }) => {
    const response =
      await httpCommon.post(
        '/place/place_list',
        { id },
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const fetchPlaceReviewList =
  async ({
    access_token,
    code,
    params,
  }) => {
    const response =
      await httpCommon.get(
        `/place/place-review-list/${encodeURIComponent(
          code
        )}`,
        {
          params,

          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const fetchAlbumSetList =
  async ({
    access_token,
    params,
  }) => {
    const response =
      await httpCommon.get(
        '/setup/album-set/list',
        {
          params,

          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const removeImageGallery =
  async ({
    access_token,
    propertyId,
    galleryId,
    fileUrl,
  }) => {
    const response =
      await httpCommon.post(
        `/place/remove_gallery_image/${propertyId}`,
        {
          albumId:
            galleryId,

          doc: {
            galleryFile:
              fileUrl,
          },
        },
        {
          headers:
            authHeader(
              access_token
            ),
        }
      )

    return response.data
  }

const moveImagesGallery =
  async ({
    access_token,
    propertyId,
    sourceAlbumSetId,
    sourceAlbumId,
    targetAlbumSetId,
    targetAlbumId,
    fileUrls,
    moveAll,
  }) => {
    const requestBody = {
      sourceAlbumSetId:
        sourceAlbumSetId ?? null,

      sourceAlbumId:
        sourceAlbumId ?? null,

      targetAlbumSetId,
      targetAlbumId,
    }

    if (moveAll) {
      requestBody.moveAll = true
    } else {
      requestBody.fileUrls =
        fileUrls
    }

    const response =
      await httpCommon.patch(
        `/place/move_gallery_images/${propertyId}`,
        requestBody,
        {
          headers: {
            'Content-Type':
              'application/json',

            ...authHeader(
              access_token
            ),
          },
        }
      )

    return response.data
  }

const reorderImagesGallery =
  async ({
    access_token,
    propertyId,
    galleryId,
    albumId,
    fileUrls,
  }) => {
    return PropertyAlbumServices
      .reorderImagesGallery({
        _id: propertyId,
        propertyId,
        albumId,
        galleryId,
        files: fileUrls,

        images:
          fileUrls.map(
            (
              url,
              order
            ) => ({
              galleryId,
              galleryFile:
                url,
              url,
              order,
            })
          ),

        doc: {
          files: fileUrls,
          images: fileUrls,
        },

        access_token,
      })
  }

const AllPropertyServices = {
  createNonBusinessProperty,
  updateNonBusinessProperty,

  updatePropertyInformation,
  updatePropertyAddress,
  updatePropertyThumbnail,
  updatePropertyVideo,

  addPropertyMedia,

  removeActivity,

  fetchAllProperty,
  fetchNonBusinessPropertyById,
  fetchPlaceReviewList,
  fetchAlbumSetList,

  removeImageGallery,
  moveImagesGallery,
  reorderImagesGallery,
}

export default AllPropertyServices