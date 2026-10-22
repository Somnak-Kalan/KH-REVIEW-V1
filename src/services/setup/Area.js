import httpCommon from 'utils/http-common'

// Build query string safely (optional)
const toQueryString = (params = {}) => {
    const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    return qs ? `?${qs}` : ''
}

/**
 * payload shape (same style as your AlbumServices):
 * {
 *   access_token: string,
 *   doc: object
 * }
 */

const createArea = async (payload) => {

    try {
        const response = await httpCommon.post(
            `/area/create`,
            payload?.doc,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error creating area:', error.response?.data || error.message)
        throw error
    }
}

const fetchAreas = async (payload) => {
    try {
        // ✅ API expects POST with JSON body (keyword/type/status optional)
        const body = payload?.doc || {}

        const response = await httpCommon.post(`/area/list`, body, {
            headers: {
                Authorization: `Bearer ${payload.access_token}`,
            },
        })

        return response.data
    } catch (error) {
        console.error('Error fetching areas:', error.response?.data || error.message)
        throw error
    }
}

const fetchAreaById = async (payload) => {
    try {
        ;

        const response = await httpCommon.get(
            `/area/detail/${payload?.doc?._id}`,
            {
                headers: { Authorization: `Bearer ${payload.access_token}` },
            }
        )

        return response.data
    } catch (error) {
        console.error(
            'Error fetching area detail:',
            error.response?.data || error.message
        )
        throw error
    }
}

const updateArea = async (payload) => {
    try {
        // image shows: PUT /core/area/update/:id  (text fields only)
        const { _id, ...docWithoutId } = payload?.doc || payload?.formData || {}

        const response = await httpCommon.put(
            `/area/update/${_id}`,
            docWithoutId, // send only text fields (not _id)
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error updating area:', error.response?.data || error.message)
        throw error
    }
}
const updateAreaCoverOnly = async (payload) => {
    try {
        // image shows: PUT /core/area/update/:id  (text fields only)
        const { _id, ...docWithoutId } = payload?.doc || {}

        const response = await httpCommon.put(
            `/area/update/${_id}`,
            docWithoutId?.formData, // send only text fields (not _id)
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error updating area:', error.response?.data || error.message)
        throw error
    }
}

const removeArea = async (payload) => {
    try {
        // image shows: DELETE /core/area/delete/:id
        const response = await httpCommon.delete(
            `/area/delete/${payload?.doc?._id}`,
            {
                headers: {

                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error deleting area:', error.response?.data || error.message)
        throw error
    }
}

const getAssignablePlaces = async (payload) => {
    try {
        // image shows:
        // GET /core/area/assignable-places/:id/assignable-places
        const response = await httpCommon.get(
            `/area/assignable-places/${payload?.doc?._id}/assignable-places`,
            {
                headers: { Authorization: `Bearer ${payload.access_token}` },
            }
        )
        return response.data
    } catch (error) {
        console.error(
            'Error fetching assignable places:',
            error.response?.data || error.message
        )
        throw error
    }
}

const assignPlacesToArea = async (payload) => {
    try {
        // image shows:
        // POST /core/area/assign-places/:id
        // payload.doc example:
        // { _id: areaId, placeIds: ["...","..."] }  (or any body your API expects)
        const { _id, ...body } = payload?.doc || {}

        const response = await httpCommon.post(
            `/area/assign-places/${_id}`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error(
            'Error assigning places to area:',
            error.response?.data || error.message
        )
        throw error
    }
}

const removePlacesFromArea = async (payload) => {
    try {
        // image shows:
        // POST /core/area/remove-places/:id/remove-places
        // payload.doc example:
        // { _id: areaId, placeIds: ["...","..."] }  (or any body your API expects)
        const { _id, ...body } = payload?.doc || {}

        const response = await httpCommon.post(
            `/area/remove-places/${_id}`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.error(
            'Error removing places from area:',
            error.response?.data || error.message
        )
        throw error
    }
}

const AreaServices = {
    createArea,
    fetchAreas,
    fetchAreaById,
    updateArea,
    removeArea,
    getAssignablePlaces,
    assignPlacesToArea,
    removePlacesFromArea,
    updateAreaCoverOnly
}

export default AreaServices
