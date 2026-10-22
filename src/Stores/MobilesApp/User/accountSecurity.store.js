import {
    create
} from 'zustand'


import AccountSecurityServices
    from '../../../services/MobileApp/User/AccountSecurity'





const useAccountSecurityStore = create((set) => ({





    // ===============================
    // STATE
    // ===============================


    devices: [],


    loading: false,


    deleting: false,


    resetLoading: false,


    resetResult: null,


    error: null,






    // ===============================
    // GET USER DEVICES
    // ===============================


    fetchUserDevices: async (payload) => {


        try {


            set({

                loading: true,

                error: null,

            })




            const response =
                await AccountSecurityServices
                    .fetchUserDevices(payload)





            set({


                devices:
                    response?.data || [],


                loading: false,


            })




            return response



        }
        catch (error) {


            set({

                error:
                    error.message,


                loading: false,


            })



            throw error

        }


    },








    // ===============================
    // TERMINATE SINGLE DEVICE
    // ===============================

    terminateUserDevice: async (payload) => {


        try {


            set({

                deleting: true,

            })





            const response =

                await AccountSecurityServices
                    .terminateUserDevice(payload)









            set((state) => ({


                devices:


                    state.devices.map((item) => {


                        if (

                            item?._id ===
                            payload?.doc?.deviceId

                        ) {


                            return {


                                ...item,


                                status:
                                    'Terminated',



                                terminatedAt:
                                    new Date()
                                        .toISOString()


                            }


                        }



                        return item



                    }),




                deleting: false,


            }))







            return response



        }
        catch (error) {



            set({

                error:
                    error.message,


                deleting: false,


            })



            throw error



        }


    },

    // ===============================
    // TERMINATE ALL DEVICES
    // ===============================


    terminateAllUserDevices: async (payload) => {


        try {


            set({

                deleting: true,

            })





            const response =
                await AccountSecurityServices
                    .terminateAllUserDevices(payload)







            set((state) => ({


                devices:


                    state.devices.map((item) => ({


                        ...item,


                        status:
                            'Terminated',


                        terminatedAt:
                            new Date()
                                .toISOString(),


                    })),



                deleting: false,


            }))





            return response



        }
        catch (error) {


            set({

                error:
                    error.message,


                deleting: false,


            })


            throw error


        }


    },









    // ===============================
    // RESET PASSWORD
    // ===============================


    resetUserPassword: async (payload) => {


        try {


            set({

                resetLoading: true,

                error: null,

            })





            const response =
                await AccountSecurityServices
                    .resetUserPassword(payload)





            set({


                resetResult:
                    response,


                resetLoading: false,


            })




            return response



        }
        catch (error) {


            set({

                error:
                    error.message,


                resetLoading: false,


            })



            throw error


        }


    },









    // ===============================
    // CLEAR RESET RESULT
    // ===============================


    clearResetResult: () => {


        set({

            resetResult: null,

        })


    },







    // ===============================
    // CLEAR ERROR
    // ===============================


    clearError: () => {


        set({

            error: null,

        })


    }





}))





export default useAccountSecurityStore