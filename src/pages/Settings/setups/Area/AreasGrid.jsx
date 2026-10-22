// import React from 'react'
// import { Button, Card, Col, Row, Space, Typography, Popconfirm } from 'antd'
// import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
// import StatusTag from '../../../../components/Area/dashboard/StatusTag'

// const { Text } = Typography

// const formatTypeTitle = (v) =>
//     (v ?? '')
//         .toString()
//         .replace(/_/g, ' ')
//         .toLowerCase()
//         .replace(/\b\w/g, (c) => c.toUpperCase())

// export default function AreasGrid({
//     data = [],
//     onView,
//     onEdit,
//     onDelete,
//     showDelete = false,
// }) {
//     return (
//         <Row gutter={[16, 16]}>
//             {data.map((r) => {
//                 const title = r?.nameEn
//                 const titlekh = r?.nameKh
//                 const desc = r?.descriptionEn || r?.descriptionKm || r?.description || ''
//                 const coverUrl = r?.cover?.url
//                 const typeText = formatTypeTitle(r?.type)

//                 return (
//                     <Col key={r?.id} xs={24} sm={12} md={8}>
//                         <Card
//                             hoverable
//                             className="dark:bg-slate-900 dark:border-slate-700"
//                             style={{
//                                 borderRadius: 14,
//                                 overflow: 'hidden',
//                                 height: '100%',
//                             }}
//                             styles={{
//                                 body: { padding: 16 },
//                             }}
//                             cover={
//                                 <div
//                                     className="bg-slate-100 dark:bg-slate-800"
//                                     style={{ height: 160, overflow: 'hidden' }}
//                                 >
//                                     <img
//                                         src={coverUrl}
//                                         alt={title}
//                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                                         onError={(e) => {
//                                             e.currentTarget.src =
//                                                 'https://via.placeholder.com/800x400?text=No+Image'
//                                         }}
//                                     />
//                                 </div>
//                             }
//                         >
//                             <Space direction="vertical" size={10} style={{ width: '100%' }}>
//                                 {/* Title */}
//                                 <div style={{ lineHeight: 1.2 }}>
//                                     <Text
//                                         strong
//                                         style={{ fontSize: 18, display: 'block', margin: 0 }}
//                                         className="dark:text-slate-200"
//                                     >
//                                         {title}
//                                     </Text>

//                                     {/* Secondary (Kh) */}
//                                     <Text
//                                         strong
//                                         style={{ fontSize: 16, display: 'block', margin: 0 }}
//                                         className="text-gray-600 dark:text-slate-400"
//                                     >
//                                         {titlekh}
//                                     </Text>
//                                 </div>

//                                 {/* Description (secondary) */}
//                                 <Text
//                                     type="secondary"
//                                     style={{ fontSize: 14, lineHeight: 1.4 }}
//                                     ellipsis={{ rows: 2, tooltip: desc }}
//                                     className="dark:text-slate-400"
//                                 >
//                                     {desc || '—'}
//                                 </Text>

//                                 {/* Type + Status */}
//                                 <div
//                                     style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'space-between',
//                                         marginTop: 4,
//                                     }}
//                                 >
//                                     {/* Muted / normal text */}
//                                     <Text className="text-slate-700 dark:text-slate-300" style={{ fontSize: 15 }}>
//                                         {typeText || '-'}
//                                     </Text>

//                                     <StatusTag value={r?.status} />
//                                 </div>

//                                 {/* Buttons row */}
//                                 <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
//                                     <Button
//                                         block
//                                         icon={<EyeOutlined />}
//                                         onClick={() => onView?.(r)}
//                                         style={{ borderRadius: 10, height: 40 }}
//                                         className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
//                                     >
//                                         View
//                                     </Button>

//                                     <Button
//                                         block
//                                         icon={<EditOutlined />}
//                                         onClick={() => onEdit?.(r)}
//                                         style={{ borderRadius: 10, height: 40 }}
//                                         className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
//                                     >
//                                         Edit
//                                     </Button>

