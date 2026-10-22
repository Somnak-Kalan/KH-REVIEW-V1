import React from 'react'
import { PlusOutlined } from '@ant-design/icons'

const BannerHeader = ({ title }) => {
    return (
        <div className="">
            <div className="w-full">
                <div className="flex items-start bg-white cursor-pointer">
                    <div className="flex-shrink-0 text-gray-500 mr-2 mt-1">
                        <PlusOutlined style={{ fontSize: '20px' }} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <span className="text-lg text-gray-900 font-semibold mb-1">
                            {title}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BannerHeader
