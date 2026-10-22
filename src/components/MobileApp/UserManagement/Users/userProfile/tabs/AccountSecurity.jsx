import React from 'react'
import { Image } from 'antd'
import AccountSecurityImgIcon from '../../../../../../assets/icon/user/AccountSecurityEmptyState.svg'
import AccountActivities from './AccountSecurity/AccountActivities'
export default function AccountSecurity({ userId,

    access_token }) {
    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl  overflow-hidden">
            <AccountActivities

                userId={userId}

                access_token={access_token}

            />
        </div>
    )
}