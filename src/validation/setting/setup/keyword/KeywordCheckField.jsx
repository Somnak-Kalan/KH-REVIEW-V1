import {
    useMemo,
    useState,
} from 'react'
import {
    Form,
    Input,
} from 'antd'

/*
    Normalize keyword text before checking.

    It works for:
    - English
    - Khmer

    Examples:
    " Historical Site " => "historical site"
    " ប្រវត្តិសាស្ត្រ " => "ប្រវត្តិសាស្ត្រ"
*/
export const normalizeKeywordValue = (
    value
) => {
    return String(
        value ||
        ''
    )
        .trim()
        .toLowerCase()
}

/*
    Read a keyword name safely.

    Support the current normalized store format:
    {
        nameEn: 'Historical Site',
        nameKh: 'តំបន់ប្រវត្តិសាស្ត្រ'
    }

    Also support the raw API format:
    {
        names: [
            {
                lang: 'en',
                value: 'Historical Site'
            },
            {
                lang: 'kh',
                value: 'តំបន់ប្រវត្តិសាស្ត្រ'
            }
        ]
    }
*/
export const getKeywordName = ({
    item = {},
    fieldName = 'nameEn',
    language = 'en',
} = {}) => {
    const directValue =
        item?.[fieldName]

    if (
        directValue
    ) {
        return String(
            directValue
        ).trim()
    }

    if (
        !Array.isArray(
            item?.names
        )
    ) {
        return ''
    }

    return (
        item.names.find(
            (nameItem) => {
                return (
                    nameItem?.lang ===
                    language
                )
            }
        )?.value?.trim() ||
        ''
    )
}

/*
    Read the keyword-group name safely.

    Support:
    group: 'History'

    group: {
        nameEn: 'History'
    }

    groupInfo: {
        nameEn: 'History'
    }
*/
export const getKeywordGroupLabel = (
    item = {}
) => {
    if (
        typeof item?.group ===
        'string'
    ) {
        return (
            item.group ||
            'Ungrouped'
        )
    }

    return (
        item?.group?.nameEn ||
        item?.group?.nameKh ||
        item?.groupInfo?.nameEn ||
        item?.groupInfo?.nameKh ||
        'Ungrouped'
    )
}

/*
    Find an exact duplicate.

    Add mode:
    - Check every keyword.

    Edit mode:
    - Ignore the current keyword ID by using:
      excludeKeywordId: record?._id

    Backward compatibility:
    - Existing Add and Edit code can still pass:
      nameEn: values.nameEn
*/
export const findDuplicateKeyword = ({
    keywords = [],
    nameEn = '',
    value,
    fieldName = 'nameEn',
    language = 'en',
    excludeKeywordId = '',
} = {}) => {
    const searchValue =
        normalizeKeywordValue(
            value !==
                undefined
                ? value
                : nameEn
        )

    if (
        !searchValue
    ) {
        return null
    }

    return (
        keywords.find(
            (item) => {
                if (
                    item?._id ===
                    excludeKeywordId
                ) {
                    return false
                }

                const keywordName =
                    getKeywordName({
                        item,

                        fieldName,

                        language,
                    })

                return (
                    normalizeKeywordValue(
                        keywordName
                    ) ===
                    searchValue
                )
            }
        ) ||
        null
    )
}

/*
    Return similar keyword suggestions.

    English example:
    Existing: Historical Site
    Input: Hist

    Khmer example:
    Existing: តំបន់ប្រវត្តិសាស្ត្រ
    Input: ប្រវត្តិ

    Both return matching suggestions.
*/
export const getSimilarKeywords = ({
    keywords = [],
    nameEn = '',
    value,
    fieldName = 'nameEn',
    language = 'en',
    excludeKeywordId = '',
    limit = 5,
} = {}) => {
    const searchValue =
        normalizeKeywordValue(
            value !==
                undefined
                ? value
                : nameEn
        )

    if (
        !searchValue ||
        searchValue.length <
        2
    ) {
        return []
    }

    return keywords
        .filter(
            (item) => {
                if (
                    item?._id ===
                    excludeKeywordId
                ) {
                    return false
                }

                const keywordName =
                    normalizeKeywordValue(
                        getKeywordName({
                            item,

                            fieldName,

                            language,
                        })
                    )

                if (
                    !keywordName ||
                    keywordName ===
                    searchValue
                ) {
                    return false
                }

                return (
                    keywordName.includes(
                        searchValue
                    ) ||
                    searchValue.includes(
                        keywordName
                    )
                )
            }
        )
        .slice(
            0,
            limit
        )
}

/*
    Check the duplicate-check API response.

    Support:
    {
        exists: true
    }

    {
        data: {
            exists: true
        }
    }
*/
export const isDuplicateResponse = (
    response
) => {
    const payload =
        response?.data ||
        response ||
        {}

    return Boolean(
        payload?.exists ||
        payload?.isExists ||
        payload?.duplicate ||
        payload?.data?.exists ||
        payload?.data?.isExists ||
        payload?.data?.duplicate
    )
}

