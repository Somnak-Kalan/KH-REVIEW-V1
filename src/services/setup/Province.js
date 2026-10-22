import httpCommon from 'utils/http-common'

const fetchProvince = async (payload) => {
  try {
    const response = await httpCommon.get(
      '/setup/province/list?search=' + (payload?.doc?.search || ''),
      { headers: { Authorization: `Bearer ${payload.access_token}` } }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching:', error.response?.data || error.message)
    throw error
  }
}

const fetchProvinceById = async (payload) => {
  try {
    const response = await httpCommon.get(`/setup/province/${payload?.doc?._id}`, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching by id:', error.response?.data || error.message)
    throw error
  }
}

const isFormData = (v) => typeof FormData !== 'undefined' && v instanceof FormData

const UpdateProvince = async (payload) => {

  try {
    const id = payload?.doc?._id

    //  NEW: doc = { _id, formData }
    if (id && isFormData(payload?.doc?.formData)) {
      const response = await httpCommon.put(
        `/setup/province/update/${id}`,
        payload.doc.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${payload.access_token}`,
          },
        }
      )
      return response.data
    }

    //  OLD: if doc itself is FormData (still supported)
    if (isFormData(payload?.doc)) {
      const response = await httpCommon.put(`/setup/province/update`, payload.doc, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${payload.access_token}`,
        },
      })
      return response.data
    }

    //  JSON branch
    const body = payload?.doc || {}
    const response = await httpCommon.put(`/setup/province/update/${id}`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.access_token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error updating:', error.response?.data || error.message)
    throw error
  }
}

const ProvinceServices = {
  fetchProvince,
  fetchProvinceById,
  UpdateProvince,
}

export default ProvinceServices
