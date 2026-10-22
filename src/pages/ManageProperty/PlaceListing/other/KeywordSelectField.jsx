import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    Tooltip,
    Select,
    Tag,
    message,
} from 'antd'

import KeywordService from '../../../../services/settings/setups/Keyword'
import KeywordGroupService from '../../../../services/settings/setups/KeywordGroup'
import KeywordCheckField, {
    findDuplicateKeyword,
    getKeywordGroupLabel,
    isDuplicateResponse,
} from '../../../../validation/setting/setup/keyword/KeywordCheckField'
const UNGROUPED_KEY = '__ungrouped__'

const getErrorMessage = (
    error,
    fallbackMessage = 'Something went wrong.'
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallbackMessage
    )
}

const getNameByLanguage = (
    names = [],
    language
) => {
    if (!Array.isArray(names)) {
        return ''
    }

    return (
        names.find((item) => {
            return item?.lang === language
        })?.value?.trim() || ''
    )
}

const getId = (item) => {
    if (!item) {
        return ''
    }

    if (typeof item === 'string') {
        return item
    }

    return (
        item?._id ||
        item?.id ||
        item?.value ||
        ''
    )
}

const getSafeKeywordIds = (
    value = []
) => {
    const list =
        Array.isArray(value)
            ? value
            : value
                ? [value]
                : []

    return Array.from(
        new Set(
            list
                .map(
                    getId
                )
                .filter(
                    Boolean
                )
        )
    )
}

/*
  Prevent unnecessary form updates.

  Return true only when the existing form
  value is already a clean array of IDs.
*/
const isSameKeywordIdList = (
    currentValue,
    safeKeywordIds
) => {
    if (
        !Array.isArray(
            currentValue
        )
    ) {
        return false
    }

    if (
        currentValue.length !==
        safeKeywordIds.length
    ) {
        return false
    }

    return currentValue.every(
        (
            item,
            index
        ) => {
            return (
                typeof item ===
                'string' &&
                item ===
                safeKeywordIds[
                index
                ]
            )
        }
    )
}

const getListFromResponse = (
    response
) => {
    const payload =
        response?.data ??
        response

    if (Array.isArray(payload)) {
        return payload
    }

    if (Array.isArray(payload?.data)) {
        return payload.data
    }

    if (Array.isArray(payload?.docs)) {
        return payload.docs
    }

    if (Array.isArray(payload?.result)) {
        return payload.result
    }

    return []
}

const getCreatedKeywordFromResponse = (
    response
) => {
    const payload =
        response?.data ??
        response

    return (
        payload?.data?.keyword ||
        payload?.data ||
        payload?.keyword ||
        payload?.result ||
        payload ||
        {}
    )
}

const normalizeText = (
    value = ''
) => {
    return String(value)
        .trim()
        .toLowerCase()
}

const getBilingualLabel = ({
    nameKh = '',
    nameEn = '',
    fallback = '',
} = {}) => {
    if (nameKh && nameEn) {
        return `${nameKh} – ${nameEn}`
    }

    return (
        nameEn ||
        nameKh ||
        fallback
    )
}

const normalizeKeywordGroup = (
    item = {}
) => {
    return {
        ...item,

        _id:
            getId(item),

        nameEn:
            item?.nameEn ||
            getNameByLanguage(
                item?.names,
                'en'
            ),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(
                item?.names,
                'kh'
            ),
    }
}

const normalizeKeyword = (
    item = {}
) => {
    const groupInfo =
        item?.groupInfo ||
        (
            typeof item?.group ===
                'object'
                ? item.group
                : null
        )

    return {
        ...item,

        _id:
            getId(item),

        nameEn:
            item?.nameEn ||
            getNameByLanguage(
                item?.names,
                'en'
            ),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(
                item?.names,
                'kh'
            ),

        groupInfo,

        groupId:
            item?.groupId ||
            getId(groupInfo) ||
            (
                typeof item?.group ===
                    'string'
                    ? item.group
                    : ''
            ),
    }
}

