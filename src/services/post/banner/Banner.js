import httpCommon from '../../../utils/http-common'

const ListBanner = async (payload) => {
    try {
        const response = await httpCommon.post(
            `/banner/list`,
            payload?.doc,
            { headers: { Authorization: `Bearer ${payload.access_token}` } }
        )
        return response.data
    } catch (error) {

        throw error
    }
}
const CreateBanner = async (payload) => {
    try {
        const response = await httpCommon.post(`/banner/create`,
            payload.formData,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
                // timeout: 60000,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const UpdateBanner = async (payload) => {
    try {
        const response = await httpCommon.put(`/banner/update/` + payload?.id,
            payload.formData,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const fetchBannerById = async (payload) => {
    try {
        const response = await httpCommon.post(`/banner/detail`, payload,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const deleteBannerById = async (payload) => {
    try {
        const response = await httpCommon.delete(`/banner/delete/` + payload?.id,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const fetchBannerDetailById = async (payload) => {
    try {
        const response = await httpCommon.post(`/banner/detail`, payload,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
////switch off on
const swithOffOn = async (payload) => {

    try {
        const response = await httpCommon.post(`/banner/settings/hide`, payload.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const fetchStatusSwitch = async (payload) => {
    try {
        const response = await httpCommon.get(`/banner/hide/status`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const updateBannerOrders = async (payload) => {
    try {
        const response = await httpCommon.put(`/banner/reorder`, payload?.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error.response?.data || error.message);
        throw error;
    }
};
const BannerService = {
    CreateBanner,
    ListBanner,
    fetchBannerById,
    UpdateBanner,
    deleteBannerById,
    fetchBannerDetailById,
    swithOffOn,
    fetchStatusSwitch,
    updateBannerOrders
}
export default BannerService
