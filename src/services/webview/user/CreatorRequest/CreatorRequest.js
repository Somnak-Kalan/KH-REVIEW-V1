import httpCommon from 'utils/http-common'

const createCreatorRequest = async (payload) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-app-user-id': payload?.userId,
        }
        if (payload?.access_token) {
            headers.Authorization = `Bearer ${payload.access_token}`
        }

        const response = await httpCommon.post(
            '/webview/creator-request',
            payload?.doc,
            { headers }
        )

        return response.data
    } catch (error) {
        console.error(
            'Error creating creator request:',
            error.response?.data || error.message
        )
        throw error
    }
}

const fetchCreatorRequest = async (payload) => {
    try {
        const headers = {}

        if (payload?.access_token) {
            headers.Authorization = `Bearer ${payload.access_token}`
        }

        if (payload?.userId) {
            headers['x-app-user-id'] = payload.userId
        }

        const response = await httpCommon.get(
            '/app/webview/creator-request',
            { headers }
        )

        return response.data
    } catch (error) {
        console.error(
            'Error fetching creator request:',
            error.response?.data || error.message
        )
        throw error
    }
}

const fetchCreatorRequestById = async (payload) => {
    try {
        const headers = {}

        if (payload?.access_token) {
            headers.Authorization = `Bearer ${payload.access_token}`
        }

        if (payload?.userId) {
            headers['x-app-user-id'] = payload.userId
        }

        const response = await httpCommon.get(
            `/webview/creator-request/${payload?.doc?._id}`,
            { headers }
        )

        return response.data
    } catch (error) {
        console.error(
            'Error fetching creator request by id:',
            error.response?.data || error.message
        )
        throw error
    }
}

const CreatorRequestServices = {
    createCreatorRequest,
    fetchCreatorRequest,
    fetchCreatorRequestById,
}

export default CreatorRequestServices