const removeDuplicatedKeywords = (
    list = []
) => {
    const keywordMap =
        new Map()

    list.forEach((item) => {
        const keyword =
            normalizeKeyword(item)

        if (!keyword?._id) {
            return
        }

        keywordMap.set(
            keyword._id,
            keyword
        )
    })

    return Array.from(
        keywordMap.values()
    )
}

const KeywordSelectField = ({
    form,
    access_token = '',
    name = 'keyword',
}) => {
    const [
        addKeywordForm,
    ] = Form.useForm()

    const [
        openAddKeyword,
        setOpenAddKeyword,
    ] = useState(false)

    const [
        keywordLoading,
        setKeywordLoading,
    ] = useState(false)

    const [
        groupLoading,
        setGroupLoading,
    ] = useState(false)

    const [
        creatingKeyword,
        setCreatingKeyword,
    ] = useState(false)

    const [
        keywords,
        setKeywords,
    ] = useState([])

    const [
        keywordGroups,
        setKeywordGroups,
    ] = useState([])
    const [
        keywordEn,
        setKeywordEn,
    ] = useState('')

    const selectedKeywordValue =
        Form.useWatch(
            name,
            form
        )

    useEffect(() => {
        /*
          Do not initialize or overwrite the
          field while the parent form has not
          provided a value yet.
        */
        if (
            selectedKeywordValue ===
            undefined ||
            selectedKeywordValue ===
            null
        ) {
            return
        }

        const safeKeywordIds =
            getSafeKeywordIds(
                selectedKeywordValue
            )

        /*
          Update the form only when:
          - values are keyword objects;
          - an invalid object exists;
          - duplicated IDs exist;
          - or the current format is not clean.
        */
        if (
            isSameKeywordIdList(
                selectedKeywordValue,
                safeKeywordIds
            )
        ) {
            return
        }

        form?.setFieldsValue({
            [name]:
                safeKeywordIds,
        })
    }, [
        form,
        name,
        selectedKeywordValue,
    ])

    const loadKeywords =
        useCallback(
            async ({
                silent = false,
            } = {}) => {
                if (!access_token) {
                    return []
                }

                try {
                    setKeywordLoading(
                        true
                    )

                    const response =
                        await KeywordService
                            .getKeywordList({
                                access_token,

                                params: {
                                    page:
                                        1,

                                    /*
                                      Load all keyword choices for
                                      the create-place dropdown.
                                    */
                                    limit:
                                        1000,

                                    search:
                                        '',
                                },
                            })

                    const list =
                        getListFromResponse(
                            response
                        )
                            .map(
                                normalizeKeyword
                            )
                            .filter(
                                (item) => {
                                    return Boolean(
                                        item?._id
                                    )
                                }
                            )

                    setKeywords(
                        removeDuplicatedKeywords(
                            list
                        )
                    )

                    return list
                } catch (error) {
                    if (!silent) {
                        message.error(
                            getErrorMessage(
                                error,
                                'Unable to load keywords.'
                            )
                        )
                    }

                    return []
                } finally {
                    setKeywordLoading(
                        false
                    )
                }
            },
            [
                access_token,
            ]
        )

    const loadKeywordGroups =
        useCallback(
            async ({
                silent = false,
            } = {}) => {
                if (!access_token) {
                    return []
                }

                try {
                    setGroupLoading(
                        true
                    )

                    const response =
                        await KeywordGroupService
                            .getKeywordGroupList({
                                access_token,

                                params: {
                                    page:
                                        1,

                                    /*
                                      Load every group for the
                                      add-keyword modal and dropdown.
                                    */
                                    limit:
                                        1000,

                                    search:
                                        '',
                                },
                            })

                    const list =
                        getListFromResponse(
                            response
                        )
                            .map(
                                normalizeKeywordGroup
                            )
                            .filter(
                                (item) => {
                                    return Boolean(
                                        item?._id
                                    )
                                }
                            )

                    setKeywordGroups(
                        list
                    )

                    return list
                } catch (error) {
                    if (!silent) {
                        message.error(
                            getErrorMessage(
                                error,
                                'Unable to load keyword groups.'
                            )
                        )
                    }

                    return []
                } finally {
                    setGroupLoading(
                        false
                    )
                }
            },
            [
                access_token,
            ]
        )

    useEffect(() => {
        loadKeywords()
        loadKeywordGroups()
    }, [
        loadKeywords,
        loadKeywordGroups,
    ])

    const keywordGroupOptions =
        useMemo(() => {
            return keywordGroups.map(
                (group) => {
                    return {
                        value:
                            group._id,

                        label:
                            getBilingualLabel({
                                nameKh:
                                    group.nameKh,

                                nameEn:
                                    group.nameEn,

                                fallback:
                                    group._id,
                            }),
                    }
                }
            )
        }, [
            keywordGroups,
        ])

    /*
      Display keyword choices by group.

      Example:
      Nature
        - ទឹកធ្លាក់ – Waterfall
        - ឆ្នេរ – Beach

      Food
        - កាហ្វេ – Coffee

      Ungrouped
        - Other keyword
    */
    const keywordOptions =
        useMemo(() => {
            const groupMap =
                new Map()

            keywordGroups.forEach(
                (group) => {
                    groupMap.set(
                        group._id,
                        group
                    )
                }
            )

            const bucketMap =
                new Map()

            const addToBucket = ({
                bucketKey,
                bucketLabel,
                option,
            }) => {
                const existingBucket =
                    bucketMap.get(
                        bucketKey
                    ) || {
                        label:
                            bucketLabel,

                        options:
                            [],
                    }

                existingBucket
                    .options
                    .push(
                        option
                    )

                bucketMap.set(
                    bucketKey,
                    existingBucket
                )
            }

            keywords.forEach(
                (keyword) => {
                    if (!keyword?._id) {
                        return
                    }

                    const keywordLabel =
                        getBilingualLabel({
                            nameKh:
                                keyword.nameKh,

                            nameEn:
                                keyword.nameEn,

                            fallback:
                                keyword._id,
                        })

                    const groupId =
                        keyword.groupId ||
                        ''

                    if (!groupId) {
                        addToBucket({
                            bucketKey:
                                UNGROUPED_KEY,

                            bucketLabel:
                                'Ungrouped',

                            option: {
                                value:
                                    keyword._id,

                                label:
                                    keywordLabel,
                            },
                        })

                        return
                    }

                    const group =
                        groupMap.get(
                            groupId
                        )

                    const groupLabel =
                        group
                            ? getBilingualLabel({
                                nameKh:
                                    group.nameKh,

                                nameEn:
                                    group.nameEn,

                                fallback:
                                    groupId,
                            })
                            : getBilingualLabel({
                                nameKh:
                                    keyword
                                        ?.groupInfo
                                        ?.nameKh,

                                nameEn:
                                    keyword
                                        ?.groupInfo
                                        ?.nameEn,

                                fallback:
                                    typeof keyword?.group ===
                                        'string'
                                        ? keyword.group
                                        : 'Other Group',
                            })

                    addToBucket({
                        bucketKey:
                            groupId,

                        bucketLabel:
                            groupLabel,

                        option: {
                            value:
                                keyword._id,

                            label:
                                keywordLabel,
                        },
                    })
                }
            )

            const groupedOptions =
                []

            /*
              Keep group ordering based on
              the keyword-group API response.
            */
            keywordGroups.forEach(
                (group) => {
                    const bucket =
                        bucketMap.get(
                            group._id
                        )

                    if (!bucket) {
                        return
                    }

                    groupedOptions.push(
                        bucket
                    )

                    bucketMap.delete(
                        group._id
                    )
                }
            )

            /*
              Add groups that were returned
              inside keyword objects but not
              present in the group-list API.
            */
            bucketMap.forEach(
                (
                    bucket,
                    bucketKey
                ) => {
                    if (
                        bucketKey !==
                        UNGROUPED_KEY
                    ) {
                        groupedOptions.push(
                            bucket
                        )
                    }
                }
            )

            /*
              Keep ungrouped keywords at
              the bottom of the dropdown.
            */
            const ungroupedBucket =
                bucketMap.get(
                    UNGROUPED_KEY
                )

            if (ungroupedBucket) {
                groupedOptions.push(
                    ungroupedBucket
                )
            }

            return groupedOptions
        }, [
            keywords,
            keywordGroups,
        ])
    const closeAddKeywordModal =
        () => {
            setOpenAddKeyword(
                false
            )

            addKeywordForm
                .resetFields()

            setKeywordEn(
                ''
            )
        }

    const openAddKeywordModal =
        () => {
            setOpenAddKeyword(
                true
            )

            /*
              Refresh groups every time the
              modal opens in case a new group
              was recently created.
            */
            loadKeywordGroups({
                silent:
                    true,
            })
        }

    const handleCreateKeyword =
        async (values) => {
            try {
                setCreatingKeyword(
                    true
                )

                const payload = {
                    nameEn:
                        values
                            .nameEn
                            ?.trim(),

                    nameKh:
                        values
                            .nameKh
                            ?.trim(),

                    /*
                      Group selection is optional.
                    */
                    groupId:
                        values.groupId ||
                        undefined,
                }
                /*
  Check currently loaded English
  keywords first.
*/
                const foundDuplicateEn =
                    findDuplicateKeyword({
                        keywords,

                        nameEn:
                            payload.nameEn,
                    })

                if (
                    foundDuplicateEn
                ) {
                    addKeywordForm
                        .setFields([
                            {
                                name:
                                    'nameEn',

                                errors: [
                                    `"${payload.nameEn}" already exists in group "${getKeywordGroupLabel(
                                        foundDuplicateEn
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
                            payload.nameKh,

                        fieldName:
                            'nameKh',

                        language:
                            'kh',
                    })

                if (
                    foundDuplicateKh
                ) {
                    addKeywordForm
                        .setFields([
                            {
                                name:
                                    'nameKh',

                                errors: [
                                    `"${payload.nameKh}" already exists in group "${getKeywordGroupLabel(
                                        foundDuplicateKh
                                    )}"`,
                                ],
                            },
                        ])

                    return
                }


                const checkResponse =
                    await KeywordService
                        .checkKeyword({
                            access_token,

                            payload: {
                                nameEn:
                                    payload.nameEn,

                                nameKh:
                                    payload.nameKh,
                            },
                        })

                if (
                    isDuplicateResponse(
                        checkResponse
                    )
                ) {
                    addKeywordForm
                        .setFields([
                            {
                                name:
                                    'nameEn',

                                errors: [
                                    `"${payload.nameEn}" already exists`,
                                ],
                            },

                            {
                                name:
                                    'nameKh',

                                errors: [
                                    `"${payload.nameKh}" already exists`,
                                ],
                            },
                        ])

                    return
                }

                const response =
                    await KeywordService
                        .createKeyword({
                            access_token,
                            payload,
                        })
                const createdFromResponse =
                    normalizeKeyword(
                        getCreatedKeywordFromResponse(
                            response
                        )
                    )

                /*
                  Reload the real API list after
                  successfully creating a keyword.
                */
                const refreshedKeywords =
                    await loadKeywords({
                        silent:
                            true,
                    })

                let createdKeywordId =
                    createdFromResponse
                        ?._id ||
                    ''


                if (!createdKeywordId) {
                    const matchedKeyword =
                        refreshedKeywords
                            .find(
                                (keyword) => {
                                    const sameNameEn =
                                        normalizeText(
                                            keyword
                                                ?.nameEn
                                        ) ===
                                        normalizeText(
                                            payload
                                                .nameEn
                                        )

                                    const sameNameKh =
                                        normalizeText(
                                            keyword
                                                ?.nameKh
                                        ) ===
                                        normalizeText(
                                            payload
                                                .nameKh
                                        )

                                    return (
                                        sameNameEn &&
                                        sameNameKh
                                    )
                                }
                            )

                    createdKeywordId =
                        matchedKeyword
                            ?._id ||
                        ''
                }

                /*
                  Automatically select the new
                  keyword in the parent create-place
                  form without removing existing
                  keyword selections.
                */
                if (createdKeywordId) {
                    const currentValue =
                        form
                            ?.getFieldValue(
                                name
                            )

                    /*
                      ===== EDIT DATA SAFETY =====

                      Existing edit values may still
                      be keyword objects. Convert them
                      into valid IDs before appending
                      the newly created keyword.
                    */
                    const selectedKeywordIds =
                        getSafeKeywordIds(
                            currentValue
                        )

                    form
                        ?.setFieldsValue({
                            [name]:
                                Array.from(
                                    new Set([
                                        ...selectedKeywordIds,

                                        createdKeywordId,
                                    ])
                                ),
                        })

                    /*
                      Keep the new option visible even
                      if the API has delayed indexing
                      or pagination does not immediately
                      include the new record.
                    */
                    const fallbackKeyword =
                        normalizeKeyword({
                            ...createdFromResponse,

                            _id:
                                createdKeywordId,

                            nameEn:
                                createdFromResponse
                                    ?.nameEn ||
                                payload.nameEn,

                            nameKh:
                                createdFromResponse
                                    ?.nameKh ||
                                payload.nameKh,

                            groupId:
                                createdFromResponse
                                    ?.groupId ||
                                payload.groupId ||
                                '',
                        })

                    setKeywords(
                        (
                            previousKeywords
                        ) => {
                            return removeDuplicatedKeywords([
                                fallbackKeyword,

                                ...previousKeywords,

                                ...refreshedKeywords,
                            ])
                        }
                    )

                    message.success(
                        'Keyword created and selected.'
                    )
                } else {
                    message.success(
                        'Keyword created successfully.'
                    )

                    message.warning(
                        'Please select the new keyword from the list.'
                    )
                }

                closeAddKeywordModal()
            } catch (error) {
                message.error(
                    getErrorMessage(
                        error,
                        'Unable to create keyword.'
                    )
                )
            } finally {
                setCreatingKeyword(
                    false
                )
            }
        }

    const keywordLabelMap = useMemo(() => {
        const labelMap = new Map()

        keywords.forEach((keyword) => {
            if (!keyword?._id) return

            labelMap.set(
                keyword._id,
                getBilingualLabel({
                    nameKh: keyword.nameKh,
                    nameEn: keyword.nameEn,
                    fallback: keyword._id,
                })
            )
        })

        return labelMap
    }, [keywords])

    const renderKeywordTag = useCallback(
        (tagProps) => {
            const {
                label,
                value,
                closable,
                onClose,
            } = tagProps

            const fullLabel =
                label ||
                keywordLabelMap.get(value) ||
                value

            const preventMouseDown = (event) => {
                event.preventDefault()
                event.stopPropagation()
            }

            return (
                <Tooltip
                    title={fullLabel}
                    placement='top'
                    mouseEnterDelay={0.2}
                >
                    <Tag
                        closable={closable}
                        onClose={onClose}
                        onMouseDown={preventMouseDown}
                        className='mr-1 flex max-w-[230px] items-center'
                    >
                        <span className='block overflow-hidden text-ellipsis whitespace-nowrap'>
                            {fullLabel}
                        </span>
                    </Tag>
                </Tooltip>
            )
        },
        [keywordLabelMap]
    )

    const renderMaxTagPlaceholder = useCallback(
        (omittedValues = []) => {
            const hiddenItems = omittedValues.map(
                (item) => {
                    const value =
                        item?.value ||
                        item?._id ||
                        ''

                    return {
                        value,
                        label:
                            item?.label ||
                            keywordLabelMap.get(value) ||
                            value,
                    }
                }
            )

            return (
                <Tooltip
                    placement='top'
                    mouseEnterDelay={0.15}
                    title={
                        <div className='max-h-[260px] min-w-[180px] overflow-y-auto py-1'>
                            {hiddenItems.map(
                                (item, index) => (
                                    <div
                                        key={
                                            item.value ||
                                            index
                                        }
                                        className='border-b border-white/20 px-1 py-1.5 last:border-b-0'
                                    >
                                        {item.label}
                                    </div>
                                )
                            )}
                        </div>
                    }
                >
                    <span className='cursor-help'>
                        +{hiddenItems.length}
                    </span>
                </Tooltip>
            )
        },
        [keywordLabelMap]
    )

    return (
        <>
            <Form.Item
                style={{
                    marginBottom:
                        0,
                }}
                name={
                    name
                }
                label={
                    <>
                        <span>
                            Keyword
                        </span>

                        <button
                            type='button'
                            className='mx-2 cursor-pointer border-0 bg-transparent p-0 text-blue-400 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
                            onClick={(
                                event
                            ) => {
                                event
                                    .preventDefault()

                                event
                                    .stopPropagation()

                                openAddKeywordModal()
                            }}
                        >
                            <span className='text-lg'>
                                +
                            </span>{' '}
                            Add New
                        </button>
                    </>
                }
            >
                <Select
                    mode='multiple'
                    allowClear
                    showSearch
                    loading={keywordLoading}
                    placeholder='Select keyword'
                    style={{
                        width: '100%',
                    }}
                    options={keywordOptions}
                    optionFilterProp='label'

                    // Show full text when hovering a visible selected item.
                    tagRender={renderKeywordTag}

                    // Responsive selected items.
                    maxTagCount='responsive'

                    // Show hidden selected items when hovering +3, +4, etc.
                    maxTagPlaceholder={renderMaxTagPlaceholder}

                    filterOption={(input, option) => {
                        return String(option?.label || '')
                            .toLowerCase()
                            .includes(
                                input
                                    .trim()
                                    .toLowerCase()
                            )
                    }}
                    onOpenChange={(visible) => {
                        if (!visible) return

                        loadKeywords({
                            silent: true,
                        })

                        loadKeywordGroups({
                            silent: true,
                        })
                    }}
                />
            </Form.Item>

            <Modal
                title='Add Keyword'
                open={
                    openAddKeyword
                }
                footer={
                    null
                }
                width={
                    805
                }
                closable={
                    !creatingKeyword
                }
                maskClosable={
                    !creatingKeyword
                }
                onCancel={
                    closeAddKeywordModal
                }
                destroyOnHidden
            >
                <Form
                    form={
                        addKeywordForm
                    }
                    layout='vertical'
                    onFinish={
                        handleCreateKeyword
                    }
                >
                    <div className='rounded-lg border border-gray-200 p-6 dark:border-slate-700'>
                        <KeywordCheckField
                            form={
                                addKeywordForm
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
                            fieldName='nameEn'
                            language='en'
                            label='Keyword Name (English)'
                            placeholder='e.g. Waterfall'
                        />

                        <KeywordCheckField
                            form={
                                addKeywordForm
                            }
                            keywords={
                                keywords
                            }
                            fieldName='nameKh'
                            language='kh'
                            label='Keyword Name (Khmer)'
                            placeholder='e.g. ទឹកធ្លាក់'
                        />

                        <Form.Item
                            label='Keyword Group (Optional)'
                            name='groupId'
                            style={{
                                marginBottom:
                                    0,
                            }}
                        >
                            <Select
                                allowClear
                                showSearch
                                loading={
                                    groupLoading
                                }
                                placeholder='Select keyword group or leave ungrouped'
                                options={
                                    keywordGroupOptions
                                }
                                optionFilterProp='label'
                                filterOption={(
                                    input,
                                    option
                                ) => {
                                    return String(
                                        option?.label ||
                                        ''
                                    )
                                        .toLowerCase()
                                        .includes(
                                            input
                                                .trim()
                                                .toLowerCase()
                                        )
                                }}
                            />
                        </Form.Item>
                    </div>

                    <div className='mt-3 flex justify-end'>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={
                                creatingKeyword
                            }
                            style={{
                                minWidth:
                                    150,
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    )
}
export default KeywordSelectField