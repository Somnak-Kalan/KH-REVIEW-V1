import httpCommon from 'utils/http-common'
const fetchUserApp = async (payload) => {
  try {
    const response = await httpCommon.post('/app/user', payload?.doc, {
      headers: { Authorization: `Bearer ${payload.access_token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error creating Role:', error.response?.data || error.message)
    throw error
  }
}

const MobileAppUserServices = {
  fetchUserApp,
}
export default MobileAppUserServices
