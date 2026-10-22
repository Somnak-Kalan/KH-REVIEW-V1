import React, {

    useState,

    useEffect,

} from 'react'



import SecurityHeader from './SecurityHeader'

import PasswordResetCard from './PasswordResetCard'

import SecurityAlert from './SecurityAlert'

import DeviceSection from './DeviceSection'



import ConfirmModal from './ConfirmModal'

import ResetSuccessModal from './ResetSuccessModal'

import TerminateSessionModal from './TerminateSessionModal'


import Swal from 'sweetalert2'
import useAccountSecurityStore

    from '../../../../../../../Stores/MobilesApp/User/accountSecurity.store'







export default function AccountActivities({

    userId,

    access_token,

}) {



    const {

        devices,

        deleting,

        fetchUserDevices,

        terminateUserDevice,

        terminateAllUserDevices,

    } = useAccountSecurityStore()







    // ==================================================
    // GET DEVICES
    // ==================================================


    useEffect(() => {


        if (
            !userId ||
            !access_token
        ) return





        fetchUserDevices({


            access_token,


            doc: {


                userId,


                status: 'all',


                page: 1,


                size: 20,


            }


        })



    }, [

        userId,

        access_token

    ])











    const [

        showResetConfirm,

        setShowResetConfirm

    ] = useState(false)









    const [

        showSuccess,

        setShowSuccess

    ] = useState(false)









    const [

        showTerminate,

        setShowTerminate

    ] = useState(false)









    const [

        selectedDevice,

        setSelectedDevice

    ] = useState(null)







    const [

        selectedDevices,

        setSelectedDevices

    ] = useState([])













    // ==================================================
    // RESET PASSWORD
    // ==================================================


    const handleReset = () => {


        setShowResetConfirm(false)

        setShowSuccess(true)


    }













    // ==================================================
    // OPEN TERMINATE MODAL
    // ==================================================


    const handleTerminate = (device) => {



        if (device === 'all') {


            setSelectedDevice(null)


            setSelectedDevices(

                devices

            )


        }
        else {


            setSelectedDevices([])


            setSelectedDevice(

                device

            )


        }



        setShowTerminate(true)


    }
    const handleConfirmTerminate = async () => {


        try {


            if (

                selectedDevices.length > 0

            ) {


                await terminateAllUserDevices({

                    access_token,

                    doc: {

                        userId

                    }

                })


            }
            else {


                await terminateUserDevice({

                    access_token,

                    doc: {

                        userId,

                        deviceId:
                            selectedDevice?._id

                    }

                })


            }





            setShowTerminate(false)

            setSelectedDevice(null)

            setSelectedDevices([])






            Swal.fire({

                icon: 'success',

                title: 'Successful',

                text: 'Device session terminated successfully.',

                timer: 1500,

                showConfirmButton: false,

            })





        }
        catch (error) {


            console.log(error)



            Swal.fire({

                icon: 'error',

                title: 'Failed',

                text: 'Unable to terminate device session.'

            })


        }


    }

    return (

        <div


            className="

                w-full

                bg-white

                rounded-2xl

                overflow-hidden

                p-5

            "



        >









            <SecurityHeader />









            <PasswordResetCard


                onReset={() =>

                    setShowResetConfirm(true)

                }


            />









            <SecurityAlert />









            <DeviceSection


                devices={devices}


                onTerminate={handleTerminate}


            />









            {/* RESET PASSWORD MODAL */}


            <ConfirmModal



                open={showResetConfirm}



                title="Reset to default password"



                description="

                    This will replace the current password with the protected system default password.

                "



                confirmText="Reset to default"



                danger



                onCancel={() =>


                    setShowResetConfirm(false)


                }



                onConfirm={handleReset}



            />














            <ResetSuccessModal



                open={showSuccess}



                onClose={() =>


                    setShowSuccess(false)


                }



            />













            {/* TERMINATE DEVICE MODAL */}


            <TerminateSessionModal



                open={showTerminate}



                device={selectedDevice}



                devices={selectedDevices}



                onClose={() => {


                    setShowTerminate(false)


                    setSelectedDevice(null)


                    setSelectedDevices([])


                }}



                onConfirm={handleConfirmTerminate}



            />









        </div>

    )

}