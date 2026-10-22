
import React, { useEffect, useState, useContext } from 'react'

import { Modal, Button } from 'antd'

import Swal from 'sweetalert2'

import { EyeOutlined } from '@ant-design/icons'

import { useMomentStore } from '../../../../Stores/Post/Moment.store'

import { AuthContext } from '../../../../contexts/AuthContext'

const ActivePostModal = ({

    open,

    setOpen,

    record,

    title = 'Active Post',

}) => {



    const [submitLoading, setSubmitLoading] = useState(false)



    const { activeMoment } = useMomentStore()
    const { access_token } = useContext(AuthContext)






    useEffect(() => {


        if (!open) {

            setSubmitLoading(false)

        }


    }, [open])






    const isBusy = submitLoading






    const handleClose = () => {


        if (isBusy) return


        setOpen(false)


    }

    const handleSubmit = async (e) => {


        e?.preventDefault?.()

        e?.stopPropagation?.()





        if (isBusy) return



        if (!record?._id) return




        const doc = {

            id: record._id,

            access_token,

            doc: {
                status: 'active',
                title: record?.title || '',
                type: record?.type || '',
                record,
            }

        }

        try {
            setSubmitLoading(true)
            const res = await activeMoment(doc)
            if (res) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Active Post Successfully',
                    text: 'The post has been activated successfully.',
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false,
                })
                setOpen(false)



            } else {



                throw new Error(

                    'No response from activeMoment'

                )



            }






        } catch (error) {



            console.error(

                'Active post failed:',

                error

            )






            await Swal.fire({



                icon: 'error',



                title: 'Active Post Failed',



                text:

                    error?.message ||

                    'Failed to active the post.',



                timer: 1800,



                timerProgressBar: true,



                showConfirmButton: false,



            })






        } finally {



            setSubmitLoading(false)



        }



    }








    return (


        <Modal



            open={open}



            onCancel={handleClose}



            footer={null}



            width={480}



            centered



            destroyOnHidden



            maskClosable={!isBusy}



            closable={!isBusy}



        >




            <div className="px-1 pt-1 pb-1 text-center">





                <div className="mb-4 flex justify-center">


                    <div className="w-[54px] h-[54px] rounded-full bg-[#EEF8E4] flex items-center justify-center">


                        <EyeOutlined

                            className="text-[24px] text-[#67C90C]"

                        />


                    </div>



                </div>







                <h2 className="text-[20px] font-bold text-[#111827] mb-3">


                    {title}


                </h2>







                <p className="text-[14px] leading-7 text-[#6B7280] mb-7">


                    Are you sure you want to active this post


                </p>







                <div className="grid grid-cols-2 gap-3">





                    <Button



                        onClick={handleClose}



                        disabled={isBusy}



                        className="!h-[48px] !rounded-full !border-0 !bg-[#E5E5E5] !text-[#111827] !font-medium"



                    >


                        Cancel


                    </Button>









                    <Button



                        type="primary"



                        htmlType="button"



                        loading={submitLoading}



                        disabled={isBusy}



                        onClick={handleSubmit}



                        className="!h-[48px] !rounded-full !border-0 !bg-[#67C90C] !font-medium"



                    >


                        Active


                    </Button>







                </div>





            </div>





        </Modal>



    )


}



export default ActivePostModal