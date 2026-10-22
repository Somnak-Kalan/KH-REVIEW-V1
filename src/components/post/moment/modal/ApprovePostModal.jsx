
import React, { useEffect, useState, useContext } from 'react'

import { Modal, Button } from 'antd'

import Swal from 'sweetalert2'

import { FileDoneOutlined } from '@ant-design/icons'

import { useMomentStore } from '../../../../Stores/Post/Moment.store'
import { AuthContext } from '../../../../contexts/AuthContext'


const ApprovePostModal = ({

    open,

    setOpen,

    record,

    loading = false,

    title = 'Approve Post',

}) => {



    const [submitLoading, setSubmitLoading] = useState(false)



    const { approveMoment } = useMomentStore()


    const { access_token } = useContext(AuthContext)



    useEffect(() => {


        if (!open) {

            setSubmitLoading(false)

        }


    }, [open])







    const isBusy = loading || submitLoading






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

            access_token,
            id: record._id,


            status: 'approved',


            title: record?.title || '',


            type: record?.type || '',


            record,


        }







        try {



            setSubmitLoading(true)







            const res = await approveMoment(doc)








            if (res) {



                await Swal.fire({



                    icon: 'success',



                    title: 'Approve Post Successfully',



                    text: 'The post has been approved successfully.',



                    timer: 1800,



                    timerProgressBar: true,



                    showConfirmButton: false,



                })







                setOpen(false)







            } else {



                throw new Error(

                    'No response from approveMoment'

                )



            }






        } catch (error) {



            console.error(

                'Approve post failed:',

                error

            )







            await Swal.fire({



                icon: 'error',



                title: 'Approve Post Failed',



                text:

                    error?.message ||

                    'Failed to approve the post.',



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


                    <div className="w-[54px] h-[54px] rounded-full bg-[#EAF4FF] flex items-center justify-center">



                        <FileDoneOutlined

                            className="text-[24px] text-[#1677ff]"

                        />



                    </div>


                </div>







                <h2 className="text-[20px] font-bold text-[#111827] mb-3">


                    {title}


                </h2>







                <p className="text-[14px] leading-7 text-[#6B7280] mb-7">


                    Are you sure you want to approve this post


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



                        className="!h-[48px] !rounded-full !border-0 !bg-[#1683F7] !font-medium"



                    >


                        Approve


                    </Button>







                </div>






            </div>





        </Modal>



    )


}



export default ApprovePostModal