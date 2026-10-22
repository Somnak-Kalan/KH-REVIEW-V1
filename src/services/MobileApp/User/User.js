import httpCommon from 'utils/http-common'

const createQueryString = (doc = {}) => {
    const params = new URLSearchParams()

    if (doc?.page !== undefined && doc?.page !== null && doc?.page !== '') {
        params.append('page', doc.page)
    }

    if (doc?.size !== undefined && doc?.size !== null && doc?.size !== '') {
        params.append('size', doc.size)
    }

    if (doc?.search !== undefined && doc?.search !== null) {
        params.append('search', doc.search)
    }

    if (doc?.status !== undefined && doc?.status !== null && doc?.status !== '') {
        params.append('status', doc.status)
    }

    if (doc?.gender !== undefined && doc?.gender !== null && doc?.gender !== '') {
        params.append('gender', doc.gender)
    }

    if (doc?.startDate !== undefined && doc?.startDate !== null && doc?.startDate !== '') {
        params.append('startDate', doc.startDate)
    }

    if (doc?.endDate !== undefined && doc?.endDate !== null && doc?.endDate !== '') {
        params.append('endDate', doc.endDate)
    }
    if (doc?.isBusinessOwner !== undefined && doc?.isBusinessOwner !== null) {
        params.append('isBusinessOwner', doc.isBusinessOwner)
    }
    if (doc?.isRestrictedUser !== undefined && doc?.isRestrictedUser !== null) {
        params.append('isRestricted', doc.isRestrictedUser)
    }

    if (doc?.userType !== undefined && doc?.userType !== null) {
        params.append('userType', doc.userType)
    }


    return params.toString()
}

const fetchAppUsers = async (payload) => {
    try {
        const query = createQueryString(payload?.doc || {})
        const response = await httpCommon.get(
            `/app/users${query ? `?${query}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching app users :', error.response?.data || error.message)
        throw error
    }
}

const fetchAppUserById = async (payload) => {
    try {
        const response = await httpCommon.get(
            `/app/users/${payload?.doc?._id}`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching app user by id :', error.response?.data || error.message)
        throw error
    }
}

const updateAppUser = async (payload) => {
    try {
        const response = await httpCommon.put(
            `/app/users/${payload?.doc?._id}`,
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
        console.error('Error updating app user :', error.response?.data || error.message)
        throw error
    }
}

const removeAppUser = async (payload) => {
    try {
        const response = await httpCommon.delete(
            `/app/users/${payload?.doc?._id}`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error removing app user :', error.response?.data || error.message)
        throw error
    }
}

const AppUserServices = {
    fetchAppUsers,
    fetchAppUserById,
    updateAppUser,
    removeAppUser,
}

export default AppUserServices