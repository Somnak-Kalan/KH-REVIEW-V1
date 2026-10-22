import React from 'react'

import {
    SafetyOutlined,
} from '@ant-design/icons'



export default function SecurityHeader() {


    return (

        <div

            className="
        flex
        items-center
        gap-3
        mb-5
      "

        >

            <div

                className="
          w-8
          h-8
          rounded-lg
          bg-blue-50
          flex
          items-center
          justify-center
        "

            >

                <SafetyOutlined

                    className="
            text-blue-600
            text-base
          "

                />


            </div>




            <div>


                <div

                    className="
            text-sm
            font-semibold
            text-slate-900
          "

                >

                    Account Security

                </div>



                <div

                    className="
            text-xs
            text-slate-500
          "

                >

                    Manage sign-in security and help the user recover their account.

                </div>


            </div>


        </div>

    )

}