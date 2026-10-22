// src/components/userProfile/ProfileSectionTabs.jsx

import React, { useMemo } from 'react'
import { Segmented } from 'antd'

export default function ProfileSectionTabs({
    value,
    onChange,
    creatorRequestStatus,
}) {
    const isCreatorApproved =
        String(creatorRequestStatus || '').toLowerCase() === 'approved'


    const options = useMemo(() => {
        return [
            ...(isCreatorApproved
                ? [{ label: 'Post', value: 'post' }]
                : []),

            { label: 'User Activity', value: 'user_activity' },
            { label: 'Business Places', value: 'business_places' },
            { label: 'Requests', value: 'requests' },
            { label: 'Manage Restriction', value: 'manage_restriction' },
            { label: 'Account Security', value: 'account_security' },
        ]
    }, [isCreatorApproved])

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between">
                <div className="w-full">
                    <Segmented
                        block
                        value={value}
                        onChange={onChange}
                        options={options}
                        className="profile-segmented rounded-full bg-[#ECECF0] p-1"
                    />
                </div>
            </div>
        </div>
    )
}