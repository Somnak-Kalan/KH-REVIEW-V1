import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
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
    getKeywordGroupLabel,
    isDuplicateResponse,
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

const AddKeywordModal = ({
    open,
    onCancel,
    keywords = [],
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
        creating,
        checkKeyword,
        createKeyword,
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
        creating

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
                            `"${values.nameEn}" already exists in group "${getKeywordGroupLabel(
                                foundDuplicate
                            )}"`,
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
                })

            if (
                foundDuplicateKh
            ) {
                form.setFields([
                    {
                        name:
                            'nameKh',

                        errors: [
                            `"${values.nameKh}" already exists in group "${getKeywordGroupLabel(
                                foundDuplicateKh
                            )}"`,
                        ],
                    },
                ])

                return
            }

            /*
                API:
                POST /core/setup/keyword/check
            */
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

            /*
                The selected dropdown value is
                the keyword-group _id.
            */
            const selectedGroupId =
                values.group ||
                undefined

            /*
                API:
                POST /core/setup/keyword/create

                Send selected group ID:
                groupId: selectedGroupId
            */
            await createKeyword({
                access_token,

                nameEn:
                    values.nameEn,

                nameKh:
                    values.nameKh,

                groupId:
                    selectedGroupId,
            })

            message.success(
                `"${values.nameEn?.trim()}" created successfully`
            )

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
                    'Unable to create keyword.'
                )
            )
        }
    }

    return (
        <Modal
            open={open}
            title='Add Keyword'
            onCancel={
                handleClose
            }
            footer={null}
            width={620}
            destroyOnHidden
        >
            <Form
                form={form}
                layout='vertical'
                className='mt-4'
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

                <div className='flex justify-end'>
                    <button
                        type='button'
                        disabled={
                            submitting
                        }
                        onClick={
                            handleSave
                        }
                        className='rounded-md bg-blue-600 px-8 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {submitting
                            ? 'saving...'
                            : 'save'}
                    </button>
                </div>
            </Form>
        </Modal>
    )
}

export default AddKeywordModal