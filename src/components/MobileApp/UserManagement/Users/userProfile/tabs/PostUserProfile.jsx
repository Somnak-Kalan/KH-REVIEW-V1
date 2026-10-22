import React from 'react'
import { Image } from 'antd'
import PostEmptyStateImgIcon from '../../../../../../assets/icon/user/AccountSecurityEmptyState.svg'
export default function PostUserProfileDetail() {
    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl  overflow-hidden">
            {/* Title (left) */}
            <div className="">
                <div className="text-[14px] mt-5 font-semibold text-slate-900 dark:text-slate-400">
                    Posts
                </div>
            </div>

            {/* Center empty */}
            <div className="h-[520px] flex items-center justify-center">
                <div className="text-center">
                    <Image
                        preview={false}
                        src={PostEmptyStateImgIcon}
                        className="w-[140px] opacity-90"
                        alt="empty"
                    />
                    <div className="mt-3 text-xs text-slate-400">
                        There are not yet have posts.
                    </div>
                </div>
            </div>
        </div>
    )
}