import httpCommon from 'utils/http-common'



// ======================================================
// PROVINCE THEME
// ======================================================



const fetchProvinceThemes = async (payload) => {


    const response = await httpCommon.get(

        '/setup/province-theme/list',

        {

            headers: {

                Authorization:

                    `Bearer ${payload.access_token}`,

            }

        }

    )



    return response.data

}







const createAllProvinceTheme = async (payload) => {



    const formData = new FormData()



    if (payload?.doc?.lightWallpaper) {


        formData.append(

            'lightWallpaper',

            payload.doc.lightWallpaper

        )

    }




    if (payload?.doc?.darkWallpaper) {


        formData.append(

            'darkWallpaper',

            payload.doc.darkWallpaper

        )

    }





    const response = await httpCommon.post(


        '/setup/province-theme/create-all',


        formData,


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`,


                'Content-Type':

                    'multipart/form-data',


            }

        }


    )




    return response.data


}









const updateProvinceTheme = async (payload) => {



    const formData = new FormData()



    /**
     * Required:
     * themeId
     */

    if (payload?.doc?.themeId) {


        formData.append(

            'themeId',

            payload.doc.themeId

        )

    }






    if (payload?.doc?.lightWallpaper) {


        formData.append(

            'lightWallpaper',

            payload.doc.lightWallpaper

        )

    }






    if (payload?.doc?.darkWallpaper) {


        formData.append(

            'darkWallpaper',

            payload.doc.darkWallpaper

        )

    }






    const response = await httpCommon.put(


        '/setup/province-theme/update',


        formData,


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`,


                'Content-Type':

                    'multipart/form-data',


            }

        }


    )




    return response.data


}












// ======================================================
// EVENT THEME
// ======================================================



const fetchEventThemes = async (payload) => {



    const response = await httpCommon.get(


        '/setup/event-theme/list',


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`,


            }

        }


    )



    return response.data


}









const createEventTheme = async (payload) => {



    const formData = new FormData()





    if (payload?.doc?.lightWallpaper) {


        formData.append(

            'lightWallpaper',

            payload.doc.lightWallpaper

        )

    }







    if (payload?.doc?.darkWallpaper) {


        formData.append(

            'darkWallpaper',

            payload.doc.darkWallpaper

        )

    }







    if (payload?.doc?.name) {


        formData.append(

            'name',

            payload.doc.name

        )

    }








    const response = await httpCommon.post(


        '/setup/event-theme/create',


        formData,


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`,


                'Content-Type':

                    'multipart/form-data',


            }

        }


    )



    return response.data


}













const updateEventTheme = async (payload) => {



    const formData = new FormData()





    if (payload?.doc?.themeId) {


        formData.append(

            'themeId',

            payload.doc.themeId

        )

    }







    if (payload?.doc?.lightWallpaper) {


        formData.append(

            'lightWallpaper',

            payload.doc.lightWallpaper

        )

    }







    if (payload?.doc?.darkWallpaper) {


        formData.append(

            'darkWallpaper',

            payload.doc.darkWallpaper

        )

    }







    if (payload?.doc?.name) {


        formData.append(

            'name',

            payload.doc.name

        )

    }







    const response = await httpCommon.put(


        '/setup/event-theme/update',


        formData,


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`,


                'Content-Type':

                    'multipart/form-data',


            }

        }


    )






    return response.data


}












const removeEventTheme = async (payload) => {



    const response = await httpCommon.delete(


        `/setup/event-theme/${payload.doc._id}`,


        {

            headers: {


                Authorization:

                    `Bearer ${payload.access_token}`


            }

        }


    )




    return response.data


}











// ======================================================
// EXPORT
// ======================================================



const ThemeServices = {


    // province

    fetchProvinceThemes,

    createAllProvinceTheme,

    updateProvinceTheme,



    // event

    fetchEventThemes,

    createEventTheme,

    updateEventTheme,

    removeEventTheme,


}



export default ThemeServices