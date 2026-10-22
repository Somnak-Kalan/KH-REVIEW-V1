import { useMemo, useState, useEffect, useCallback } from 'react'
import { Tabs, Button, Checkbox, Empty, Spin } from 'antd'
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import FollowUpHeader from '../../../../components/MobileApp/UserManagement/Users/UserHeader'
import FollowUpFilters from '../../../../components/Filter/MobileApp/UserFilter'
import UserTable from '../../../../components/MobileApp/UserManagement/Users/UserTable'
import { getColumnsByTab } from '../../../../components/MobileApp/UserManagement/Users/userTableColumns'
import { useOutletContext, useNavigate } from 'react-router-dom'
import TableHeader from '../../../../widgets/TableHeader'
import PageStatus from '../../../../components/MobileApp/UserManagement/Status'
import UserCardGrid from '../../../../components/MobileApp/UserManagement/Users/userGrid'
import { useAppUserStore } from '../../../../Stores/MobilesApp/User/user.store'
import ImageLoading from '../../../../components/Loading/ImageLoading'
const TAB_KEYS = {
    all: 'all',
    normal: 'normal',
    creator: 'creator',
    owner: 'owner',
}

const formatDateOnly = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const formatDateTime = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const normalizeStatus = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'active') return 'Active'
    if (s === 'inactive') return 'Inactive'
    if (!s) return '-'
    return status
}

const normalizeGender = (gender) => {
    const s = String(gender || '').toLowerCase()
    if (s === 'male') return 'Male'
    if (s === 'female') return 'Female'
    if (s === 'other') return 'Other'
    return gender || '-'
}
const getSearchValue = (value = '') => {
    const raw = String(value || '').trim()
    if (!raw) return ''

    const isPhoneLike = /^[\d\s+()\-]+$/.test(raw)

    if (isPhoneLike) {
        return normalizePhone(raw)
    }

    return raw.replace(/\s+/g, '')
}
const normalizePhone = (phone = '') => {
    const digits = phone.replace(/\D/g, '')

    if (digits.startsWith('8550')) return `855${digits.slice(4)}`
    if (digits.startsWith('0')) return `855${digits.slice(1)}`
    if (digits.startsWith('855')) return digits

    return digits
}
const getUserType = (item) => {
    if (Number(item?.businessPlace || 0) > 0) return 'Business Owner'
    if (item?.creatorRequestStatus === 'approved') return 'Content Creator'
    return 'Normal'
}

