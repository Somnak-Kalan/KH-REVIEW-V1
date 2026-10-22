import httpCommon from 'utils/http-common'
const AddCommentProperty = async (payload) => {
  try {
    const response = await httpCommon.post(
      `/place/add_comment/` + payload?.locationId,
      payload?.doc,
      {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const UpdateCommentProperty = async (payload) => {
  try {
    const response = await httpCommon.put(
      `/place/update_comment/` + payload?.locationId,
      payload?.doc,
      {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating :', error.response?.data || error.message)
    throw error
  }
}
const DeleteCommentProperty = async (payload) => {
  try {
    const response = await httpCommon.delete(
      `/place/delete_comment/${payload?.locationId}`,
      {
        headers: {
          Authorization: `Bearer ${payload.access_token}`,
        },
        data: payload?.doc,
      }
    )
    return response.data
  } catch (error) {
    console.error(
      'Error deleting comment:',
      error.response?.data || error.message
    )
    throw error
  }
}
const GetCommentProperty = async (payload) => {
  try {
    const response = await httpCommon.post(`/place/comment_list`, payload.doc, {
      headers: {
        Authorization: `Bearer ${payload.access_token}`,
      },
      data: payload?.doc,
    })
    return response.data
  } catch (error) {
    console.error(
      'Error deleting comment:',
      error.response?.data || error.message
    )
    throw error
  }
}

const TaskPropertyServices = {
  AddCommentProperty,
  UpdateCommentProperty,
  DeleteCommentProperty,
  GetCommentProperty,
}
export default TaskPropertyServices
