import React, {
    useState,
} from 'react'


import {
    Modal,
    Button,
    message,
} from 'antd'


import {
    CheckCircleOutlined,
    CopyOutlined,
} from '@ant-design/icons'






export default function ResetSuccessModal({

    open,

    onClose,

    password = 'KH123',

    resetDate = '8/22/2026, 9:14:39 AM',

}) {



    const [
        copied,
        setCopied
    ] = useState(false)




    const handleCopy = async () => {


        await navigator.clipboard.writeText(
            password
        )


        setCopied(true)


        message.success(
            'Copied successfully'
        )


        setTimeout(() => {

            setCopied(false)

        }, 1500)


    }







    return (

        <Modal


            open={open}


            centered


            width={360}


            closable={true}


            footer={null}


            onCancel={onClose}



        >



            <div

                className="
          text-center
          py-2
        "

            >



                <CheckCircleOutlined

                    className="
            text-green-500
            text-5xl
          "

                />





                <div

                    className="
            mt-4
            text-sm
            font-semibold
            text-slate-900
          "

                >

                    Password reset successfully

                </div>





                <div

                    className="
            mt-2
            text-xs
            text-slate-400
          "

                >

                    The reset action is complete and has been recorded.

                </div>






                {/* Temporary Password */}

                <div

                    className="
            mt-4
            border
            border-green-200
            rounded-lg
            p-3
          "

                >



                    <div

                        className="
              text-[10px]
              uppercase
              text-green-600
              mb-2
            "

                    >

                        Temporary default password

                    </div>





                    <div

                        className="
              flex
              justify-center
              items-center
              gap-2
            "

                    >



                        <div

                            className="
                bg-green-50
                text-green-800
                font-semibold
                px-3
                py-1.5
                rounded-md
                text-sm
              "

                        >

                            {password}

                        </div>





                        <Button

                            size="small"

                            icon={
                                <CopyOutlined />
                            }


                            onClick={handleCopy}

                        >

                            {

                                copied

                                    ?

                                    'Copied'

                                    :

                                    'Copy'

                            }


                        </Button>



                    </div>



                </div>








                {/* Date */}

                <div

                    className="
            mt-3
            border
            border-slate-200
            rounded-lg
            px-3
            py-2
            flex
            justify-between
            text-xs
          "

                >


                    <span

                        className="
              text-slate-400
            "

                    >

                        Reset date & time

                    </span>




                    <span

                        className="
              text-slate-700
              font-medium
            "

                    >

                        {resetDate}

                    </span>



                </div>



                <div className='flex justify-end '>


                    <Button


                        type="primary"


                        className="
                        mt-4
                        bg-slate-950
                    "


                        onClick={onClose}


                    >

                        Done

                    </Button>
                </div>





            </div>




        </Modal>

    )

}