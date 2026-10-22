import { DatePicker, Input, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

export default function FollowUpFilters({ value, onChange }) {
    const set = patch => onChange({ ...value, ...patch })

    return (
        <div className="rounded-xl dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-12">
                    <Input
                        allowClear
                        prefix={<SearchOutlined className="text-slate-400 " />}
                        placeholder="Search by (id,name,phone number) ..."
                        value={value.q}
                        onChange={e => set({ q: e.target.value })}
                        className="rounded-md"
                    />
                </div>

                <div className="md:col-span-5">
                    <RangePicker
                        className="w-full rounded-md dark-range font-semibold"
                        placeholder={['Start date', 'End date']}
                        value={value.dateRange}
                        onChange={v => set({ dateRange: v })}
                    />
                </div>

                <div className="md:col-span-4">
                    <Select
                        className="w-full dark-select"
                        value={value.gender}
                        onChange={v => set({ gender: v })}
                        options={[
                            { value: 'all', label: 'All Gender' },
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                        ]}
                    />
                </div>

                <div className="md:col-span-3">
                    <Select
                        className="w-full dark-select"
                        value={value.status}
                        onChange={v => set({ status: v })}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
