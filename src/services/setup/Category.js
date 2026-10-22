import httpCommon from 'utils/http-common'



const createCategory = async (payload) => {

  const response = await httpCommon.post(

    `/setup/category/create`,

    payload?.doc,

    {

      headers: {

        'Content-Type':
          'multipart/form-data',

        Authorization:
          `Bearer ${payload.access_token}`,

      }

    }

  )


  return response.data

}






const updateCategory = async (payload) => {


  const response = await httpCommon.put(

    `/setup/category/update`,

    payload?.doc,

    {

      headers: {

        'Content-Type':
          'multipart/form-data',

        Authorization:
          `Bearer ${payload.access_token}`,

      }

    }

  )


  return response.data


}







const removeCategory = async (payload) => {


  const response =
    await httpCommon.delete(

      `/setup/category/${payload?.doc?._id}`,

      {

        headers: {

          Authorization:
            `Bearer ${payload.access_token}`

        }

      }

    )


  return response.data


}









const fetchCategory = async (payload) => {


  const response =
    await httpCommon.get(

      `/setup/category/list?search=${payload?.doc?.search || ''}`,

      {

        headers: {

          Authorization:
            `Bearer ${payload.access_token}`

        }

      }

    )


  return response.data


}







const fetchCategoryById = async (payload) => {


  const response =
    await httpCommon.get(

      `/setup/category/${payload?.doc?._id}`,

      {

        headers: {

          Authorization:
            `Bearer ${payload.access_token}`

        }

      }

    )


  return response.data


}









// ===============================
// CATEGORY REORDER
// ===============================

const reorderCategory = async (payload) => {

  try {


    console.log(
      'API CATEGORY IDS:',
      payload.categoryIds
    )


    const response =
      await httpCommon.put(

        `/setup/category/reorder`,

        {
          categoryIds:
            payload.categoryIds
        },


        {

          headers: {

            Authorization:
              `Bearer ${payload.access_token}`,


            'Content-Type':
              'application/json'

          }

        }

      )


    return response.data


  } catch (error) {


    console.error(
      'CATEGORY REORDER ERROR:',
      error.response?.data ||
      error.message
    )


    throw error


  }

}





// ===============================
// SUB CATEGORY REORDER
// ===============================


const reorderSubCategory = async (payload) => {


  try {


    console.log(
      'API SUB CATEGORY IDS:',
      payload.subCategoryIds
    )



    const response =
      await httpCommon.put(


        `/setup/sub-category/reorder`,


        {


          subCategoryIds:
            payload.subCategoryIds


        },


        {


          headers: {


            Authorization:
              `Bearer ${payload.access_token}`,


            'Content-Type':
              'application/json'


          }


        }


      )



    return response.data



  } catch (error) {


    console.error(
      'SUB CATEGORY REORDER ERROR:',
      error.response?.data ||
      error.message
    )


    throw error


  }


}









const CategoryServices = {


  createCategory,


  updateCategory,


  removeCategory,


  fetchCategory,


  fetchCategoryById,


  reorderCategory,


  reorderSubCategory,


}



export default CategoryServices