//                                     {showDelete && (
//                                         <Popconfirm
//                                             title={<span className="dark:text-slate-200">Delete this area?</span>}
//                                             okText="Delete"
//                                             okButtonProps={{ danger: true }}
//                                             onConfirm={() => onDelete?.(r)}
//                                         >
//                                             <Button
//                                                 icon={<DeleteOutlined />}
//                                                 danger
//                                                 style={{ borderRadius: 10, height: 40 }}
//                                                 className="dark:border-slate-700"
//                                             />
//                                         </Popconfirm>
//                                     )}
//                                 </div>
//                             </Space>
//                         </Card>
//                     </Col>
//                 )
//             })}
//         </Row>
//     )
// }

import React from 'react'
import { Button, Card, Col, Row, Space, Typography, Popconfirm } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import StatusTag from '../../../../components/Area/dashboard/StatusTag'

const { Text } = Typography

const formatTypeTitle = (v) =>
    (v ?? '')
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())

export default function AreasGrid({
    data = [],
    onView,
    onEdit,
    onDelete,
    showDelete = false,
    loading: loadingList,
    ImageLoading,
}) {
    return (
        <div style={{ position: 'relative' }}>
            {loadingList && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.6)',
                    }}
                >
                    <ImageLoading overlay={false} size={60} logoSize={25} />
                </div>
            )}

            <Row gutter={[16, 16]}>
                {data.map((r) => {
                    const title = r?.nameEn
                    const titlekh = r?.nameKh
                    const desc = r?.descriptionEn || r?.descriptionKm || r?.description || ''
                    const coverUrl = r?.cover?.url
                    const typeText = formatTypeTitle(r?.type)

                    return (
                        <Col key={r?.id} xs={24} sm={12} md={8}>
                            <Card
                                hoverable
                                className="dark:bg-slate-900 dark:border-slate-700"
                                style={{
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    height: '100%',
                                }}
                                styles={{
                                    body: { padding: 16 },
                                }}
                                cover={
                                    <div
                                        className="bg-slate-100 dark:bg-slate-800"
                                        style={{ height: 160, overflow: 'hidden' }}
                                    >
                                        <img
                                            src={coverUrl}
                                            alt={title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    'https://via.placeholder.com/800x400?text=No+Image'
                                            }}
                                        />
                                    </div>
                                }
                            >
                                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                    {/* Title */}
                                    <div style={{ lineHeight: 1.2 }}>
                                        <Text
                                            strong
                                            style={{ fontSize: 18, display: 'block', margin: 0 }}
                                            className="dark:text-slate-200"
                                        >
                                            {title}
                                        </Text>

                                        {/* Secondary (Kh) */}
                                        <Text
                                            strong
                                            style={{ fontSize: 16, display: 'block', margin: 0 }}
                                            className="text-gray-600 dark:text-slate-400"
                                        >
                                            {titlekh}
                                        </Text>
                                    </div>

                                    {/* Description (secondary) */}
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 14, lineHeight: 1.4 }}
                                        ellipsis={{ rows: 2, tooltip: desc }}
                                        className="dark:text-slate-400"
                                    >
                                        {desc || '—'}
                                    </Text>

                                    {/* Type + Status */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginTop: 4,
                                        }}
                                    >
                                        {/* Muted / normal text */}
                                        <Text className="text-slate-700 dark:text-slate-300" style={{ fontSize: 15 }}>
                                            {typeText || '-'}
                                        </Text>

                                        <StatusTag value={r?.status} />
                                    </div>

                                    {/* Buttons row */}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                        <Button
                                            block
                                            icon={<EyeOutlined />}
                                            onClick={() => onView?.(r)}
                                            style={{ borderRadius: 10, height: 40 }}
                                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                        >
                                            View
                                        </Button>

                                        <Button
                                            block
                                            icon={<EditOutlined />}
                                            onClick={() => onEdit?.(r)}
                                            style={{ borderRadius: 10, height: 40 }}
                                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                        >
                                            Edit
                                        </Button>

                                        {showDelete && (
                                            <Popconfirm
                                                title={<span className="dark:text-slate-200">Delete this area?</span>}
                                                okText="Delete"
                                                okButtonProps={{ danger: true }}
                                                onConfirm={() => onDelete?.(r)}
                                            >
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    style={{ borderRadius: 10, height: 40 }}
                                                    className="dark:border-slate-700"
                                                />
                                            </Popconfirm>
                                        )}
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )
}