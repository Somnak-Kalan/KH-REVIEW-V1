import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import Swal from 'sweetalert2'
import { DeleteOutlined } from '@ant-design/icons'
import { useMomentStore } from '../../../../Stores/Post/Moment.store'

const DeletePostModal = ({
    open,
    setOpen,
    record,
    loading = false,
    title = 'Delete Post',
    access_token,
}) => {
    const [submitLoading, setSubmitLoading] = useState(false)
    const deleteMoment = useMomentStore((s) => s.deleteMoment)

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

    const handleSubmit = async () => {
        if (!record?._id) return

        const payload = {
            access_token,
            id: record?._id,
            status: 'delete',
            title: record?.title || '',
            type: record?.type || '',
            record,
        }

        try {
            setSubmitLoading(true)

            const res = await deleteMoment(payload)

            if (res) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Delete Post Successfully',
                    text: 'The post has been deleted successfully.',
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false,
                })

                setOpen(false)
            } else {
                throw new Error('No response from deleteMoment')
            }
        } catch (error) {
            console.error('Delete post failed:', error)

            await Swal.fire({
                icon: 'error',
                title: 'Delete Post Failed',
                text: error?.message || 'Failed to delete the post.',
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
                    <div className="w-[54px] h-[54px] rounded-full bg-[#FDECEC] flex items-center justify-center">
                        <DeleteOutlined className="text-[24px] text-[#FF3B30]" />
                    </div>
                </div>

                <h2 className="text-[20px] font-bold text-[#111827] mb-3">{title}</h2>

                <p className="text-[14px] leading-7 text-[#6B7280] mb-7">
                    Are you sure you want to delete this post?
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
                        loading={submitLoading}
                        onClick={handleSubmit}
                        className="!h-[48px] !rounded-full !border-0 !bg-[#FF3B30] !font-medium"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default DeletePostModal