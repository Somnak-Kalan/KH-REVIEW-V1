import httpCommon from '../../utils/http-common'
const fetchUserOpt = async (payload) => {
    try {
        const res = await httpCommon.get('/banner/user_opt', {
            headers: {
                Authorization: `Bearer ${payload.access_token}`,
            },
        })
        return res.data
    } catch (error) {
        throw error
    }
}
const UserOptServices = {
    fetchUserOpt
}

export default UserOptServices
