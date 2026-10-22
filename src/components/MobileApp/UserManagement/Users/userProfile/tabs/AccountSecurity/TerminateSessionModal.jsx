import React from 'react'

import {
    Modal,
    Button,
} from 'antd'





export default function TerminateSessionModal({

    open,

    onClose,

    onConfirm,

    device,

    devices = [],

}) {



    return (

        <Modal


            open={open}


            centered


            width={360}


            closable={true}


            footer={null}


            onCancel={onClose}



        >



            <div>



                {/* Title */}

                <div

                    className="
                        text-sm
                        font-semibold
                        text-slate-900
                    "

                >

                    Terminate device session?

                </div>







                <div

                    className="
                        mt-1
                        text-xs
                        text-slate-400
                    "

                >

                    This signs the user out of the selected device immediately.

                </div>








                {/* Device card */}

                {


                    device &&


                    <div

                        className="
                            mt-4
                            border
                            border-slate-200
                            rounded-lg
                            bg-slate-50
                            px-3
                            py-2
                        "

                    >



                        <div

                            className="
                                text-xs
                                font-medium
                                text-slate-800
                            "

                        >

                            {
                                device?.deviceName || '-'
                            }


                        </div>







                        <div

                            className="
                                text-[11px]
                                text-slate-500
                                mt-1
                            "

                        >


                            {
                                device?.os?.label || '-'
                            }


                            {' · '}


                            {
                                device?.location?.label ||
                                'Unknown location'
                            }


                        </div>







                        <div

                            className="
                                text-[11px]
                                text-slate-500
                            "

                        >

                            Last active:


                            {' '}


                            {


                                device?.lastActiveAt

                                    ?


                                    new Date(
                                        device.lastActiveAt
                                    )
                                        .toLocaleString()


                                    :


                                    '-'


                            }



                        </div>



                    </div>



                }












                {/* Multiple devices for terminate all */}

                {


                    devices?.length > 0 &&


                    <div

                        className="
                            mt-4
                            space-y-2
                        "

                    >


                        {


                            devices.map(

                                (item) => (


                                    <div

                                        key={
                                            item?._id
                                        }


                                        className="
                                            border
                                            border-slate-200
                                            rounded-lg
                                            bg-slate-50
                                            px-3
                                            py-2
                                        "

                                    >



                                        <div

                                            className="
                                                text-xs
                                                font-medium
                                                text-slate-800
                                            "

                                        >

                                            {
                                                item?.deviceName || '-'
                                            }


                                        </div>






                                        <div

                                            className="
                                                text-[11px]
                                                text-slate-500
                                                mt-1
                                            "

                                        >

                                            {
                                                item?.os?.label || '-'
                                            }


                                            {' · '}


                                            {
                                                item?.location?.label ||
                                                'Unknown location'
                                            }


                                        </div>







                                        <div

                                            className="
                                                text-[11px]
                                                text-slate-500
                                            "

                                        >

                                            Last active:


                                            {' '}


                                            {


                                                item?.lastActiveAt

                                                    ?


                                                    new Date(
                                                        item.lastActiveAt
                                                    )
                                                        .toLocaleString()


                                                    :


                                                    '-'

                                            }



                                        </div>




                                    </div>


                                )

                            )


                        }


                    </div>



                }











                {/* Warning */}

                <div

                    className="
                        mt-3
                        border
                        border-yellow-200
                        bg-yellow-50
                        rounded-lg
                        px-3
                        py-2
                    "

                >



                    <div

                        className="
                            text-xs
                            text-yellow-700
                        "

                    >

                        The user will need to sign in again on this device.

                        This action is recorded in the account audit log.


                    </div>



                </div>













                {/* Footer */}

                <div

                    className="
                        flex
                        justify-end
                        gap-2
                        mt-4
                    "

                >



                    <Button

                        onClick={onClose}

                    >

                        Cancel

                    </Button>









                    <Button


                        type="primary"


                        danger


                        onClick={onConfirm}


                    >

                        Terminate session


                    </Button>





                </div>





            </div>





        </Modal>



    )

}