
import { useEffect, useState } from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    message,
} from 'antd'

const getErrorMessage = (
    error,
    fallbackMessage
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallbackMessage
    )
}

const EditGroupKeywordModal = ({
    open,
    group,
    setGroupDetail,
    onSubmit,
    onCancel,
}) => {
    const [form] = Form.useForm()

    const [
        submitLoading,
        setSubmitLoading,
    ] = useState(false)

    useEffect(() => {
        if (!open || !group) return

        form.setFieldsValue({
            nameEn:
                group.nameEn ||
                '',

            nameKh:
                group.nameKh ||
                '',
        })
    }, [
        open,
        group,
        form,
    ])

    const handleClose = () => {
        if (submitLoading) return

        form.resetFields()

        onCancel?.()
    }

    const handleSave = async () => {
        try {
            const values =
                await form.validateFields()

            const updatedGroup = {
                ...(group || {}),

                nameEn:
                    values.nameEn
                        ?.trim(),

                nameKh:
                    values.nameKh
                        ?.trim(),
            }

            setSubmitLoading(
                true
            )

            /*
                Call API update only when an API handler
                exists. Do not throw an error when it is
                not provided from the detail hook.
            */
            if (
                typeof onSubmit ===
                'function'
            ) {
                await onSubmit(
                    updatedGroup
                )
            }

            /*
                Update the current detail header.
            */
            setGroupDetail?.(
                (prev) => ({
                    ...(prev ||
                        group),

                    nameEn:
                        updatedGroup.nameEn,

                    nameKh:
                        updatedGroup.nameKh,
                })
            )

            message.success(
                'Group keyword updated successfully'
            )

            form.resetFields()

            onCancel?.()
        } catch (error) {
            /*
                Ant Design validation error:
                do not show an additional message.
            */
            if (
                error?.errorFields
            ) {
                return
            }

            message.error(
                getErrorMessage(
                    error,
                    'Unable to update group keyword.'
                )
            )
        } finally {
            setSubmitLoading(
                false
            )
        }
    }

    return (
        <Modal
            open={open}
            title='Edit Group Keyword'
            onCancel={
                handleClose
            }
            footer={null}
            width={620}
            centered
            destroyOnHidden
            maskClosable={
                !submitLoading
            }
            closable={
                !submitLoading
            }
            className='edit-group-keyword-modal'
        >
            <div className='rounded-md border border-gray-100 p-6'>
                <Form
                    form={form}
                    layout='vertical'
                >
                    <Form.Item
                        label='Group Name (English)'
                        name='nameEn'
                        rules={[
                            {
                                required:
                                    true,

                                message:
                                    'Please enter group name English',
                            },
                        ]}
                    >
                        <Input placeholder='Enter group name English' />
                    </Form.Item>

                    <Form.Item
                        label='Group Name (Khmer)'
                        name='nameKh'
                        rules={[
                            {
                                required:
                                    true,

                                message:
                                    'Please enter group name Khmer',
                            },
                        ]}
                    >
                        <Input placeholder='Enter group name Khmer' />
                    </Form.Item>
                </Form>
            </div>

            <div className='mt-5 flex justify-end'>
                <Button
                    type='primary'
                    loading={
                        submitLoading
                    }
                    onClick={
                        handleSave
                    }
                    className='min-w-[120px]'
                >
                    save
                </Button>
            </div>

            <style>
                {`
                    .edit-group-keyword-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .edit-group-keyword-modal .ant-modal-header {
                        margin-bottom: 8px;
                    }

                    .edit-group-keyword-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .edit-group-keyword-modal .ant-modal-body {
                        padding-top: 0;
                    }

                    .edit-group-keyword-modal .ant-form-item-label > label {
                        font-size: 12px;
                        color: #374151;
                    }

                    .edit-group-keyword-modal .ant-form-item-label > label::before {
                        color: #ef4444 !important;
                    }

                    .edit-group-keyword-modal .ant-input {
                        border-radius: 6px;
                    }
                `}
            </style>
        </Modal>
    )
}

export default EditGroupKeywordModal