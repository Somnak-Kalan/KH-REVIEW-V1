// import {
//     useEffect,
//     useMemo,
// } from 'react'
// import {
//     Button,
//     Form,
//     Input,
//     Modal,
//     message,
// } from 'antd'

// import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

// const normalize = (value) => {
//     return String(value || '').trim().toLowerCase()
// }

// const getErrorMessage = (error, fallbackMessage) => {
//     return (
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error?.message ||
//         fallbackMessage
//     )
// }

// const EditKeywordGroupModal = ({
//     open,
//     record,
//     onCancel,
//     groups = [],
//     access_token = '',
// }) => {
//     const [form] = Form.useForm()

//     const {
//         updating,
//         updateKeywordGroup,
//     } = useKeywordGroupStore()

//     const watchedNameEn =
//         Form.useWatch('nameEn', form)

//     useEffect(() => {
//         if (!open) return

//         if (record) {
//             form.setFieldsValue({
//                 nameEn: record.nameEn || '',
//                 nameKh: record.nameKh || '',
//             })
//         }
//     }, [
//         open,
//         record,
//         form,
//     ])

//     const duplicateGroup = useMemo(() => {
//         const value = normalize(watchedNameEn)

//         if (!value) return null

//         return groups.find((item) => {
//             return (
//                 item._id !== record?._id &&
//                 normalize(item.nameEn) === value
//             )
//         })
//     }, [
//         watchedNameEn,
//         groups,
//         record,
//     ])

//     const handleClose = () => {
//         form.resetFields()

//         onCancel?.()
//     }

//     const handleSave = async () => {
//         try {
//             const values =
//                 await form.validateFields()

//             const foundDuplicate =
//                 groups.find((item) => {
//                     return (
//                         item._id !== record?._id &&
//                         normalize(item.nameEn) ===
//                         normalize(values.nameEn)
//                     )
//                 })

//             if (foundDuplicate) {
//                 form.setFields([
//                     {
//                         name: 'nameEn',
//                         errors: [
//                             `"${values.nameEn}" already exists`,
//                         ],
//                     },
//                 ])

//                 return
//             }

//             /*
//                 API:
//                 PUT /core/setup/keyword-group/update
//             */
//             await updateKeywordGroup({
//                 access_token,
//                 _id: record?._id,
//                 nameEn: values.nameEn,
//                 nameKh: values.nameKh,
//             })

//             message.success(
//                 `"${values.nameEn?.trim()}" updated successfully`
//             )

//             /*
//                 Submit and close logic stay inside this file.
//             */
//             handleClose()
//         } catch (error) {
//             /*
//                 Ant Design form-validation errors already appear
//                 below the related input fields.
//             */
//             if (error?.errorFields) return

//             message.error(
//                 getErrorMessage(
//                     error,
//                     'Unable to update keyword group.'
//                 )
//             )
//         }
//     }

//     return (
//         <Modal
//             open={open}
//             title='Edit Group Keyword'
//             onCancel={handleClose}
//             footer={null}
//             width={620}
//             centered
//             destroyOnHidden
//             className='edit-keyword-group-modal'
//         >
//             <Form
//                 form={form}
//                 layout='vertical'
//                 className='mt-4'
//             >
//                 <Form.Item
//                     label='Group Name (English)'
//                     name='nameEn'
//                     required
//                     validateStatus={
//                         duplicateGroup
//                             ? 'error'
//                             : undefined
//                     }
//                     help={
//                         duplicateGroup
//                             ? `"${watchedNameEn}" already exists`
//                             : undefined
//                     }
//                     rules={[
//                         {
//                             required: true,
//                             message:
//                                 'Please enter group name in English',
//                         },
//                     ]}
//                 >
//                     <Input placeholder='e.g. Nature' />
//                 </Form.Item>

//                 <Form.Item
//                     label='Group Name (Khmer)'
//                     name='nameKh'
//                     required
//                     rules={[
//                         {
//                             required: true,
//                             message:
//                                 'Please enter group name in Khmer',
//                         },
//                     ]}
//                 >
//                     <Input placeholder='e.g. ធម្មជាតិ' />
//                 </Form.Item>

//                 <div className='flex justify-end'>
//                     <Button
//                         type='primary'
//                         loading={updating}
//                         disabled={updating}
//                         onClick={handleSave}
//                         className='min-w-[120px]'
//                     >
//                         save
//                     </Button>
//                 </div>
//             </Form>

