import React from 'react'
import { Button, Card, Input, Select, Segmented, Space } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

export default function AreaToolbar({
    viewMode,
    onChangeViewMode,
    searchText,
    onChangeSearchText,
    typeFilter,
    onChangeTypeFilter,
    statusFilter,
    onChangeStatusFilter,
    typeOptions = [],
    onAddArea,
    types = [
        { label: 'Riverine Floating', value: 'riverine_floating' },
        { label: 'Island Tourism', value: 'island_tourism' },
        { label: 'Coastal Beach', value: 'coastal_beach' },
        { label: 'Mountain Tourism', value: 'mountain_tourism' },
        { label: 'Eco Tourism', value: 'eco_tourism' },
        { label: 'Community Tourism', value: 'community_tourism' },
        { label: 'Agricultural Farm', value: 'agricultural_farm' },
        { label: 'Night Street', value: 'night_street' },
    ],
}) {
    return (
        <Card
            style={{ borderRadius: 10 }}
            className="dark:bg-slate-900 dark:border dark:border-slate-700"
            styles={{ body: { padding: 16 } }}

        >
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                }}
            >
                <div className="dark:text-slate-200">
                    <Segmented
                        value={viewMode}
                        onChange={onChangeViewMode}
                        options={[
                            { label: 'Table', value: 'table' },
                            { label: 'Grid', value: 'grid' },
                        ]}
                        className="dark:bg-slate-800 dark:text-slate-200"
                    />
                </div>

                <Space wrap>
                    <Input
                        value={searchText}
                        onChange={(e) => onChangeSearchText(e.target.value)}
                        placeholder="Search areas..."
                        prefix={<SearchOutlined className="dark:text-slate-300" />}
                        style={{ width: 240 }}
                        allowClear
                        className="dark:bg-slate-900 dark:text-slate-200"
                    />

                    <Select
                        allowClear
                        value={typeFilter}
                        onChange={onChangeTypeFilter}
                        style={{ width: 170 }}
                        className="dark:bg-slate-900"
                        styles={{
                            popup: {
                                root: {
                                    background: '#0f172a', // slate-900
                                    color: '#e2e8f0', // slate-200
                                },
                            },
                        }}
                        options={[
                            { value: 'all', label: 'All Types' },
                            ...types.map((t) => ({
                                value: t.value,
                                label: t.label,
                            })),
                        ]}
                    />

                    <Select
                        allowClear
                        value={statusFilter}
                        onChange={onChangeStatusFilter}
                        style={{ width: 150 }}
                        className="dark:bg-slate-900"
                        styles={{
                            popup: {
                                root: {
                                    background: '#0f172a', // slate-900
                                    color: '#e2e8f0', // slate-200
                                },
                            },
                        }}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                    />

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onAddArea}
                        className="dark:text-white"
                        style={{ background: '#1677ff' }}
                    >
                        Add Area
                    </Button>
                </Space>
            </div>
        </Card>
    )
}
