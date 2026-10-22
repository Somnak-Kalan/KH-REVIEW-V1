import React from 'react'
import { Empty } from 'antd'

export default function PlacesTab({ provinceId }) {
    return (
        <div
            className="
        p-2 sm:p-4
        dark:[&_.ant-empty-description]:text-slate-400
        dark:[&_.ant-empty-image]:opacity-80
      "
        >
            <Empty description={`Places list for provinceId: ${provinceId} (connect API)`} />
        </div>
    )
}
