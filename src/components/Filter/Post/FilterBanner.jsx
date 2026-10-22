import { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { Button, DatePicker, Input, Select, Space, Tooltip } from 'antd'
import {
    SwapOutlined,
    SearchOutlined,
    FilterOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useAdminUsersStore } from '../../../Stores/AdminUser/AdminUser'
import { AuthContext } from '../../../contexts/AuthContext'
import SwitchViewMode from '../../../components/Action/Switch/SwitchViewMode'

const { RangePicker } = DatePicker
const { Option } = Select

const SearchAction = ({
    viewMode,
    onSwitchView,
    onReorder,
    isShowStatus = false,
    onSearchChange = () => { },
    onStatusChange = () => { },
    onCreatedByChange = () => { },
    onDateRangeChange = () => { },
    onMomentTypeChange = () => { },
    searchFrom = '',
    searchName = '...',
    reOrder = true,
}) => {
    const [localSearch, setLocalSearch] = useState('')
    const [localStatus, setLocalStatus] = useState('all')
    const [localCreatedBy, setLocalCreatedBy] = useState('all')
    const [localRange, setLocalRange] = useState(null)
    const [localMomentType, setLocalMomentType] = useState('all')

    const { access_token } = useContext(AuthContext)

    const isUserProfile = searchFrom === 'user_profile'

    const users = useAdminUsersStore((s) => s.users || [])
    const loading = useAdminUsersStore((s) => s.loading)
    const error = useAdminUsersStore((s) => s.error)
    const fetchUsers = useAdminUsersStore((s) => s.fetchUsers)

    const didFetchRef = useRef(false)

    useEffect(() => {
        if (!access_token) return

        // In user profile page, no need fetch creator list
        if (isUserProfile) return

        if (users.length > 0) {
            didFetchRef.current = true
            return
        }

        if (didFetchRef.current) return
        didFetchRef.current = true

        fetchUsers(access_token)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [access_token, users.length, isUserProfile])

    const userOptions = useMemo(() => {
        return (users || []).map((u) => ({
            key: u?._id,
            value: u?._id,
            label: u?.name || u?.username || u?.email,
        }))
    }, [users])

    if (error) {
        return <div>Error: {error?.message || 'Something went wrong'}</div>
    }

    const handleSearchChange = (e) => {
        const value = e.target.value
        setLocalSearch(value)
        onSearchChange(value)
    }

    const handleStatusChange = (value) => {
        const v = value ?? 'all'
        setLocalStatus(v)
        onStatusChange(v)
    }

    const handleCreatedByChange = (value) => {
        const v = value ?? 'all'
        setLocalCreatedBy(v)
        onCreatedByChange(v)
    }

    const handleRangeChange = (dates) => {
        setLocalRange(dates)
        onDateRangeChange(dates || [])
    }

    const handleMomentTypeChange = (value) => {
        const v = value ?? 'all'
        setLocalMomentType(v)
        onMomentTypeChange(v)
    }

    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Space wrap size="small">
                <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={`Search ${searchName}`}
                    value={localSearch}
                    onChange={handleSearchChange}
                    style={{ minWidth: 200 }}
                />

                {isShowStatus === false && (
                    <Select
                        value={localStatus}
                        onChange={handleStatusChange}
                        style={{ width: 140 }}
                        suffixIcon={<FilterOutlined />}
                        allowClear
                    >
                        <Option value="all">All Status</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Expired">Expired</Option>
                    </Select>
                )}

                {isUserProfile && (
                    <RangePicker
                        value={localRange}
                        onChange={handleRangeChange}
                        allowClear
                        style={{ minWidth: 220 }}
                    />
                )}

                {!searchFrom && (
                    <RangePicker
                        value={localRange}
                        onChange={handleRangeChange}
                        allowClear
                        style={{ minWidth: 220 }}
                    />
                )}

                {!isUserProfile && (
                    <Select
                        value={localCreatedBy}
                        onChange={handleCreatedByChange}
                        style={{ width: 180 }}
                        suffixIcon={<UserOutlined />}
                        allowClear
                        loading={loading}
                        showSearch
                        optionFilterProp="label"
                    >
                        <Option value="all">All Creator</Option>

                        {userOptions.map((u) => (
                            <Option key={u.key} value={u.value} label={u.label}>
                                {u?.label}
                            </Option>
                        ))}
                    </Select>
                )}

                {isUserProfile && (
                    <Select
                        value={localMomentType}
                        onChange={handleMomentTypeChange}
                        style={{ width: 240 }}
                        allowClear
                    >
                        <Option value="all">All Moment</Option>
                        <Option value="post">Post</Option>
                        <Option value="video">Video</Option>
                    </Select>
                )}
            </Space>

            <Space size="small" wrap>
                <SwitchViewMode viewMode={viewMode} setViewMode={onSwitchView} />

                <Tooltip title="Reorder banner" hidden={!reOrder}>
                    <Button
                        hidden={!reOrder}
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => onReorder(true)}
                    >
                        Reorder
                    </Button>
                </Tooltip>
            </Space>
        </div>
    )
}

export default SearchAction