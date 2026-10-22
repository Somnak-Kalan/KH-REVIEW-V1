import React from 'react'

import {

    MobileOutlined,

} from '@ant-design/icons'







export default function DeviceCard({

    device,

    onTerminate,

}) {





    const isActive =

        String(
            device?.status || ''
        )
            .toLowerCase() === 'active'







    return (

        <div


            className="

                border

                border-slate-200

                rounded-xl

                px-4

                py-3

                flex

                items-center

                justify-between

                bg-white

            "


        >





            {/* LEFT */}


            <div


                className="

                    flex

                    items-center

                    gap-3

                "


            >






                {/* ICON */}


                <div


                    className={`

                        w-10

                        h-10

                        rounded-full

                        flex

                        items-center

                        justify-center


                        ${isActive

                            ?

                            'bg-blue-50'

                            :

                            'bg-slate-100'

                        }

                    `}


                >



                    <MobileOutlined



                        className={`

                            text-lg


                            ${isActive

                                ?

                                'text-blue-600'

                                :

                                'text-slate-400'

                            }


                        `}



                    />




                </div>









                {/* DEVICE INFO */}



                <div>





                    <div


                        className="

                            flex

                            items-center

                            gap-2

                        "


                    >



                        <span


                            className="

                                text-xs

                                font-semibold

                                text-slate-800

                            "


                        >



                            {

                                device?.deviceName || '-'

                            }



                        </span>








                        {

                            isActive &&



                            <span


                                className="

                                    text-[10px]

                                    px-2

                                    py-0.5

                                    rounded-full

                                    bg-green-100

                                    text-green-600

                                "


                            >


                                Last active device


                            </span>


                        }



                    </div>









                    <div


                        className="

                            mt-1

                            text-[11px]

                            text-slate-500

                        "


                    >



                        {

                            device?.os?.label || '-'

                        }


                        {' · '}


                        Mobile App



                    </div>









                    <div


                        className="

                            text-[10px]

                            text-slate-400

                            mt-1

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






            </div>












            {/* RIGHT */}





            <div


                className="

                    flex

                    flex-col

                    items-end

                    gap-2

                "


            >






                {/* STATUS */}



                <div


                    className="

                        text-right

                    "


                >




                    <div


                        className={`

                            text-xs

                            font-semibold


                            ${isActive

                                ?

                                'text-green-600'

                                :

                                'text-slate-500'

                            }


                        `}


                    >



                        {

                            isActive

                                ?

                                'Active'

                                :

                                'Recently active'


                        }



                    </div>





                </div>













                {/* TERMINATE BUTTON */}





                <button



                    onClick={() =>

                        onTerminate(device)

                    }




                    disabled={!isActive}





                    className="

                        border

                        border-red-200

                        text-red-500

                        rounded-lg

                        px-3

                        py-1

                        text-xs

                        hover:bg-red-50

                        disabled:opacity-40

                        disabled:cursor-not-allowed

                    "



                >



                    Terminate session



                </button>






            </div>







        </div>


    )

}