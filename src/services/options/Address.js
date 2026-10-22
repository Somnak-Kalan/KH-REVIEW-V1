import httpCommon from '../../utils/http-common'
const getProvinceOpt = async (payload) => {
    try {
        const res = await httpCommon.get('/banner/province_opt', {
            headers: {
                Authorization: `Bearer ${payload.access_token}`,
            },
        })
        return res?.data || []
    } catch (error) {
        throw error
    }
}

const AddressOptServices = {
    getProvinceOpt
}

export default AddressOptServices