export default function UserLists() {
    const navigate = useNavigate()
    const outletContext = useOutletContext() || {}

    // const { user } = useContext(AuthContext)
    // const [username, setUsername] = useState(user?.username)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [tab, setTab] = useState(TAB_KEYS.all)
    const VIEW_KEY = 'user_list_view'
    const FILTER_KEY = 'user_list_filters'
    // const VIEW_KEY = 'user_list_view'

    const [view, setView] = useState(() => {
        return localStorage.getItem(VIEW_KEY) || 'grid'
    })

    const [showViewSwitch] = useState(true)
    const [isFading, setIsFading] = useState(false)

    const getInitialFilters = () => {
        try {
            const saved = JSON.parse(sessionStorage.getItem(FILTER_KEY) || '{}')

            return {
                q: saved?.q || '',
                dateRange: null,
                gender: saved?.gender || 'all',
                status: saved?.status || 'all',
                businessOwner: saved?.businessOwner === true ? true : null,
                restrictedUser: saved?.restrictedUser === true ? true : null,
            }
        } catch {
            return {
                q: '',
                dateRange: null,
                gender: 'all',
                status: 'all',
                businessOwner: null,
                restrictedUser: null,
            }
        }
    }

    const [filters, setFilters] = useState(getInitialFilters)
    const users = useAppUserStore((state) => state.users)
    const apiPagination = useAppUserStore((state) => state.pagination)
    const loading = useAppUserStore((state) => state.loading)
    const fetchAppUsers = useAppUserStore((state) => state.fetchAppUsers)

    const access_token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('admin_access_token') ||
        ''
    const {
        collapsed = false,
        setDisplayEmitContent = () => { },
    } = outletContext
    const handleSwitchView = (next) => {
        if (next === view) return
        if (next === 'table') setCurrentPage(1)
        setIsFading(true)
        setTimeout(() => {
            setView(next)
            setIsFading(false)
        }, 120)
    }

    const onView = useCallback(
        (row, tabName = '') => {
            const userId = row?._id ?? row?.id ?? 1
            if (tabName) {
                navigate(`/app/user/profile/${userId}?tab=${tabName}`)
                return
            }

            navigate(`/app/user/profile/${userId}`)
        },
        [navigate],
    )
    useEffect(() => {
        sessionStorage.setItem(
            FILTER_KEY,
            JSON.stringify({
                q: filters.q || '',
                gender: filters.gender || 'all',
                status: filters.status || 'all',
                businessOwner: filters.businessOwner === true ? true : null,
                restrictedUser: filters.restrictedUser === true ? true : null,
            })
        )
    }, [
        filters.q,
        filters.gender,
        filters.status,
        filters.businessOwner,
        filters.restrictedUser,
    ])
    const mappedUsers = useMemo(() => {
        return (users || []).map((item, index) => {
            const likes = Number(item?.engagement?.likes || 0)
            const comments = Number(item?.engagement?.comments || 0)
            const shares = Number(item?.engagement?.shares || 0)
            const saves = Number(item?.engagement?.saves || 0)
            const total = likes + comments + shares + saves
            const userType = getUserType(item)

            return {
                _id: item?._id,
                id: item?._id || `row-${index}`,
                status: normalizeStatus(item?.status),
                name: item?.userProfile?.name || '-',
                nickname: '',
                phone: item?.userProfile?.phone || '-',
                email: '-',
                avatar: item?.userProfile?.profilePicture || '',
                avatarLetter: (item?.userProfile?.name || 'U')?.charAt(0)?.toUpperCase?.() || 'U',
                gender: normalizeGender(item?.gender),
                dob: formatDateOnly(item?.dateOfBirth),
                isRestricted: item?.isRestricted,
                engagement: {
                    total,
                    likes,
                    comments,
                    shares,
                    saves,
                },
                userType,
                followers: Number(item?.followers || 0),
                followings: Number(item?.followings || 0),
                moments: Number(item?.moments || 0),
                businessPlace: Number(item?.businessPlace || 0),
                updatedBy: item?.updatedBy || 'By App',
                createdBy: item?.createdBy || 'By App',
                createdAt: formatDateTime(item?.createdAt),
                updatedAt: '-',
            }
        })
    }, [users])

    const filteredUsers = useMemo(() => {
        let rows = [...mappedUsers]
        return rows
    }, [mappedUsers, tab, filters])

    const columns = useMemo(() => getColumnsByTab(tab, onView), [tab, onView])

    const stats = useMemo(() => {
        const total = filteredUsers.length
        const active = filteredUsers.filter(
            (x) => String(x.status).toLowerCase() === 'active'
        ).length
        const inactive = filteredUsers.filter(
            (x) => String(x.status).toLowerCase() === 'inactive'
        ).length
        return { total, active, inactive }
    }, [filteredUsers])
    useEffect(() => {
        setDisplayEmitContent(
            <div className="flex justify-between my-3">
                <FollowUpHeader />
            </div>
        )

        return () => {
            setDisplayEmitContent(null)
        }
    }, [setDisplayEmitContent])

    useEffect(() => {
        localStorage.setItem(VIEW_KEY, view)
    }, [view])

    useEffect(() => {
        const startDate = filters?.dateRange?.[0]?.format?.('YYYY-MM-DD') || ''
        const endDate = filters?.dateRange?.[1]?.format?.('YYYY-MM-DD') || ''


        fetchAppUsers({

            access_token,
            force: true,
            doc: {
                page: currentPage,
                size: pageSize,
                search: getSearchValue(filters?.q || ''),
                status: filters?.status === 'all' ? '' : filters?.status || '',
                gender: filters?.gender === 'all' ? '' : filters?.gender || '',
                isBusinessOwner: filters?.businessOwner === true ? true : '',
                isRestrictedUser: filters?.restrictedUser === true ? true : '',
                userType: tab === 'creator' ? 'content_creator' : tab === 'normal' ? 'normal' : 'all',
                startDate,
                endDate,
            },
        })

    }, [
        access_token,
        currentPage,
        pageSize,
        filters?.q,
        filters?.status,
        filters?.gender,
        filters?.dateRange,
        filters?.businessOwner,
        filters?.restrictedUser,
        tab,
        fetchAppUsers,
    ])

    const pagination = {
        current: Number(apiPagination?.page || currentPage),
        pageSize: Number(apiPagination?.size || pageSize),
        total: Number(apiPagination?.total || 0),
        onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
    }
    const renderContent = () => {
        if (loading) {
            return (
                <div className="py-14 flex justify-center">
                    <ImageLoading overlay={false} size={80} logoSize={40} />
                </div>
            )
        }

        if (filteredUsers.length === 0) {
            return (
                <div className="py-14">
                    <Empty description="No users found" />
                </div>
            )
        }

        if (view === 'grid') {
            return <UserCardGrid onView={onView} data={filteredUsers} tab={tab} pagination={pagination} />
        }

        return (
            <UserTable
                onView={onView}
                pagination={pagination}
                columns={columns}
                data={filteredUsers}
                loading={false}
            />
        )
    }

    return (
        <div className="">
            <div className="mt-1 ">
                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="">
                        <div className="rounded-xl bg-white dark:bg-slate-900">
                            <Tabs
                                activeKey={tab}
                                onChange={(key) => {
                                    setTab(key)
                                    setCurrentPage(1)
                                }}
                                className="px-4 apply-tab-text"
                                items={[
                                    { key: TAB_KEYS?.all, label: 'All' },
                                    { key: TAB_KEYS?.normal, label: 'Normal' },
                                    { key: TAB_KEYS?.creator, label: 'Content Creator' },
                                ]}
                            />
                            <div className="mx-5">
                                <PageStatus stats={apiPagination} />
                            </div>

                            <div className="mx-2">

                                <FollowUpFilters
                                    value={filters}
                                    onChange={(next) => {
                                        setCurrentPage(1)
                                        setFilters((prev) => ({
                                            ...prev,
                                            ...next,
                                        }))
                                    }}
                                />
                            </div>

                            <TableHeader
                                total={apiPagination?.total || filteredUsers?.length || 0}
                                label="Total Amount"
                                className="border-none"
                                extra={
                                    <div className="create-user-btn">
                                        <Button type="primary" className="rounded-xl">
                                            + Create User
                                        </Button>
                                    </div>
                                }
                                prefixText={
                                    <>
                                        {showViewSwitch ? (
                                            <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                                                <Button
                                                    type={view === 'grid' ? 'primary' : 'text'}
                                                    size="small"
                                                    className={`rounded-full !w-9 !h-9 flex items-center justify-center ${view === 'grid'
                                                        ? 'bg-blue-600 hover:bg-blue-600'
                                                        : 'text-slate-700 dark:text-slate-200'
                                                        }`}
                                                    icon={<AppstoreOutlined />}
                                                    onClick={() => handleSwitchView?.('grid')}
                                                />
                                                <Button
                                                    type={view === 'table' ? 'primary' : 'text'}
                                                    size="small"
                                                    className={`rounded-full !w-9 !h-9 flex items-center justify-center ${view === 'table'
                                                        ? 'bg-blue-600 hover:bg-blue-600'
                                                        : 'text-slate-700 dark:text-slate-200'
                                                        }`}
                                                    icon={<UnorderedListOutlined />}
                                                    onClick={() => handleSwitchView?.('table')}
                                                />
                                            </div>
                                        ) : null}
                                    </>
                                }
                                suffixText={
                                    <>

                                        <Checkbox
                                            checked={filters.businessOwner === true}
                                            onChange={(e) => {
                                                const checked = e.target.checked

                                                setCurrentPage(1)
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    businessOwner: checked ? true : null,
                                                }))
                                            }}
                                            className="text-[13px] text-slate-500 dark:text-slate-300"
                                        >
                                            Business Owner
                                        </Checkbox>

                                        <Checkbox
                                            checked={filters.restrictedUser === true}
                                            onChange={(e) => {
                                                const checked = e.target.checked

                                                setCurrentPage(1)
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    restrictedUser: checked ? true : null,
                                                }))
                                            }}
                                            className="text-[13px] text-slate-500 dark:text-slate-300"
                                        >
                                            Restricted User
                                        </Checkbox>
                                    </>
                                }
                            >
                                <div
                                    className={`transition-all duration-200 ${isFading
                                        ? 'opacity-0 translate-y-1'
                                        : 'opacity-100 translate-y-0'
                                        }`}
                                >
                                    {renderContent()}
                                </div>
                            </TableHeader>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}