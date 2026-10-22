import { useMemo } from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    message,
} from 'antd'

import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

const normalize = (value) => {
    return String(value || '').trim().toLowerCase()
}

const getErrorMessage = (error, fallbackMessage) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallbackMessage
    )
}

const AddKeywordGroupModal = ({
    open,
    onCancel,
    groups = [],
    access_token = '',
}) => {
    const [form] = Form.useForm()

    const {
        creating,
        createKeywordGroup,
    } = useKeywordGroupStore()

    const watchedNameEn =
        Form.useWatch('nameEn', form)

    const duplicateGroup = useMemo(() => {
        const value = normalize(watchedNameEn)

        if (!value) return null

        return groups.find((item) => {
            return normalize(item.nameEn) === value
        })
    }, [watchedNameEn, groups])

    const handleClose = () => {
        form.resetFields()

        onCancel?.()
    }

    const handleSave = async () => {
        try {
            const values =
                await form.validateFields()

            const foundDuplicate =
                groups.find((item) => {
                    return (
                        normalize(item.nameEn) ===
                        normalize(values.nameEn)
                    )
                })

            if (foundDuplicate) {
                form.setFields([
                    {
                        name: 'nameEn',
                        errors: [
                            `"${values.nameEn}" already exists`,
                        ],
                    },
                ])

                return
            }

            /*
                API:
                POST /core/setup/keyword-group/create
            */
            await createKeywordGroup({
                access_token,
                nameEn: values.nameEn,
                nameKh: values.nameKh,
            })

            message.success(
                `"${values.nameEn?.trim()}" created successfully`
            )

            /*
                Submit and close logic stay inside this file.
            */
            handleClose()
        } catch (error) {
            /*
                Ant Design form-validation errors already appear
                below the related input fields.
            */
            if (error?.errorFields) return

            message.error(
                getErrorMessage(
                    error,
                    'Unable to create keyword group.'
                )
            )
        }
    }

    return (
        <Modal
            open={open}
            title='Add Group Keyword'
            onCancel={handleClose}
            footer={null}
            width={620}
            centered
            destroyOnHidden
            className='add-keyword-group-modal'
        >
            <Form
                form={form}
                layout='vertical'
                className='mt-4'
            >
                <Form.Item
                    label='Group Name (English)'
                    name='nameEn'
                    required
                    validateStatus={
                        duplicateGroup
                            ? 'error'
                            : undefined
                    }
                    help={
                        duplicateGroup
                            ? `"${watchedNameEn}" already exists`
                            : undefined
                    }
                    rules={[
                        {
                            required: true,
                            message:
                                'Please enter group name in English',
                        },
                    ]}
                >
                    <Input placeholder='e.g. Nature' />
                </Form.Item>

                <Form.Item
                    label='Group Name (Khmer)'
                    name='nameKh'
                    required
                    rules={[
                        {
                            required: true,
                            message:
                                'Please enter group name in Khmer',
                        },
                    ]}
                >
                    <Input placeholder='e.g. ធម្មជាតិ' />
                </Form.Item>

                <div className='flex justify-end'>
                    <Button
                        type='primary'
                        loading={creating}
                        disabled={creating}
                        onClick={handleSave}
                        className='min-w-[120px]'
                    >
                        save
                    </Button>
                </div>
            </Form>

            <style>
                {`
                    .add-keyword-group-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .add-keyword-group-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .add-keyword-group-modal .ant-form-item-label > label {
                        font-size: 12px;
                        color: #374151;
                    }

                    .add-keyword-group-modal .ant-form-item-label > label::before {
                        color: #ef4444 !important;
                    }

                    .add-keyword-group-modal .ant-input {
                        border-radius: 6px;
                    }
                `}
            </style>
        </Modal>
    )
}

export default AddKeywordGroupModal