const KeywordCheckField = ({
    form,
    keywords = [],

    /*
        Default values keep your existing
        English usage working without changes.
    */
    fieldName = 'nameEn',
    language = 'en',
    label = 'Keyword En',
    placeholder = 'Enter Keyword En',

    /*
        Existing English props remain supported.
    */
    keywordEn,
    setKeywordEn,

    /*
        Generic optional props for other languages.
    */
    keywordValue,
    setKeywordValue,

    /*
        Edit mode uses this to prevent detecting
        the current record as its own duplicate.
    */
    excludeKeywordId = '',

    duplicateMessage,
}) => {
    const [
        showSuggestion,
        setShowSuggestion,
    ] = useState(false)

    /*
        Watch the Ant Design form value.

        Khmer can use this directly without
        requiring an additional parent state.
    */
    const watchedValue =
        Form.useWatch(
            fieldName,
            form
        )

    /*
        Keep compatibility with your existing
        English parent state:

        keywordEn
        setKeywordEn

        Khmer can use the watched form value.
    */
    const currentValue =
        keywordValue !==
            undefined
            ? keywordValue
            : fieldName ===
                'nameEn' &&
                keywordEn !==
                undefined
                ? keywordEn
                : watchedValue ||
                ''

    const setCurrentValue = (
        value
    ) => {
        /*
            Preserve your existing English
            parent-state concept.
        */
        if (
            fieldName ===
            'nameEn' &&
            typeof setKeywordEn ===
            'function'
        ) {
            setKeywordEn(
                value
            )
        }

        /*
            Optional generic state support.
        */
        if (
            typeof setKeywordValue ===
            'function'
        ) {
            setKeywordValue(
                value
            )
        }

        form?.setFieldsValue({
            [fieldName]:
                value,
        })
    }

    const duplicateKeyword =
        useMemo(() => {
            return findDuplicateKeyword({
                keywords,

                value:
                    currentValue,

                fieldName,

                language,

                excludeKeywordId,
            })
        }, [
            keywords,
            currentValue,
            fieldName,
            language,
            excludeKeywordId,
        ])

    const similarKeywords =
        useMemo(() => {
            return getSimilarKeywords({
                keywords,

                value:
                    currentValue,

                fieldName,

                language,

                excludeKeywordId,

                limit:
                    5,
            })
        }, [
            keywords,
            currentValue,
            fieldName,
            language,
            excludeKeywordId,
        ])

    const canShowSuggestionDropdown =
        showSuggestion &&
        !duplicateKeyword &&
        similarKeywords.length >
        0

    const getDuplicateMessage = (
        duplicateItem
    ) => {
        if (
            typeof duplicateMessage ===
            'function'
        ) {
            return duplicateMessage({
                keywordValue:
                    currentValue,

                keywordEn:
                    currentValue,

                duplicateKeyword:
                    duplicateItem,
            })
        }

        return `"${currentValue}" already exists in group "${getKeywordGroupLabel(
            duplicateItem
        )}"`
    }

    const duplicateHelp =
        duplicateKeyword
            ? getDuplicateMessage(
                duplicateKeyword
            )
            : undefined

    return (
        <Form.Item
            label={
                label
            }
            name={
                fieldName
            }
            validateStatus={
                duplicateKeyword
                    ? 'error'
                    : undefined
            }
            help={
                duplicateHelp
            }
            rules={[
                {
                    required:
                        true,

                    message:
                        `Please enter ${label.toLowerCase()}`,
                },

                /*
                    Prevent save when an exact duplicate
                    exists.

                    This now works for both:
                    - Keyword En
                    - Keyword Kh
                */
                {
                    validator:
                        async (
                            _,
                            value
                        ) => {
                            const foundDuplicate =
                                findDuplicateKeyword({
                                    keywords,

                                    value,

                                    fieldName,

                                    language,

                                    excludeKeywordId,
                                })

                            if (
                                foundDuplicate
                            ) {
                                throw new Error(
                                    getDuplicateMessage(
                                        foundDuplicate
                                    )
                                )
                            }
                        },
                },
            ]}
        >
            <div className='relative'>
                <Input
                    placeholder={
                        placeholder
                    }
                    value={
                        currentValue
                    }
                    onFocus={() => {
                        setShowSuggestion(
                            true
                        )
                    }}
                    onBlur={() => {
                        setTimeout(
                            () => {
                                setShowSuggestion(
                                    false
                                )
                            },
                            160
                        )
                    }}
                    onChange={(
                        e
                    ) => {
                        const value =
                            e.target
                                .value

                        setCurrentValue(
                            value
                        )

                        setShowSuggestion(
                            true
                        )
                    }}
                />

                {canShowSuggestionDropdown ? (
                    <div className='absolute left-0 right-0 top-[36px] z-[9999] rounded-md border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900'>
                        <div className='border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-300'>
                            Similar Keyword
                        </div>

                        <div className='max-h-[180px] overflow-y-auto py-1'>
                            {similarKeywords.map(
                                (
                                    item
                                ) => {
                                    const suggestionName =
                                        getKeywordName({
                                            item,

                                            fieldName,

                                            language,
                                        })

                                    return (
                                        <button
                                            key={
                                                item._id
                                            }
                                            type='button'
                                            onMouseDown={(
                                                e
                                            ) => {
                                                e.preventDefault()
                                            }}
                                            onClick={() => {
                                                setCurrentValue(
                                                    suggestionName
                                                )

                                                setShowSuggestion(
                                                    false
                                                )
                                            }}
                                            className='block w-full px-3 py-2 text-left text-xs transition hover:bg-blue-50 dark:hover:bg-slate-800'
                                        >
                                            <span className='font-semibold text-blue-700'>
                                                {
                                                    suggestionName
                                                }
                                            </span>

                                            <span className='text-gray-500 dark:text-slate-400'>
                                                {' '}
                                                already
                                                exists
                                                in group{' '}
                                            </span>

                                            <span className='font-semibold text-gray-700 dark:text-slate-300'>
                                                {getKeywordGroupLabel(
                                                    item
                                                )}
                                            </span>
                                        </button>
                                    )
                                }
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </Form.Item>
    )
}

export default KeywordCheckField