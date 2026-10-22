
import httpCommon from '../../utils/http-common'

const fetchBusinessPlaceOpt = async (payload = {}) => {
    try {
        const access_token = payload?.access_token
        const search = payload?.search || ''
        const page = Number(payload?.page || 1)
        const limit = Number(payload?.limit || 10)

        if (!access_token) {
            return { data: [], selectedCount: 0, pagination: { page, limit, total: 0 } }
        }

        const res = await httpCommon.get('/banner/place_opt', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            params: {
                search,
                page,
                limit,
            },
        })

        return res?.data || { data: [], selectedCount: 0, pagination: { page, limit, total: 0 } }
    } catch (error) {
        console.error('Error fetching business place options:', error)
        throw error
    }
}

const BusiessPlaceOptServices = {
    fetchBusinessPlaceOpt,
}

export default BusiessPlaceOptServices
