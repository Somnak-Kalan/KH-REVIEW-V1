import httpCommon from 'utils/http-common'





// ==================================================
// CLEAN PARAMS
// ==================================================

const cleanParams = (params = {}) => {


    const result = {}


    Object.entries(params).forEach(
        ([key, value]) => {


            if (
                value !== undefined &&
                value !== null &&
                value !== ''
            ) {

                result[key] = value

            }


        }
    )


    return result

}









// ==================================================
// GET USER DEVICES
// ==================================================

const fetchUserDevices = async (payload) => {


    try {


        const params = cleanParams({


            page:
                payload?.doc?.page || 1,


            size:
                payload?.doc?.size || 20,


            status:
                payload?.doc?.status,



        })






        const response =
            await httpCommon.get(


                `/app/users/${payload?.doc?.userId}/devices`,


                {


                    params,


                    headers: {


                        Authorization:
                            `Bearer ${payload.access_token}`


                    }


                }


            )






        return response.data



    }
    catch (error) {


        console.error(

            'Error fetching user devices:',
            error.response?.data ||
            error.message

        )


        throw error


    }


}











// ==================================================
// TERMINATE SINGLE DEVICE
// ==================================================
const terminateUserDevice = async (payload) => {


    try {


        const response =

            await httpCommon.delete(


                `/app/users/${payload?.doc?.userId}/devices/${payload?.doc?.deviceId}`,


                {


                    headers: {


                        Authorization:

                            `Bearer ${payload.access_token}`


                    }


                }


            )





        return response.data



    }
    catch (error) {


        console.error(

            'Error terminate device:',

            error.response?.data ||

            error.message

        )


        throw error


    }


}









// ==================================================
// TERMINATE ALL DEVICES
// ==================================================

const terminateAllUserDevices = async (payload) => {


    try {


        const response =
            await httpCommon.delete(


                `/app/users/${payload?.doc?.userId}/devices`,


                {


                    headers: {


                        Authorization:
                            `Bearer ${payload.access_token}`


                    }


                }


            )





        return response.data



    }
    catch (error) {


        console.error(

            'Error terminate all devices:',
            error.response?.data ||
            error.message

        )


        throw error


    }


}











// ==================================================
// RESET PASSWORD
// ==================================================

const resetUserPassword = async (payload) => {


    try {


        const response =
            await httpCommon.post(


                `/app/users/${payload?.doc?.userId}/reset-password`,


                {},


                {


                    headers: {


                        'Content-Type':
                            'application/json',



                        Authorization:
                            `Bearer ${payload.access_token}`


                    }


                }


            )





        return response.data



    }
    catch (error) {


        console.error(

            'Error reset password:',
            error.response?.data ||
            error.message

        )


        throw error


    }


}









const AccountSecurityServices = {


    fetchUserDevices,


    terminateUserDevice,


    terminateAllUserDevices,


    resetUserPassword,


}





export default AccountSecurityServices