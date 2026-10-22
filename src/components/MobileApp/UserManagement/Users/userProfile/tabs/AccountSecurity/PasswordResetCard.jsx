import React from 'react'

import {
    KeyOutlined,
} from '@ant-design/icons'



export default function PasswordResetCard({

    onReset,

}) {


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
        mb-5
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

                    Password reset

                </div>



                <div

                    className="
            text-xs
            text-slate-500
            mt-1
          "

                >

                    Reset the account to the protected system default password.
                    The user must change it at their next sign-in.

                </div>


            </div>





            <button


                onClick={onReset}


                className="
          bg-slate-950
          text-white
          rounded-lg
          px-4
          py-2
          text-xs
          flex
          items-center
          gap-2
          hover:bg-slate-800
          transition
        "


            >


                <KeyOutlined />


                Reset password


            </button>



        </div>


    )


}