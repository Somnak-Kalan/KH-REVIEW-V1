import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom'
import { message } from 'antd'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

import { AuthContext } from '../../../../contexts/AuthContext'
import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'
import useKeywordStore from '../../../../Stores/settings/setups/keyword.store'

import {
    keywordOptions,
    mockGroups,
} from '../data/keywordData'

const useKeywordGroupDetail = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const { access_token } =
        useContext(AuthContext)

    const {
        groups: apiGroups,
        group: apiGroupDetail,
        detailLoading,
        fetchKeywordGroupById,
        deleteKeywordGroup,

        groupKeywords: apiKeywords,
        groupKeywordPagination,
        groupKeywordsLoading,
        groupKeywordsHasLoaded,
        groupKeywordsGroupId,
        fetchKeywordGroupKeywords,
    } = useKeywordGroupStore()

    const {
        deleteKeyword,
    } = useKeywordStore()

    const groupFromState =
        location.state?.group

    const groupFromStore =
        apiGroups.find((item) => {
            return item._id === id
        })

    const groupFromMock =
        mockGroups.find((item) => {
            return item._id === id
        })

    const fallbackGroup =
        groupFromState ||
        groupFromStore ||
        groupFromMock

    const [
        groupDetail,
        setGroupDetail,
    ] = useState(fallbackGroup)

    const currentGroup =
        groupDetail ||
        apiGroupDetail ||
        fallbackGroup

    const sourceGroups =
        apiGroups.length > 0
            ? apiGroups
            : mockGroups

    const [keywords, setKeywords] =
        useState([])

    const [search, setSearch] =
        useState('')

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState('')

    const [currentPage, setCurrentPage] =
        useState(1)

    const [pageSize, setPageSize] =
        useState(10)

    const [openAddKeyword, setOpenAddKeyword] =
        useState(false)

    const [openTransfer, setOpenTransfer] =
        useState(false)

    const [transferRecord, setTransferRecord] =
        useState(null)

    const [openEditKeyword, setOpenEditKeyword] =
        useState(false)

    const [editingRecord, setEditingRecord] =
        useState(null)

    const [
        openEditGroupKeyword,
        setOpenEditGroupKeyword,
    ] = useState(false)

    useEffect(() => {
        if (!id || !access_token) return

        fetchKeywordGroupById({
            id,
            access_token,
        }).catch(() => { })
    }, [
        id,
        access_token,
        fetchKeywordGroupById,
    ])

    useEffect(() => {
        if (apiGroupDetail?._id === id) {
            setGroupDetail(apiGroupDetail)
        }
    }, [
        apiGroupDetail,
        id,
    ])

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1)
            setDebouncedSearch(
                String(search || '').trim()
            )
        }, 400)

        return () => {
            clearTimeout(timer)
        }
    }, [
        search,
    ])

    const refetchGroupKeywords =
        useCallback(
            async ({
                page = currentPage,
                limit = pageSize,
            } = {}) => {
                if (!id || !access_token) {
                    return null
                }

                return fetchKeywordGroupKeywords({
                    id,
                    access_token,
                    page,
                    limit,
                    search: debouncedSearch,
                })
            },
            [
                id,
                access_token,
                currentPage,
                pageSize,
                debouncedSearch,
                fetchKeywordGroupKeywords,
            ]
        )

    useEffect(() => {
        refetchGroupKeywords().catch(() => { })
    }, [
        refetchGroupKeywords,
    ])

    useEffect(() => {
        if (!groupKeywordsHasLoaded) return
        if (groupKeywordsGroupId !== id) return

        setKeywords(apiKeywords)
    }, [
        apiKeywords,
        groupKeywordsHasLoaded,
        groupKeywordsGroupId,
        id,
    ])

    const groupOptions =
        useMemo(() => {
            return sourceGroups.map((item) => {
                const displayGroup =
                    item._id === currentGroup?._id
                        ? currentGroup
                        : item

                return {
                    label: `${displayGroup?.nameEn || '-'
                        } / ${displayGroup?.nameKh || '-'
                        }`,
                    value: item._id,
                }
            })
        }, [
            sourceGroups,
            currentGroup,
        ])

    const availableKeywords =
        useMemo(() => {
            const ids = new Set(
                keywords.map((item) => item._id)
            )

            return keywordOptions
                .filter((item) => {
                    return !ids.has(item.value)
                })
                .map((item) => ({
                    _id: item.value,
                    nameEn: item.value,
                    nameKh: item.nameKh || '',
                    searchCount:
                        item.searchCount || 0,
                    createdBy: 'Admin',
                    createdAt: '2026-05-24',
                }))
        }, [
            keywords,
        ])

    const handleTableChange = (
        page,
        size
    ) => {
        const isChangingPageSize =
            size !== pageSize

        setCurrentPage(
            isChangingPageSize ? 1 : page
        )

        setPageSize(size)
    }

    const handleAddExisting = (
        selectedKeywords
    ) => {
        setKeywords((prev) => [
            ...prev,
            ...selectedKeywords,
        ])

        setOpenAddKeyword(false)

        message.success(
            `${selectedKeywords.length} keyword${selectedKeywords.length > 1
                ? 's'
                : ''
            } added to group successfully`
        )
    }

    const handleCreateAndAdd = (
        values
    ) => {
        const newKeyword = {
            _id: Date.now().toString(),
            nameEn: values.nameEn?.trim(),
            nameKh: values.nameKh?.trim(),
            searchCount: 0,
            createdBy: 'Admin',
            createdAt:
                dayjs().format('YYYY-MM-DD'),
        }

        setKeywords((prev) => [
            newKeyword,
            ...prev,
        ])

        setOpenAddKeyword(false)

        message.success(
            `"${newKeyword.nameEn}" created and added successfully`
        )
    }

    const handleOpenTransfer = (
        record = null
    ) => {
        setTransferRecord(record)
        setOpenTransfer(true)
    }

    const handleTransfer = ({
        keywords:
        selectedKeywords = [],
        targetGroup,
    }) => {
        const selectedIds =
            selectedKeywords.map((item) => {
                return item._id
            })

        setKeywords((prev) => {
            return prev.filter((item) => {
                return !selectedIds.includes(
                    item._id
                )
            })
        })

        setOpenTransfer(false)
        setTransferRecord(null)

        message.success(
            `${selectedKeywords.length} keyword${selectedKeywords.length > 1
                ? 's'
                : ''
            } transferred to ${targetGroup?.nameEn ||
            'Ungrouped'
            } successfully`
        )
    }

    const handleOpenEdit = (record) => {
        setEditingRecord({
            ...record,
            group:
                record.groupId ||
                currentGroup?._id,
        })

        setOpenEditKeyword(true)
    }

    const handleKeywordUpdated =
        async () => {
            await refetchGroupKeywords()
        }

    const handleRemoveFromGroup = (
        record
    ) => {
        setKeywords((prev) => {
            return prev.filter((item) => {
                return item._id !== record._id
            })
        })

        message.success(
            `"${record.nameEn}" removed from group successfully`
        )
    }

    const handleDeleteKeyword =
        async (record) => {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text:
                    'Do you really want to delete this keyword?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText:
                    'Yes, delete it!',
                cancelButtonText: 'No',
                confirmButtonColor:
                    '#ef4444',
                cancelButtonColor:
                    '#1677ff',
            })

            if (!result.isConfirmed) return

            try {
                await deleteKeyword({
                    id: record._id,
                    access_token,
                })

                const nextPage =
                    keywords.length === 1 &&
                        currentPage > 1
                        ? currentPage - 1
                        : currentPage

                if (nextPage !== currentPage) {
                    setCurrentPage(nextPage)
                } else {
                    await refetchGroupKeywords({
                        page: nextPage,
                    })
                }

                await Swal.fire({
                    title: 'Deleted!',
                    text:
                        'The keyword has been deleted.',
                    icon: 'success',
                    timer: 1300,
                    showConfirmButton: false,
                })
            } catch (error) {
                await Swal.fire({
                    title: 'Delete failed!',
                    text:
                        error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        error?.message ||
                        'Unable to delete this keyword.',
                    icon: 'error',
                })
            }
        }

    const handleDeleteGroupKeyword =
        async () => {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text:
                    'Do you really want to delete this group keyword?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText:
                    'Yes, delete it!',
                cancelButtonText: 'No',
                confirmButtonColor:
                    '#ef4444',
                cancelButtonColor:
                    '#1677ff',
            })

            if (!result.isConfirmed) return

            await deleteKeywordGroup({
                id: currentGroup?._id,
                access_token,
                moveKeywordsToUngrouped: true,
            })

            await Swal.fire({
                title: 'Deleted!',
                text:
                    'The group keyword has been deleted.',
                icon: 'success',
                timer: 1300,
                showConfirmButton: false,
            })

            navigate(
                '/keyword?tab=keyword-groups'
            )
        }

    return {
        navigate,
        access_token,
        currentGroup,
        sourceGroups,
        detailLoading,

        search,
        setSearch,

        keywords,
        availableKeywords,
        groupOptions,

        currentPage,
        pageSize,
        total:
            groupKeywordPagination?.total || 0,
        tableLoading:
            groupKeywordsLoading,

        setGroupDetail,

        openAddKeyword,
        setOpenAddKeyword,

        openTransfer,
        setOpenTransfer,
        transferRecord,
        setTransferRecord,

        openEditKeyword,
        setOpenEditKeyword,
        editingRecord,
        setEditingRecord,

        openEditGroupKeyword,
        setOpenEditGroupKeyword,

        handleTableChange,
        handleAddExisting,
        handleCreateAndAdd,
        handleOpenTransfer,
        handleTransfer,
        handleOpenEdit,
        handleKeywordUpdated,
        handleRemoveFromGroup,
        handleDeleteKeyword,
        handleDeleteGroupKeyword,
    }
}

export default useKeywordGroupDetail