import React, { useCallback, useEffect, useState } from 'react'
import { Button, Modal, Switch, Image, message } from 'antd'
import { StarOutlined } from '@ant-design/icons'
import './ManageRestrict.css'
import CommentRestrictIcon from '../../../../../../../assets/icon/user/CommentRestrict.svg'
import NoteIcon from '../../../../../../../assets/icon/setting/general/Note.svg'
import {
    getUserRestrictions,
    updateUserRestriction,
} from '../../../../../../../services/MobileApp/User/userProfile'

const reasons = [
    'Violates community guidelines',
    'Spam or excessive promotion',
    'Misleading or false information',
    'Inappropriate or offensive content',
    'Irrelevant to the mentioned place',
    'Low-quality or unclear content',
    'Duplicate or repetitive content',
    'Unauthorized advertising',
]

const reasonMap = {
    'Violates community guidelines': 'GUIDELINES',
    'Spam or excessive promotion': 'SPAM',
    'Misleading or false information': 'MISLEADING',
    'Inappropriate or offensive content': 'OFFENSIVE',
    'Irrelevant to the mentioned place': 'IRRELEVANT',
    'Low-quality or unclear content': 'LOW_QUALITY',
    'Duplicate or repetitive content': 'DUPLICATE',
    'Unauthorized advertising': 'ADVERTISING',
}

const reasonLabelMap = {
    GUIDELINES: 'Violates community guidelines',
    SPAM: 'Spam or excessive promotion',
    MISLEADING: 'Misleading or false information',
    OFFENSIVE: 'Inappropriate or offensive content',
    IRRELEVANT: 'Irrelevant to the mentioned place',
    LOW_QUALITY: 'Low-quality or unclear content',
    DUPLICATE: 'Duplicate or repetitive content',
    ADVERTISING: 'Unauthorized advertising',
}

const defaultItems = [
    {
        key: 'postMoment',
        title: 'Post Moment',
        desc: 'Create and share moments',
        icon: <Image src={NoteIcon} preview={false} />,
    },
    {
        key: 'comment',
        title: 'Comment',
        desc: 'Leave comments on content',
        icon: <Image src={CommentRestrictIcon} preview={false} />,
    },
    {
        key: 'review',
        title: 'Review',
        desc: 'Write reviews for places',
        icon: <StarOutlined />,
    },
]

const formatDate = (date) => {
    if (!date) return '-'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(date))
}

const getToken = () => {
    return (
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('admin_access_token') ||
        ''
    )
}

const getApiSource = (data) => {
    return data?.data || data?.result || data?.payload || data || {}
}

const findCapabilityFromList = (list, key) => {
    if (!Array.isArray(list)) return null

    return list.find((item) => {
        return (
            item?.capability === key ||
            item?.key === key ||
            item?.type === key ||
            item?.name === key
        )
    })
}

const getReasonLabel = (reason) => {
    return reasonLabelMap[reason] || reason || '-'
}

const getUserText = (value) => {
    if (!value) return '-'
    if (typeof value === 'string') return value
    return value.username || value.name || value.fullName || value._id || '-'
}

const getRestrictionValue = (data, key) => {
    const source = getApiSource(data)

    const restrictions = source?.restrictions || {}
    const restrictionLogs = Array.isArray(source?.restrictionLogs)
        ? source.restrictionLogs
        : []

    let restrictionValue = restrictions?.[key]

    if (restrictionValue && typeof restrictionValue === 'object') {
        if (restrictionValue.isRestricted !== undefined) {
            restrictionValue = restrictionValue.isRestricted
        } else {
            restrictionValue =
                restrictionValue.value ??
                restrictionValue.restricted ??
                restrictionValue.isRestricted
        }
    }

    const logs = restrictionLogs.filter((log) => {
        return log?.capability === key
    })

    return {
        // API false = switch OFF
        // API true = switch ON
        isRestricted: restrictionValue === true,
        histories: logs,
    }
}

