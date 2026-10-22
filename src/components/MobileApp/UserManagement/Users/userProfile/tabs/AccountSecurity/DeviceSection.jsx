import React from 'react'

import DeviceCard from './DeviceCard'





export default function DeviceSection({

    devices = [],

    onTerminate,

}) {



    return (

        <div>



            {/* HEADER */}


            <div

                className="
                    flex
                    items-start
                    justify-between
                    mb-3
                "

            >



                <div>


                    <div

                        className="
                            text-sm
                            font-semibold
                            text-slate-800
                        "

                    >

                        Devices


                    </div>





                    <div

                        className="
                            text-xs
                            text-slate-500
                            mt-1
                        "

                    >

                        View the most recently active device.

                        Device sessions are read-only in this admin profile.


                    </div>



                </div>









                {/* TERMINATE ALL */}


                <button


                    onClick={() =>


                        onTerminate('all')


                    }



                    className="
                        border
                        border-red-200
                        text-red-500
                        rounded-lg
                        px-3
                        py-1.5
                        text-xs
                        hover:bg-red-50
                    "


                >

                    Terminate all session


                </button>





            </div>









            {/* DEVICE LIST */}



            <div

                className="
                    space-y-2
                "

            >



                {


                    Array.isArray(devices)

                        &&

                        devices.length > 0



                        ?



                        devices.map(


                            (device) => (


                                <DeviceCard



                                    key={device?._id}



                                    device={device}



                                    onTerminate={onTerminate}



                                />


                            )


                        )



                        :



                        <div

                            className="
                            text-xs
                            text-slate-400
                            text-center
                            py-5
                        "

                        >

                            No device found


                        </div>



                }



            </div>









            {/* FOOTER NOTE */}



            <div

                className="
                    mt-4
                    text-[11px]
                    text-slate-400
                "

            >

                For security, admins cannot view or set a user's password.

                Every reset request is recorded in the account audit log.


            </div>





        </div>


    )

}