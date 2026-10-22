import httpCommon from 'utils/http-common'
const fetchReviewImportNonBusiness = async (payload) => {
  try {
    const response = await httpCommon.post('/place/place_excel_list', payload.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const updateImportReviewNonBusiness = async (payload) => {
  try {
    const response = await httpCommon.post(
      '/place/save_location/',
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
const fetchReviewImportNonBusinessById = async (payload) => {
  try {
    const response = await httpCommon.get(
      `/place/get_place/${payload?.doc?.id}`,
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

const ReviewImportNonBusinessServices = {
  fetchReviewImportNonBusiness,
  fetchReviewImportNonBusinessById,
  updateImportReviewNonBusiness,
}
export default ReviewImportNonBusinessServices
