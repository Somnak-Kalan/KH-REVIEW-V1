import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    Select,
    message,
} from 'antd'

import useKeywordStore from '../../../../Stores/settings/setups/keyword.store'
import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

import KeywordCheckField, {
    findDuplicateKeyword,
    isDuplicateResponse,
    normalizeKeywordValue,
} from '../../../../validation/setting/setup/keyword/KeywordCheckField'

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

const getRecordGroupId = ({
    record,
    currentGroup,
}) => {
    if (
        record?.groupId
    ) {
        return record.groupId
    }

    if (
        record?.groupInfo?._id
    ) {
        return record
            .groupInfo
            ._id
    }

    if (
        record?.group?._id
    ) {
        return record
            .group
            ._id
    }

    if (
        currentGroup?._id
    ) {
        return currentGroup
            ._id
    }

    /*
        Keep compatibility with your
        current local mock data.
    */
    if (
        typeof record?.group ===
        'string'
    ) {
        return (
            record.group ||
            undefined
        )
    }

    return undefined
}

const EditKeywordModal = ({
    open,
    record,
    onCancel,
    keywords = [],
    currentGroup,
    groups = [],
    groupOptions = [],
    access_token = '',
}) => {
    const [form] =
        Form.useForm()

    const [
        keywordEn,
        setKeywordEn,
    ] = useState('')

    const {
        checking,
        updating,
        checkKeyword,
        updateKeyword,
    } = useKeywordStore()

    /*
        Load keyword groups directly from API.

        Each dropdown option uses:
        value = keyword-group _id
        label = keyword-group name
    */
    const {
        groups:
        keywordGroups,

        loading:
        keywordGroupsLoading,

        fetchKeywordGroups,
    } = useKeywordGroupStore()

    const submitting =
        checking ||
        updating

    useEffect(() => {
        if (
            !open ||
            !access_token
        ) {
            return
        }

        fetchKeywordGroups({
            access_token,

            page:
                1,

            limit:
                1000,

            search:
                '',
        }).catch((error) => {
            message.error(
                getErrorMessage(
                    error,
                    'Unable to load keyword groups.'
                )
            )
        })
    }, [
        open,
        access_token,
        fetchKeywordGroups,
    ])

    const selectableGroups =
        useMemo(() => {
            if (
                keywordGroups.length >
                0
            ) {
                return keywordGroups
            }

            return groups
        }, [
            keywordGroups,
            groups,
        ])

    const keywordGroupOptions =
        useMemo(() => {
            const apiOptions =
                keywordGroups
                    .filter((item) => {
                        return Boolean(
                            item?._id
                        )
                    })
                    .map((item) => {
                        return {
                            value:
                                item._id,

                            label:
                                item.nameEn ||
                                item.nameKh ||
                                item._id,
                        }
                    })

            /*
                Keep compatibility with your
                current parent component.
            */
            if (
                apiOptions.length >
                0
            ) {
                return apiOptions
            }

            return groupOptions
        }, [
            keywordGroups,
            groupOptions,
        ])

    useEffect(() => {
        if (!open) {
            return
        }

        if (record) {
            form.setFieldsValue({
                nameEn:
                    record.nameEn ||
                    '',

                nameKh:
                    record.nameKh ||
                    '',

                group:
                    getRecordGroupId({
                        record,

                        currentGroup,
                    }),
            })

            setKeywordEn(
                record.nameEn ||
                ''
            )
        }
    }, [
        open,
        record,
        currentGroup,
        form,
    ])

    const handleClose = () => {
        form.resetFields()

        setKeywordEn(
            ''
        )

        onCancel?.()
    }

    const handleSave = async () => {
        try {
            const values =
                await form
                    .validateFields()

            const foundDuplicate =
                findDuplicateKeyword({
                    keywords,

                    nameEn:
                        values.nameEn,

                    /*
                        Do not detect the current edited
                        record as its own duplicate.
                    */
                    excludeKeywordId:
                        record?._id,
                })

            /*
                Check currently loaded English
                keywords first.
            */
            if (
                foundDuplicate
            ) {
                form.setFields([
                    {
                        name:
                            'nameEn',

                        errors: [
                            `"${values.nameEn}" already exists in this group`,
                        ],
                    },
                ])

                return
            }

            /*
                Check currently loaded Khmer
                keywords first.
            */
            const foundDuplicateKh =
                findDuplicateKeyword({
                    keywords,

                    value:
                        values.nameKh,

                    fieldName:
                        'nameKh',

                    language:
                        'kh',

                    /*
                        Do not detect the current edited
                        record as its own duplicate.
                    */
                    excludeKeywordId:
                        record?._id,
                })

            if (
                foundDuplicateKh
            ) {
                form.setFields([
                    {
                        name:
                            'nameKh',

                        errors: [
                            `"${values.nameKh}" already exists in this group`,
                        ],
                    },
                ])

                return
            }

            const hasNameChanged =
                normalizeKeywordValue(
                    values.nameEn
                ) !==
                normalizeKeywordValue(
                    record?.nameEn
                ) ||
                normalizeKeywordValue(
                    values.nameKh
                ) !==
                normalizeKeywordValue(
                    record?.nameKh
                )

            /*
                Do not call duplicate API when only
                the selected group changes.
            */
            if (
                hasNameChanged
            ) {
                const checkResponse =
                    await checkKeyword({
                        access_token,

                        nameEn:
                            values.nameEn,

                        nameKh:
                            values.nameKh,
                    })

                if (
                    isDuplicateResponse(
                        checkResponse
                    )
                ) {
                    form.setFields([
                        {
                            name:
                                'nameEn',

                            errors: [
                                `"${values.nameEn}" already exists`,
                            ],
                        },
                    ])

                    return
                }
            }

            /*
                The selected dropdown value is
                the keyword-group _id.

                Send null when the user clears
                the selected group.
            */
            const selectedGroupId =
                values.group ||
                null

            /*
                API:
                PUT /core/setup/keyword/update

                Send selected group ID:
                groupId: selectedGroupId
            */
            await updateKeyword({
                access_token,

                _id:
                    record?._id,

                nameEn:
                    values.nameEn,

                nameKh:
                    values.nameKh,

                groupId:
                    selectedGroupId,
            })

            const selectedGroup =
                selectableGroups.find(
                    (item) => {
                        return (
                            item._id ===
                            selectedGroupId
                        )
                    }
                )

            const previousGroupId =
                getRecordGroupId({
                    record,

                    currentGroup,
                })

            if (
                selectedGroupId &&
                selectedGroupId !==
                previousGroupId
            ) {
                message.success(
                    `"${values.nameEn?.trim()}" updated and moved to ${selectedGroup?.nameEn || 'selected group'}`
                )
            } else if (
                !selectedGroupId
            ) {
                message.success(
                    `"${values.nameEn?.trim()}" updated and moved to Ungrouped`
                )
            } else {
                message.success(
                    `"${values.nameEn?.trim()}" updated successfully`
                )
            }

            form.resetFields()

            setKeywordEn(
                ''
            )

            onCancel?.()
        } catch (error) {
            /*
                Form validation errors already appear
                below the related input.
            */
            if (
                error?.errorFields
            ) {
                return
            }

            message.error(
                getErrorMessage(
                    error,
                    'Unable to update keyword.'
                )
            )
        }
    }

    return (
        <Modal
            open={open}
            title='Edit Keyword'
            onCancel={
                handleClose
            }
            footer={null}
            width={620}
            centered
            destroyOnHidden
            className='edit-keyword-modal'
        >
            <div className='rounded-md border border-gray-100 p-6'>
                <Form
                    form={form}
                    layout='vertical'
                >
                    <KeywordCheckField
                        form={
                            form
                        }
                        keywords={
                            keywords
                        }
                        keywordEn={
                            keywordEn
                        }
                        setKeywordEn={
                            setKeywordEn
                        }
                        excludeKeywordId={
                            record?._id
                        }
                        duplicateMessage={({
                            keywordEn,
                        }) => {
                            return `"${keywordEn}" already exists in this group`
                        }}
                    />

                    <KeywordCheckField
                        form={
                            form
                        }
                        keywords={
                            keywords
                        }
                        fieldName='nameKh'
                        language='kh'
                        label='Keyword Kh'
                        placeholder='Enter Keyword Kh'
                        excludeKeywordId={
                            record?._id
                        }
                        duplicateMessage={({
                            keywordValue,
                        }) => {
                            return `"${keywordValue}" already exists in this group`
                        }}
                    />

                    <Form.Item
                        label='Group (Optional)'
                        name='group'
                    >
                        <Select
                            allowClear
                            showSearch
                            loading={
                                keywordGroupsLoading
                            }
                            placeholder='Select a group or leave ungrouped'
                            options={
                                keywordGroupOptions
                            }
                            optionFilterProp='label'
                        />
                    </Form.Item>
                </Form>
            </div>

            <div className='mt-5 flex justify-end'>
                <Button
                    type='primary'
                    loading={
                        submitting
                    }
                    disabled={
                        submitting
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
                    .edit-keyword-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .edit-keyword-modal .ant-modal-header {
                        margin-bottom: 8px;
                    }

                    .edit-keyword-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .edit-keyword-modal .ant-modal-body {
                        padding-top: 0;
                    }

                    .edit-keyword-modal .ant-form-item-label > label {
                        font-size: 12px;
                        color: #374151;
                    }

                    .edit-keyword-modal .ant-form-item-label > label::before {
                        color: #ef4444 !important;
                    }

                    .edit-keyword-modal .ant-select-selector,
                    .edit-keyword-modal .ant-input {
                        border-radius: 6px;
                    }
                `}
            </style>
        </Modal>
    )
}

export default EditKeywordModal