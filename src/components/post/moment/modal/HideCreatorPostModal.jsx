import React, { useEffect, useMemo, useState, useContext } from 'react'

import { Modal, Button } from 'antd'
import Swal from 'sweetalert2'

import { useMomentStore } from '../../../../Stores/Post/Moment.store'
import { AuthContext } from '../../../../contexts/AuthContext'


const MOMENT_HIDE_REASONS = [
    {
        value: 'GUIDELINES',
        label: 'Violates community guidelines',
    },
    {
        value: 'SPAM',
        label: 'Spam or excessive promotion',
    },
    {
        value: 'MISLEADING',
        label: 'Misleading or false information',
    },
    {
        value: 'OFFENSIVE',
        label: 'Inappropriate or offensive content',
    },
    {
        value: 'IRRELEVANT',
        label: 'Irrelevant to the mentioned place',
    },
    {
        value: 'LOW_QUALITY',
        label: 'Low-quality or unclear content',
    },
    {
        value: 'DUPLICATE',
        label: 'Duplicate or repetitive content',
    },
    {
        value: 'ADVERTISING',
        label: 'Unauthorized advertising',
    },
]


const HideCreatorPostModal = ({
    open,
    setOpen,
    record,
    loading = false,
    title = 'Hide Creator Post',
    reasons = MOMENT_HIDE_REASONS,
}) => {


    const [selectedReason, setSelectedReason] = useState('')

    const [submitLoading, setSubmitLoading] = useState(false)


    const {
        hiddenMoment
    } = useMomentStore()


    const {
        access_token
    } = useContext(AuthContext)



    useEffect(() => {

        if (!open) {

            setSelectedReason('')

            return

        }


        const oldReason =
            record?.hideReason ||
            record?.warningReason ||
            record?.review?.rejectionReason ||
            ''


        if (Array.isArray(oldReason)) {

            setSelectedReason(oldReason || '')

        }
        else {

            setSelectedReason(oldReason)

        }


    }, [open, record])



    const reasonOptions = useMemo(() => {

        return Array.isArray(reasons)
            ? reasons
            : MOMENT_HIDE_REASONS

    }, [reasons])



    const isBusy =
        loading ||
        submitLoading



    const handleClose = () => {


        if (isBusy) return


        setOpen(false)

    }


    const handleToggleReason = (value) => {

        if (isBusy) return


        setSelectedReason(value)

    }



    const handleSubmit = async () => {
        if (
            !selectedReason ||
            !record?._id
        ) {
            return
        }


        const doc = {

            access_token,
            id: record._id,
            doc: {
                reason: selectedReason,
            }

        }



        try {


            setSubmitLoading(true)



            const res =
                await hiddenMoment(doc)



            if (res) {


                await Swal.fire({

                    icon: 'success',

                    title:
                        'Hide Creator Post Successfully',

                    text:
                        'The creator post has been hidden successfully.',

                    timer: 1800,

                    timerProgressBar: true,

                    showConfirmButton: false,

                })



                setOpen(false)


            }
            else {


                throw new Error(
                    'No response from hiddenMoment'
                )

            }


        }
        catch (error) {


            console.error(
                'Hide creator post failed:',
                error
            )


            await Swal.fire({

                icon: 'error',

                title:
                    'Hide Creator Post Failed',

                text:
                    error?.message ||
                    'Failed to hide the creator post.',

                timer: 1800,

                timerProgressBar: true,

                showConfirmButton: false,

            })


        }
        finally {


            setSubmitLoading(false)


        }


    }




    return (

        <Modal

            open={open}

            onCancel={handleClose}

            footer={null}

            width={600}

            centered

            destroyOnHidden

            maskClosable={!isBusy}

            closable={!isBusy}

        >


            <div className="px-1 pt-1">


                <h2 className="text-[18px] font-bold text-[#111827] mb-2">

                    {title}

                </h2>



                <p className="text-[14px] leading-6 text-[#9CA3AF] mb-4">

                    This post will be hidden from public view.
                    Select the reasons you want to send to the creator.

                </p>




                <div className="mb-3">


                    <p className="text-[15px] font-semibold text-[#1F3B64] mb-3">

                        Reason to hide/warning

                    </p>



                    <div className="flex flex-wrap gap-2">


                        {reasonOptions.map((item) => {


                            const active =
                                selectedReason === item.value

                            return (

                                <button


                                    key={item.value}


                                    type="button"


                                    disabled={isBusy}


                                    onClick={() =>
                                        handleToggleReason(
                                            item.value
                                        )
                                    }


                                    className={`

                                    px-3 py-[7px]
                                    rounded-full
                                    text-[13px]
                                    border
                                    transition-all
                                    flex items-center

                                    ${active
                                            ?
                                            'border-[#1677ff] text-[#1677ff] bg-[#EFF6FF]'
                                            :
                                            'border-[#E5E7EB] text-[#9CA3AF] bg-white hover:border-[#BFDBFE]'
                                        }


                                    ${isBusy
                                            ?
                                            'opacity-70 cursor-not-allowed'
                                            :
                                            'cursor-pointer'
                                        }

                                    `}

                                >


                                    <span>

                                        {item.label}

                                    </span>



                                    {
                                        active &&
                                        (

                                            <span

                                                className="ml-2 inline-flex items-center justify-center rounded-full"

                                                style={{

                                                    width: 14,

                                                    height: 14,

                                                    background: '#1677ff',

                                                    color: '#fff',

                                                    fontSize: 10,

                                                    lineHeight: 1,

                                                }}

                                            >

                                                ✓

                                            </span>

                                        )
                                    }


                                </button>

                            )

                        })}


                    </div>


                </div>





                <div className="mt-7 flex justify-end gap-2">


                    <Button

                        onClick={handleClose}

                        disabled={isBusy}

                    >

                        Cancel

                    </Button>




                    <Button


                        type="primary"


                        loading={submitLoading}


                        disabled={
                            !selectedReason
                        }

                        onClick={handleSubmit}


                    >

                        Hide Creator Post

                    </Button>



                </div>


            </div>


        </Modal>

    )

}


export default HideCreatorPostModal