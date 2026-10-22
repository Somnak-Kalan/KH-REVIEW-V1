import httpCommon from 'utils/http-common'

const createQueryString = (doc = {}) => {
    const params = new URLSearchParams()

    if (doc?.page !== undefined && doc?.page !== null && doc?.page !== '') {
        params.append('page', doc.page)
    }

    if (doc?.size !== undefined && doc?.size !== null && doc?.size !== '') {
        params.append('limit', doc.size)
    }

    if (doc?.limit !== undefined && doc?.limit !== null && doc?.limit !== '') {
        params.append('limit', doc.limit)
    }

    if (doc?.search !== undefined && doc?.search !== null && doc?.search !== '') {
        params.append('search', doc.search)
    }

    if (doc?.status !== undefined && doc?.status !== null && doc?.status !== '') {
        params.append('status', doc.status)
    }

    if (doc?.userId !== undefined && doc?.userId !== null && doc?.userId !== '') {
        params.append('userId', doc.userId)
    }

    return params.toString()
}

const fetchCreatorRequests = async (payload) => {
    try {
        const query = createQueryString(payload?.doc || {})
        const response = await httpCommon.get(
            `/creator-requests/list${query ? `?${query}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching creator requests :', error.response?.data || error.message)
        throw error
    }
}

const fetchCreatorRequestById = async (payload) => {
    try {
        const response = await httpCommon.get(
            `/creator-requests/detail/${payload?.doc?._id}`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching creator request by id :', error.response?.data || error.message)
        throw error
    }
}

const createCreatorRequest = async (payload) => {
    try {
        const response = await httpCommon.post(
            `/creator-requests/create`,
            payload?.doc?.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error creating creator request :', error.response?.data || error.message)
        throw error
    }
}

const updateCreatorRequest = async (payload) => {
    try {
        const response = await httpCommon.patch(
            `/creator-requests/update/${payload?.doc?._id}`,
            payload?.doc?.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error updating creator request :', error.response?.data || error.message)
        throw error
    }
}

const approveCreatorRequest = async (payload) => {
    try {
        const response = await httpCommon.patch(
            `/creator-requests/approve/${payload?.doc?._id}`,
            payload?.doc?.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error approving creator request :', error.response?.data || error.message)
        throw error
    }
}

const rejectCreatorRequest = async (payload) => {
    try {
        const response = await httpCommon.patch(
            `/creator-requests/reject/${payload?.doc?._id}`,
            payload?.doc?.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error rejecting creator request :', error.response?.data || error.message)
        throw error
    }
}

const CreatorRequestServices = {
    fetchCreatorRequests,
    fetchCreatorRequestById,
    createCreatorRequest,
    updateCreatorRequest,
    approveCreatorRequest,
    rejectCreatorRequest,
}

export default CreatorRequestServices