//             <style>
//                 {`
//                     .edit-keyword-group-modal .ant-modal-content {
//                         border-radius: 8px;
//                         overflow: hidden;
//                     }

//                     .edit-keyword-group-modal .ant-modal-title {
//                         font-size: 14px;
//                         font-weight: 700;
//                         color: #111827;
//                     }

//                     .edit-keyword-group-modal .ant-form-item-label > label {
//                         font-size: 12px;
//                         color: #374151;
//                     }

//                     .edit-keyword-group-modal .ant-form-item-label > label::before {
//                         color: #ef4444 !important;
//                     }

//                     .edit-keyword-group-modal .ant-input {
//                         border-radius: 6px;
//                     }
//                 `}
//             </style>
//         </Modal>
//     )
// }

// export default EditKeywordGroupModal
import {
    useEffect,
    useMemo,
} from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    message,
} from 'antd'

import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

const normalize = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
}

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

const EditKeywordGroupModal = ({
    open,
    record,
    onCancel,
    onSuccess,
    groups = [],
    access_token = '',
}) => {
    const [form] = Form.useForm()

    const {
        updating,
        updateKeywordGroup,
    } = useKeywordGroupStore()

    const watchedNameEn =
        Form.useWatch(
            'nameEn',
            form
        )

    useEffect(() => {
        if (
            !open ||
            !record
        ) {
            return
        }

        form.setFieldsValue({
            nameEn:
                record.nameEn ||
                '',

            nameKh:
                record.nameKh ||
                '',
        })
    }, [
        open,
        record,
        form,
    ])

    const duplicateGroup =
        useMemo(() => {
            const value =
                normalize(
                    watchedNameEn
                )

            if (!value) {
                return null
            }

            return groups.find(
                (item) => {
                    return (
                        item._id !==
                        record?._id &&
                        normalize(
                            item.nameEn
                        ) === value
                    )
                }
            )
        }, [
            watchedNameEn,
            groups,
            record,
        ])

    const handleClose = () => {
        form.resetFields()

        onCancel?.()
    }

    const handleSave = async () => {
        try {
            const values =
                await form.validateFields()

            if (!record?._id) {
                message.error(
                    'Keyword group ID is required.'
                )

                return
            }

            const foundDuplicate =
                groups.find(
                    (item) => {
                        return (
                            item._id !==
                            record._id &&
                            normalize(
                                item.nameEn
                            ) ===
                            normalize(
                                values.nameEn
                            )
                        )
                    }
                )

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

            const updatedGroup = {
                ...record,

                nameEn:
                    values.nameEn
                        ?.trim(),

                nameKh:
                    values.nameKh
                        ?.trim(),
            }

            /*
                API:
                PUT /core/setup/keyword-group/update
            */
            await updateKeywordGroup({
                access_token,

                _id:
                    record._id,

                nameEn:
                    updatedGroup.nameEn,

                nameKh:
                    updatedGroup.nameKh,
            })

            /*
                Update the detail header immediately
                after API success.
            */
            onSuccess?.(
                updatedGroup
            )

            message.success(
                `"${updatedGroup.nameEn}" updated successfully`
            )

            handleClose()
        } catch (error) {
            if (
                error?.errorFields
            ) {
                return
            }

            message.error(
                getErrorMessage(
                    error,
                    'Unable to update keyword group.'
                )
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
            className='edit-keyword-group-modal'
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
                            required:
                                true,

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
                            required:
                                true,

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
                        loading={
                            updating
                        }
                        disabled={
                            updating
                        }
                        onClick={
                            handleSave
                        }
                        className='min-w-[120px]'
                    >
                        save
                    </Button>
                </div>
            </Form>

            <style>
                {`
                    .edit-keyword-group-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .edit-keyword-group-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .edit-keyword-group-modal .ant-form-item-label > label {
                        font-size: 12px;
                        color: #374151;
                    }

                    .edit-keyword-group-modal .ant-form-item-label > label::before {
                        color: #ef4444 !important;
                    }

                    .edit-keyword-group-modal .ant-input {
                        border-radius: 6px;
                    }
                `}
            </style>
        </Modal>
    )
}

export default EditKeywordGroupModal