import httpCommon from 'utils/http-common'


const getSuperAdmins = async (payload) => {
    try {

        const response = await httpCommon.get(
            '/admin/super-users',
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )

        return response.data

    } catch (error) {

        console.error(
            'Error fetching super admins:',
            error.response?.data || error.message
        )

        throw error
    }
}


export default {
    getSuperAdmins,
}