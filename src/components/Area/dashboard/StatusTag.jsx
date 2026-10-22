import React from 'react'
import { Tag } from 'antd'

export default function StatusTag({ value }) {
    const v = (value || '').toLowerCase()

    if (v === 'active') return <Tag color="green">active</Tag>
    if (v === 'inactive') return <Tag color="default">inactive</Tag>

    return <Tag>{value || 'unknown'}</Tag>
}
