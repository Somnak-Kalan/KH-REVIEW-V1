// ui/bannerColumns.js (columns extracted - same logic) ✅ NO JSX

import React from 'react'
import { Avatar, Button, Tooltip, Tag } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    ShareAltOutlined,
    MessageOutlined,
    ExportOutlined,
} from '@ant-design/icons'

const h = React.createElement

export const getBannerColumns = ({
    activeTab,
    handleView,
    handleEdit,
    checkPermission,
    PERMS,
    access_token,
    showAlert,
    getBannerList,
    currentTabState,
    renderStatusTag,
    handleUpdateStatus,
    CountdownTimer,
    dayjs,
}) => {
    const localRenderStatusTag = (status) => {
        const s = String(status || '').toLowerCase()
        switch (s) {
            case 'active':
                return h(Tag, { color: '#16a34a', className: 'px-4 ' }, 'Active')
            case 'inactive':
                return h(Tag, { color: '#6b7280', className: 'px-3 ' }, 'Inactive')
            case 'expired':
                return h(Tag, { color: '#dc2626', className: 'px-3 ' }, 'Expired')
            case 'pending':
                return h(Tag, { color: '#CA8A04', className: 'px-3 ' }, 'Pending')
            default:
                return h(Tag, null, 'Unknown')
        }
    }

    return [
        {
            title: 'Banner Details',
            key: 'banner_details',
            render: (_, record) =>
                h(
                    'div',
                    { className: 'flex items-center gap-2' },
                    h(Avatar, { size: 28, shape: 'square', src: record?.image?.small?.en?.url }),
                    h(
                        'div',
                        {
                            className: 'leading-tight cursor-pointer text-blue-500',
                            onClick: () => handleView(record),
                        },
                        h(
                            'div',
                            { className: 'flex flex-col items-start leading-[1.05] ' },
                            h(
                                'p',
                                {
                                    className:
                                        'm-0 p-0  cursor-pointer font-bold text-blue-800 hover:underline',
                                },
                                record?.titleEn
                            ),
                            h(
                                'p',
                                {
                                    className:
                                        'm-0 p-0 my-1 cursor-pointer font-semibold text-gray-500 hover:underline',
                                },
                                record?.titleKh
                            )
                        )
                    )
                ),
        },

        {
            title: 'Provinces',
            dataIndex: 'provinces',
            key: 'provinces',
            render: (provinces = []) => {
                const remaining = (provinces || []).slice(3)

                return h(
                    'div',
                    { className: 'flex flex-wrap items-center gap-1' },
                    h(
                        'svg',
                        {
                            width: '15',
                            height: '15',
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            xmlns: 'http://www.w3.org/2000/svg',
                        },
                        h('circle', { cx: '12', cy: '7', r: '5', stroke: 'black', strokeWidth: '2' }),
                        h('circle', { cx: '14', cy: '7', r: '1.5', fill: 'black' }),
                        h('path', {
                            d: 'M12 12L12 22',
                            stroke: 'black',
                            strokeWidth: '2',
                            strokeLinecap: 'round',
                        })
                    ),
                    h(
                        'span',
                        null,
                        (provinces || []).map((item) => item?.provinceEn).join(', ')
                    ),
                    remaining?.length > 0
                        ? h(
                            Tooltip,
                            { title: remaining.map((p) => p?.provinceEn).join(', ') },
                            h(
                                'span',
                                { className: 'text-blue-500 text-xs px-2 py-1 cursor-pointer' },
                                `+${remaining.length} ...`
                            )
                        )
                        : null
                )
            },
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, r) =>
                h(
                    'div',
                    { className: 'flex flex-wrap items-center gap-1' },
                    localRenderStatusTag(r?.status)
                ),
        },

        ...(activeTab === 'category'
            ? [
                {
                    title: 'Category',
                    dataIndex: 'category',
                    key: 'category',
                    render: (category) =>
                        h(
                            'div',
                            { className: 'text-sm text-gray-700' },
                            h(
                                'p',
                                { className: 'text-sm font-semibold' },
                                category?.nameEn || 'Department'
                            ),
                            h(
                                'p',
                                { className: 'text-xs text-gray-500 truncate w-48' },
                                category?.nameKh || 'កន្លែងស្នាក់នៅ'
                            )
                        ),
                },
                {
                    title: 'Sub Category',
                    dataIndex: 'category',
                    key: 'category_sub',
                    render: (category) =>
                        h(
                            'div',
                            { className: 'text-sm text-gray-700' },
                            h('p', { className: 'text-sm font-semibold' }, category?.nameEn || 'Bed'),
                            h(
                                'p',
                                { className: 'text-xs text-gray-500 truncate w-48' },
                                category?.nameKh || 'បន្ទប់'
                            )
                        ),
                },
            ]
            : []),

        {
            title: 'Schedule',
            key: 'schedule_details',
            width: 350,
            render: (_, record) => {
                const startDate = record.startDate ? dayjs(record.startDate) : null
                const endDate = record.endDate ? dayjs(record.endDate) : null

                const durationDays =
                    record?.schedule?.specificDays ??
                    record?.duration ??
                    (startDate && endDate ? endDate.diff(startDate, 'day') : null)

                return h(
                    'div',
                    { className: 'flex flex-col items-start leading-tight gap-0.5 p-2' },
                    startDate
                        ? h(
                            'span',
                            { className: 'text-xs text-gray-500' },
                            h('strong', null, 'Starts:'),
                            ' ',
                            startDate.format('MMM D, YYYY [at] h:mm A')
                        )
                        : null,
                    endDate
                        ? h(
                            'span',
                            { className: 'text-xs text-gray-500' },
                            h('strong', null, 'Ends:'),
                            ' ',
                            endDate.format('MMM D, YYYY [at] h:mm A')
                        )
                        : null,
                    durationDays != null
                        ? h(
                            'span',
                            { className: 'text-xs text-gray-500' },
                            h('strong', null, 'Duration:'),
                            ' ',
                            `${durationDays} day${durationDays > 1 ? 's' : ''}`
                        )
                        : null,
                    h(CountdownTimer, {
                        startDate: record?.startDate,
                        endDate: record?.endDate,
                        schedule: record?.schedule,
                        status: record?.scheduleStatus,
                        onExpired: () => handleUpdateStatus(record, 'Expired'),
                    })
                )
            },
        },

        {
            title: 'Interaction',
            key: 'interaction_details',
            render: (_, record) =>
                h(
                    React.Fragment,
                    null,
                    record?.action?.type === 'Chat Support'
                        ? h(
                            'div',
                            { className: 'flex items-center py-1 rounded text-sm text-green-700 bg-green-100 ' },
                            h('span', { className: 'text-xs px-2 ' }, 'Chat Available')
                        )
                        : null,
                    record?.action?.type === 'DetailOnly'
                        ? h(
                            'div',
                            { className: 'flex justify-center py-1 items-center gap-1 bg-gray-500 rounded ' },
                            h('span', { className: 'text-xs text-white ' }, record?.action?.type)
                        )
                        : null,
                    record?.action?.type === 'ActionButton'
                        ? h(
                            'div',
                            { className: 'flex items-center gap-1 px-2  py-1 text-white bg-red-500 rounded' },
                            h('span', { className: 'text-xs' }, record?.action?.type)
                        )
                        : null
                ),
        },

        {
            title: 'Place',
            dataIndex: 'place',
            key: 'place',
            render: (_, record) => {
                const place = record?.targeting?.place
                if (!place) {
                    return h('span', { className: 'text-xs text-gray-500' }, 'Place Not Selected Yet')
                }

                return h(
                    'div',
                    { className: 'flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg w-fit max-w-[260px]' },
                    h(
                        'div',
                        { className: 'min-w-0' },
                        h(
                            'p',
                            { className: 'text-sm font-semibold truncate' },
                            `${place?.nameEn || '-'} `,
                            h(
                                'span',
                                { className: 'text-xs font-normal text-gray-500' },
                                `(${place?.nameKh || '-'})`
                            )
                        )
                    )
                )
            },
        },

        {
            title: 'Engagement',
            key: 'performance',
            render: (_, record) =>
                h(
                    'div',
                    { className: 'text-xs space-y-1' },
                    h(
                        'div',
                        { className: 'flex items-center gap-2' },
                        h('span', { role: 'img', 'aria-label': 'view' }, h(EyeOutlined, { className: 'text-blue-500' }), ' '),
                        '0',
                        h(
                            'span',
                            { role: 'img', 'aria-label': 'click' },
                            h(
                                'svg',
                                {
                                    width: '12',
                                    height: '12',
                                    viewBox: '0 0 24 24',
                                    fill: 'none',
                                    xmlns: 'http://www.w3.org/2000/svg',
                                },
                                h('circle', { cx: '12', cy: '12', r: '10', stroke: '#4CAF50', strokeWidth: '2' }),
                                h('circle', { cx: '12', cy: '12', r: '6', stroke: '#4CAF50', strokeWidth: '2' }),
                                h('circle', { cx: '12', cy: '12', r: '2', fill: '#4CAF50' })
                            )
                        ),
                        ' 0 ',
                        h('span', { role: 'img', 'aria-label': 'share' }, h(ShareAltOutlined, null)),
                        ' 0 ',
                        h(
                            'div',
                            null,
                            h(
                                'span',
                                { role: 'img', 'aria-label': 'details', className: 'text-purple-600 cursor-pointer flex items-center gap-1' },
                                h(ExportOutlined, { style: { width: '10px' } }),
                                ` ${(record?.details ?? 0)} details`
                            ),
                            Object.keys(record?.place || {}).length === 0
                                ? ''
                                : h(
                                    'div',
                                    { className: ' items-center gap-2 mt-1' },
                                    h(
                                        'div',
                                        { className: 'flex' },
                                        h(
                                            'span',
                                            { role: 'img', 'aria-label': 'chat', className: 'text-green-500 flex items-center gap-1' },
                                            h(MessageOutlined, { style: { width: '10px' } }),
                                            ` ${(record?.chats ?? 0)}`
                                        )
                                    )
                                )
                        )
                    )
                ),
        },

        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_, record) =>
                h(
                    'span',
                    { className: 'text-gray-500 text-sm flex' },
                    h(
                        'p',
                        null,
                        h(
                            'svg',
                            {
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 640 640',
                                className:
                                    'w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors duration-200',
                                fill: 'currentColor',
                            },
                            h('path', {
                                d: 'M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z',
                            })
                        )
                    ),
                    ' ',
                    h(
                        'div',
                        null,
                        h('p', { className: 'm-0 p-0' }, dayjs(record?.created).format('MMM D, YYYY')),
                        h('p', { className: 'm-0 p-0' }, `by ${record?.created_by}`)
                    )
                ),
        },

        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) =>
                h(
                    'div',
                    { className: 'flex justify-center gap-2' },

                    h(
                        Tooltip,
                        { title: 'View' },
                        h(Button, {
                            icon: h(EyeOutlined, { style: { color: 'green', width: '12px' } }),
                            shape: 'circle',
                            style: { width: '12px' },
                            size: 'small',
                            onClick: () => handleView(record),
                        })
                    ),

                    h(
                        Tooltip,
                        { title: 'Edit' },
                        h(Button, {
                            icon: h(EditOutlined, null),
                            shape: 'circle',
                            size: 'small',
                            onClick: () => handleEdit(record),
                            disabled: !checkPermission(PERMS.ASSIGNED_USER),
                        })
                    ),

                    h(Button, {
                        icon: h(DeleteOutlined, null),
                        shape: 'circle',
                        size: 'small',
                        danger: true,
                        disabled: !checkPermission(PERMS.ASSIGNED_USER),
                        onClick: () =>
                            showAlert({
                                record,
                                access_token,
                                getBannerList: () =>
                                    getBannerList(activeTab, {
                                        search: currentTabState.searchQuery,
                                        status: currentTabState.filterStatus,
                                    }),
                            }),
                    })
                ),
        },
    ]
}