const normalizeHistories = (histories = []) => {
    if (!Array.isArray(histories)) return []

    const sortedLogs = [...histories].sort((a, b) => {
        return new Date(a.changedAt || a.createdAt || 0) - new Date(b.changedAt || b.createdAt || 0)
    })

    const rows = []

    sortedLogs.forEach((history, index) => {
        const isRestrictLog = history.value === true
        const isAllowLog = history.value === false

        if (isRestrictLog) {
            rows.push({
                id: history.id || history._id || `${Date.now()}-${index}`,
                reason:
                    reasonLabelMap[history.reason] ||
                    history.reason ||
                    '-',
                restrictedAt:
                    history.restrictedAt ||
                    history.changedAt ||
                    history.createdAt ||
                    history.updatedAt ||
                    null,
                restrictedBy:
                    history.restrictedBy ||
                    history.changedBy ||
                    history.createdBy ||
                    history.updatedBy ||
                    '-',
                allowedAt: null,
                allowedBy: '',
            })
        }

        if (isAllowLog) {
            let lastRestrictedIndex = -1

            rows.forEach((row, rowIndex) => {
                if (!row.allowedAt) {
                    lastRestrictedIndex = rowIndex
                }
            })

            if (lastRestrictedIndex !== -1) {
                rows[lastRestrictedIndex] = {
                    ...rows[lastRestrictedIndex],
                    allowedAt:
                        history.allowedAt ||
                        history.changedAt ||
                        history.updatedAt ||
                        history.createdAt ||
                        null,
                    allowedBy:
                        history.allowedBy ||
                        history.changedBy ||
                        history.updatedBy ||
                        history.createdBy ||
                        '',
                }
            }
        }
    })

    return rows.reverse()
}
const ManageRestriction = ({
    userId,
    access_token,
    currentUserName = 'sovarna',
}) => {
    const [items, setItems] = useState(
        defaultItems.map((item) => ({
            ...item,
            isRestricted: false,
            histories: [],
        })),
    )

    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedReason, setSelectedReason] = useState('')
    const [restrictOpen, setRestrictOpen] = useState(false)
    const [allowOpen, setAllowOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const token = access_token || getToken()

    const fetchRestrictions = useCallback(async () => {
        if (!userId || !token) return

        try {
            setLoading(true)

            const data = await getUserRestrictions({
                userId,
                access_token: token,
            })


            setItems(
                defaultItems.map((item) => {
                    const restriction = getRestrictionValue(data, item.key)

                    return {
                        ...item,
                        isRestricted: restriction.isRestricted,
                        histories: normalizeHistories(restriction.histories, restriction),
                    }
                }),
            )
        } catch (error) {
            message.error(error?.message || 'Failed to load restrictions')
        } finally {
            setLoading(false)
        }
    }, [userId, token])

    useEffect(() => {
        fetchRestrictions()
    }, [fetchRestrictions])

    // Switch ON = Restricted, Switch OFF = Allowed
    const onSwitchChange = (checked, item) => {
        setSelectedItem(item)

        if (checked) {
            setSelectedReason('')
            setRestrictOpen(true)
        } else {
            setAllowOpen(true)
        }
    }

    const updateRestrictionApi = async ({ capability, reason, value }) => {
        if (!userId || !token) return

        return updateUserRestriction({
            userId,
            access_token: token,
            capability,
            reason,
            value,
        })
    }
    const onRestrict = async () => {
        if (!selectedItem || !selectedReason) return

        const now = new Date().toISOString()
        const apiReason = reasonMap[selectedReason] || selectedReason

        try {
            setSaving(true)

            await updateRestrictionApi({
                capability: selectedItem.key,
                reason: apiReason,
                value: true,
            })

            setItems((prev) =>
                prev.map((item) => {
                    if (item.key !== selectedItem.key) return item

                    const newHistory = {
                        id: `${Date.now()}-${selectedItem.key}`,
                        reason: selectedReason,
                        restrictedAt: now,
                        restrictedBy: currentUserName,
                        allowedAt: null,
                        allowedBy: '',
                    }

                    return {
                        ...item,
                        isRestricted: true,

                        // new history stay first
                        histories: [
                            newHistory,
                            ...(item.histories || []),
                        ],
                    }
                }),
            )

            message.success(`${selectedItem.title} restricted successfully`)
            setRestrictOpen(false)
            setSelectedItem(null)
            setSelectedReason('')
        } catch (error) {
            message.error(error?.message || 'Failed to restrict user')
        } finally {
            setSaving(false)
        }
    }
    const onAllow = async () => {
        if (!selectedItem) return

        const currentItem = selectedItem
        const now = new Date().toISOString()

        const histories = currentItem.histories || []

        const lastRestrictedHistory =
            histories.find((history) => !history.allowedAt) ||
            histories[0] ||
            null

        const lastReason = lastRestrictedHistory?.reason
        const apiReason = reasonMap[lastReason] || lastReason || 'SPAM'

        try {
            setSaving(true)

            await updateRestrictionApi({
                capability: currentItem.key,
                reason: apiReason,
                value: false,
            })

            setItems((prev) =>
                prev.map((item) => {
                    if (item.key !== currentItem.key) return item

                    const histories = [...(item.histories || [])]

                    // newest-first: update first open restricted history
                    const restrictedIndex = histories.findIndex(
                        (history) => !history.allowedAt
                    )

                    if (restrictedIndex !== -1) {
                        histories[restrictedIndex] = {
                            ...histories[restrictedIndex],
                            allowedAt: now,
                            allowedBy: currentUserName,
                        }
                    }

                    return {
                        ...item,
                        isRestricted: false,
                        histories,
                    }
                }),
            )

            message.success(`${currentItem.title} allowed successfully`)
            setAllowOpen(false)
            setSelectedItem(null)

            fetchRestrictions()
        } catch (error) {
            message.error(
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to allow user'
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="">
            <div className="restriction-card">
                <h3>Manage Restrictions</h3>

                {items.map((item) => (
                    <div className="restriction-item" key={item.key}>
                        <div className="restriction-header">
                            <div className="restriction-user">
                                <div className="restriction-icon">{item.icon}</div>

                                <div>
                                    <div className="restriction-name">{item.title}</div>
                                    <div className="restriction-desc">{item.desc}</div>
                                </div>
                            </div>

                            <div className="restriction-action">
                                <span
                                    className={
                                        item.isRestricted
                                            ? 'text-restricted'
                                            : 'text-allowed'
                                    }
                                >
                                    {item.isRestricted ? 'Restricted' : 'Allowed'}
                                </span>

                                <Switch
                                    size="small"
                                    checked={item.isRestricted}
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                    loading={loading}
                                    onChange={(checked) =>
                                        onSwitchChange(checked, item)
                                    }
                                />
                            </div>
                        </div>

                        {!!item.histories?.length && (
                            <div className="restriction-history">
                                {item.histories.map((history) => (
                                    <div
                                        className="restriction-history-row"
                                        key={history.id}
                                    >
                                        <span>
                                            Reason : <b>{history.reason || '-'}</b>
                                        </span>

                                        <div>
                                            <span>
                                                Restricted :{' '}
                                                {formatDate(history.restrictedAt)} by{' '}
                                                {history.restrictedBy || '-'}
                                            </span>

                                            {history.allowedAt && (
                                                <span>
                                                    Allowed :{' '}
                                                    {formatDate(history.allowedAt)} by{' '}
                                                    {history.allowedBy || '-'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                open={restrictOpen}
                footer={null}
                centered
                width={560}
                onCancel={() => setRestrictOpen(false)}
            >
                <h3 className="modal-title">Restrict {selectedItem?.title}</h3>
                <p className="modal-text">
                    Please provide a reason for this restriction. This message will be sent to the user.
                </p>

                <div className="reason-list">
                    {reasons.map((reason) => (
                        <button
                            key={reason}
                            type="button"
                            className={
                                selectedReason === reason
                                    ? 'reason-chip active'
                                    : 'reason-chip'
                            }
                            onClick={() => setSelectedReason(reason)}
                        >
                            {reason}
                        </button>
                    ))}
                </div>

                <div className="modal-actions">
                    <Button onClick={() => setRestrictOpen(false)}>Cancel</Button>
                    <Button
                        danger
                        type="primary"
                        disabled={!selectedReason}
                        loading={saving}
                        onClick={onRestrict}
                    >
                        Restrict {selectedItem?.title}
                    </Button>
                </div>
            </Modal>

            <Modal
                open={allowOpen}
                footer={null}
                centered
                width={470}
                onCancel={() => setAllowOpen(false)}
            >
                <h3 className="modal-title">Allow {selectedItem?.title}</h3>
                <p className="modal-text">
                    Are you sure you want to allow this user again?
                </p>

                <div className="modal-actions">
                    <Button onClick={() => setAllowOpen(false)}>Cancel</Button>
                    <Button type="primary" loading={saving} onClick={onAllow}>
                        Allow {selectedItem?.title}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default ManageRestriction