import { create } from 'zustand'

import ThemeServices from '../../../services/settings/theme/Theme'


export const useThemeStore = create((set, get) => ({

    // ==================================================
    // STATE
    // ==================================================

    provinceThemes: [],

    eventThemes: [],


    loadingProvince: false,

    loadingEvent: false,


    saving: false,


    error: null,



    // ==================================================
    // RESET
    // ==================================================

    clearThemeError: () => {

        set({

            error: null

        })

    },



    resetTheme: () => {

        set({

            provinceThemes: [],

            eventThemes: [],

            loadingProvince: false,

            loadingEvent: false,

            saving: false,

            error: null,

        })

    },





    // ==================================================
    // PROVINCE THEME
    // ==================================================


    fetchProvinceThemes: async (access_token) => {


        try {


            set({

                loadingProvince: true,

                error: null,

            })



            const response = await ThemeServices.fetchProvinceThemes({

                access_token

            })



            const list =

                response?.data ||

                response?.result ||

                response?.themes ||

                response ||

                []



            set({

                provinceThemes:

                    Array.isArray(list)

                        ? list

                        : [],


                loadingProvince: false,

            })



            return response



        } catch (error) {


            set({

                loadingProvince: false,

                error,

            })


            throw error

        }


    },






    createAllProvinceTheme: async (payload) => {


        try {


            set({

                saving: true,

                error: null,

            })



            const response = await ThemeServices.createAllProvinceTheme(

                payload

            )



            await get().fetchProvinceThemes(

                payload.access_token

            )



            set({

                saving: false,

            })



            return response



        } catch (error) {


            set({

                saving: false,

                error,

            })


            throw error

        }


    },








    updateProvinceTheme: async (payload) => {


        try {


            set({

                saving: true,

                error: null,

            })



            const response = await ThemeServices.updateProvinceTheme(

                payload

            )



            await get().fetchProvinceThemes(

                payload.access_token

            )



            set({

                saving: false,

            })


            return response



        } catch (error) {


            set({

                saving: false,

                error,

            })


            throw error

        }


    },






    // ==================================================
    // EVENT THEME
    // ==================================================



    fetchEventThemes: async (access_token) => {


        try {


            set({

                loadingEvent: true,

                error: null,

            })



            const response = await ThemeServices.fetchEventThemes({

                access_token

            })



            const list =

                response?.data ||

                response?.result ||

                response?.themes ||

                response ||

                []



            set({

                eventThemes:

                    Array.isArray(list)

                        ? list

                        : [],


                loadingEvent: false,

            })



            return response



        } catch (error) {


            set({

                loadingEvent: false,

                error,

            })


            throw error

        }


    },








    createEventTheme: async (payload) => {


        try {


            set({

                saving: true,

                error: null,

            })



            const response = await ThemeServices.createEventTheme(

                payload

            )



            await get().fetchEventThemes(

                payload.access_token

            )



            set({

                saving: false,

            })


            return response



        } catch (error) {


            set({

                saving: false,

                error,

            })


            throw error

        }


    },








    updateEventTheme: async (payload) => {


        try {


            set({

                saving: true,

                error: null,

            })



            const response = await ThemeServices.updateEventTheme(

                payload

            )



            await get().fetchEventThemes(

                payload.access_token

            )



            set({

                saving: false,

            })


            return response



        } catch (error) {


            set({

                saving: false,

                error,

            })


            throw error

        }


    },








    removeEventTheme: async (payload) => {


        try {


            set({

                saving: true,

                error: null,

            })



            const response = await ThemeServices.removeEventTheme(

                payload

            )



            await get().fetchEventThemes(

                payload.access_token

            )



            set({

                saving: false,

            })


            return response



        } catch (error) {


            set({

                saving: false,

                error,

            })


            throw error

        }


    },


}))