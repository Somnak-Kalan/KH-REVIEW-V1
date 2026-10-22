import React from 'react'
import { Tabs } from 'antd'

export default function PageTopTabAntd({ activeKey = 'profile', onChange }) {
    return (
        <Tabs
            activeKey={activeKey}
            onChange={onChange}
            items={[
                { key: 'profile', label: <span className="font-semibold">User Profile</span> },
            ]}
            className="custom-tabs"
        />
    )
}