import React from 'react'

import {
    CheckCircleOutlined,
} from '@ant-design/icons'



export default function SecurityAlert() {

    return (

        <div

            className="
        border
        border-green-200
        bg-green-50
        rounded-lg
        px-3
        py-2
        mb-5
        flex
        items-start
        gap-2
      "

        >


            <CheckCircleOutlined

                className="
          text-green-600
          mt-0.5
        "

            />



            <div>


                <div

                    className="
            text-xs
            font-medium
            text-green-700
          "

                >

                    Password reset action completed

                </div>



                <div

                    className="
            text-[11px]
            text-green-600
            mt-0.5
          "

                >

                    Password reset to the protected system default on 8/22/2026, 9:04:59 AM.

                </div>



            </div>



        </div>

    )

}