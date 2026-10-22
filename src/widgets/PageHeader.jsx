import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

export default function BreadcrumbWidget({
    items = [],
    showHome = true,
    className = '',
}) {
    const finalItems = [
        ...(showHome ? [{ href: '#', title: <HomeOutlined /> }] : []),
        ...items,
    ]

    return (
        <div className={`breadcrumb-widget ${className}`}>
            <Breadcrumb items={finalItems} />
        </div>
    )
}
