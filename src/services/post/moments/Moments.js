import httpCommon from '../../../utils/http-common'

// -----------------------------
// LIST
// -----------------------------
const ListMoment = async (payload) => {
    try {
        const response = await httpCommon.post(
            `/moment/list`,
            payload?.doc,
            { headers: { Authorization: `Bearer ${payload.access_token}` } }
        )
        return response.data
    } catch (error) {
        throw error
    }
}

const FilterHastages = async (payload) => {
    try {
        const response = await httpCommon.get(
            `/hashtag/suggestions?query=` + payload.search + "&limit=10",
            payload?.doc,
            { headers: { Authorization: `Bearer ${payload.access_token}` } }
        )
        return response.data
    } catch (error) {
        throw error
    }
}

// -----------------------------
// MOMENT INTERACTIONS
// GET /core/moment/:id/interactions?actionType=comment&page=1&size=20
// -----------------------------
const ListMomentInteractions = async (payload) => {
    try {
        const actionType = payload?.doc?.actionType ?? payload?.actionType ?? ''
        const page = payload?.doc?.page ?? payload?.page ?? 1
        const size = payload?.doc?.size ?? payload?.size ?? 20

        const response = await httpCommon.get(
            `/moment/${payload.id}/interactions`,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                },
                params: {
                    actionType,
                    page,
                    size,
                },
            }
        )

        return response.data
    } catch (error) {
        console.error('Error fetching moment interactions:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
// CREATE
// -----------------------------
const CreateMoment = async (payload) => {
    try {
        const response = await httpCommon.post(
            `/moment/create`,
            payload.data,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error creating moment video:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
// UPDATE MAIN MOMENT
// -----------------------------
const UpdateMoment = async (payload) => {
    try {
        const response = await httpCommon.put(
            `/moment/update/` + payload.id,
            payload.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error updating moment video:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
// DETAIL (POST)
// -----------------------------
const fetchMomentById = async (payload) => {
    try {
        const response = await httpCommon.post(
            `/moment/detail`,
            { id: payload?.doc?._id },
            {
                headers: { Authorization: `Bearer ${payload.access_token}` },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching moment video:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
// DELETE
// -----------------------------
const deleteMomentById = async (payload) => {
    try {
        const response = await httpCommon.delete(
            `/moment/delete`,
            {
                headers: { Authorization: `Bearer ${payload.access_token}` },
                data: { id: payload.id },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error deleting moment video:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
// OPTIONAL GET DETAIL (if you still use it)
// -----------------------------
const fetchMomentDetailById = async (payload) => {
    try {
        const response = await httpCommon.get(
            `/moment_video/video_detail/${payload?.id}`,
            {
                headers: { Authorization: `Bearer ${payload.access_token}` },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching moment video detail:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
//  Update media (mute/isCover/...)
//
// form-data:
//   mediaUpdates: string (JSON array)
// -----------------------------
const UpdateMomentMedia = async (payload) => {
    try {
        const formData = new FormData()
        // formData.append('data', JSON.stringify(payload.mediaUpdates || []))

        const response = await httpCommon.put(
            `/moment/update/` + payload.id,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error updating moment media:', error.response?.data || error.message)
        throw error
    }
}

// -----------------------------
//  Upload NEW video covers for existing media (MATCH POSTMAN SCREENSHOT)
//
// form-data:
//   videoCoverUpdates: string (JSON array)
//   videoCovers: (repeat) File OR Text (string path)
// -----------------------------
const UploadMultipleCovers = async (payload) => {
    try {
        const formData = new FormData()

        const covers = Array.isArray(payload.videoCovers) ? payload.videoCovers : []
        const videoCoverUpdates = covers
            .filter((c) => c?.mediaId)
            .map((c) => ({
                mediaId: c.mediaId,
                ...(typeof c.isCover === 'boolean' ? { isCover: c.isCover } : {}),
            }))

        formData.append('videoCoverUpdates', JSON.stringify(videoCoverUpdates))
        covers.forEach((c) => {
            if (!c?.mediaId) return

            // file upload
            if (c?.file instanceof File || c?.file instanceof Blob) {
                formData.append('videoCovers', c.file)
                return
            }

            // text path (Postman "Text" example)
            if (typeof c?.path === 'string' && c.path) {
                formData.append('videoCovers', c.path)
            }
        })

        const response = await httpCommon.put(
            `/moment/update/` + payload.id,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        )

        return response.data
    } catch (error) {
        console.error('Error uploading multiple video covers:', error.response?.data || error.message)
        throw error
    }
}

//hide moment post && video 
const hiddenMoment = async (payload) => {
    try {
        console.log("payload:", payload)
        console.log("doc:", payload.doc)
        const response = await httpCommon.put(
            `/moment/hidden/${payload.id}`,
            payload?.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`
                }
            }
        )

        return response.data

    } catch (error) {
        console.error(error.response?.data || error.message)
        throw error
    }
}

//approve moment post && video 
const approveMoment = async (payload) => {
    try {


        const response = await httpCommon.put(
            `/moment/approve/${payload.id}`,
            payload.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`
                }
            }
        )

        return response.data

    } catch (error) {
        throw error
    }
}

//active moment post && video 
const activeMoment = async (payload) => {
    try {
        const response = await httpCommon.put(
            `/moment/active/` + payload.id,
            payload?.doc,
            {
                headers: {
                    Authorization: `Bearer ${payload.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('Error hiding moment:', error.response?.data || error.message)
        throw error
    }
}


// -----------------------------
// EXPORT
// -----------------------------
const MomentService = {
    CreateMoment,
    ListMoment,
    ListMomentInteractions,
    fetchMomentById,
    UpdateMoment,
    deleteMomentById,
    fetchMomentDetailById,
    UpdateMomentMedia,
    UploadMultipleCovers,
    FilterHastages,
    hiddenMoment,
    approveMoment,
    activeMoment
}

export default MomentService