import React from 'react'

import {
    Modal,
    Button,
} from 'antd'



export default function ConfirmModal({

    open,

    title = 'Terminate device session?',

    description =
    'This signs the user out of the selected device immediately.',

    devices = [],

    confirmText = 'Terminate session',

    onCancel,

    onConfirm,

}) {


    return (

        <Modal


            open={open}


            centered


            width={360}


            closable={true}


            footer={null}


            onCancel={onCancel}


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

                    {title}

                </div>




                {/* Description */}

                <div

                    className="
                        mt-1
                        text-xs
                        text-slate-400
                    "

                >

                    {description}

                </div>





                {/* Device List */}

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

                                (device, index) => (

                                    <div

                                        key={index}

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

                                            {device.name}

                                        </div>



                                        <div

                                            className="
                                                mt-1
                                                text-[11px]
                                                text-slate-500
                                            "

                                        >

                                            {device.system}

                                            {' · '}

                                            {device.location}

                                        </div>



                                        <div

                                            className="
                                                text-[11px]
                                                text-slate-400
                                            "

                                        >

                                            Last active:
                                            {' '}
                                            {device.lastActive}

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
                        border-yellow-300
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

                        onClick={onCancel}

                    >

                        Cancel

                    </Button>




                    <Button

                        type="primary"

                        danger

                        onClick={onConfirm}

                    >

                        {confirmText}

                    </Button>



                </div>




            </div>


        </Modal>

    )

}