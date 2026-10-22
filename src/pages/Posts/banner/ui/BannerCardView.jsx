// ui/BannerCardView.jsx (card view extracted - same code)

import { Button, Card, Col, Row, Tag, Tooltip } from 'antd'
import {
    EyeOutlined,
    ShareAltOutlined,
    MessageOutlined,
    ExportOutlined,
} from '@ant-design/icons'
import ButtonAction from '../../../../components/Action/ButtonAction'

const BannerCardView = ({
    cardData,
    activeTab,
    handleEdit,
    handleView,
    showAlert,
    access_token,
    getBannerList,
    currentTabState,
    dayjs,
}) => {
    return (
        <Row gutter={[16, 16]}>
            {cardData?.map((record) => (
                <Col
                    xs={24}
                    sm={12}
                    md={12}
                    lg={8}
                    xl={6}
                    xxl={6}
                    key={record?._id}
                >
                    <Card
                        className='relative overflow-hidden'
                        hoverable
                        cover={
                            <div className='relative'>
                                <img
                                    alt={'image'}
                                    src={record?.image?.small?.en?.url}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                    }}
                                />

                                {record?.status.trim()?.toLowerCase() === 'active' && (
                                    <Tag color='#16a34a' className='absolute top-2 left-2 px-2 py-1 text-xs z-10'>
                                        active
                                    </Tag>
                                )}
                                {record?.status.trim()?.toLowerCase() === 'inactive' && (
                                    <Tag color='#6b7280' className='absolute top-2 left-2 px-2 py-1 text-xs z-10'>
                                        Inactive
                                    </Tag>
                                )}
                                {record?.status.trim()?.toLowerCase() === 'expired' && (
                                    <Tag color='#dc2626' className='absolute top-2 left-2 px-2 py-1 text-xs z-10'>
                                        Expired
                                    </Tag>
                                )}

                                <div className='absolute top-2 right-2 flex gap-1'>
                                    <ButtonAction
                                        record={record}
                                        handleEdit={() => handleEdit(record)}
                                        handleView={() => handleView(record)}
                                        handDelete={() =>
                                            showAlert({
                                                record,
                                                access_token,
                                                getBannerList: () =>
                                                    getBannerList(activeTab, {
                                                        search: currentTabState.searchQuery,
                                                        status: currentTabState.filterStatus,
                                                    }),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        }
                    >
                        <div className='text-xs text-gray-500 mb-2'>
                            {dayjs(record?.createdAt).format('MMM D, YYYY')}
                        </div>

                        <Card.Meta
                            title={
                                <div>
                                    <p className='m-0 p-0 text-blue-500 text-base font-bold leading-none'>
                                        {record?.titleEn}
                                    </p>
                                    <p className='m-0 p-0 mt-1 text-sm text-gray-500 leading-none'>
                                        {record?.titleKh}
                                    </p>
                                </div>
                            }
                            description={
                                <>
                                    {record.location_owner && (
                                        <div className='flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg mt-2 w-full'>
                                            <span className='text-blue-700 text-xs font-semibold'>
                                                {record.location_owner}
                                            </span>
                                        </div>
                                    )}

                                    <div className='flex items-center text-xs text-gray-500 mt-2'>
                                        <svg
                                            width='12'
                                            height='12'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <circle cx='12' cy='7' r='5' stroke='black' strokeWidth='2' />
                                            <circle cx='14' cy='7' r='1.5' fill='black' />
                                            <path d='M12 12L12 22' stroke='black' strokeWidth='2' strokeLinecap='round' />
                                        </svg>

                                        {(() => {
                                            const provinces = record?.provinces || []
                                            const shown = provinces.slice(0, 3)
                                            const remaining = provinces?.slice(3)

                                            const shownText =
                                                shown
                                                    .map((p) => p?.provinceEn)
                                                    .filter(Boolean)
                                                    .join(', ') || 'Provinces Not Selected Yet'

                                            const remainingText = remaining
                                                .map((p) => p?.provinceEn)
                                                .filter(Boolean)
                                                .join(', ')

                                            return (
                                                <span className='ml-1'>
                                                    {shownText}
                                                    {remaining.length > 0 && (
                                                        <Tooltip title={remainingText}>
                                                            <span className='text-blue-500 text-xs ml-1 '>
                                                                +{remaining.length} ...
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </span>
                                            )
                                        })()}
                                    </div>
                                </>
                            }
                        />

                        <div className='flex justify-between items-center text-xs mt-4 pt-3 border-t border-gray-200'>
                            <div>
                                <div className='flex wrap items-center gap-3'>
                                    <div className='flex items-center gap-1 text-gray-600'>
                                        <span role='img' aria-label='view'>
                                            <EyeOutlined className='text-blue-500' />{' '}
                                        </span>
                                        0
                                    </div>

                                    <div className='flex items-center gap-1 text-gray-600'>
                                        <span role='img' aria-label='click'>
                                            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <circle cx='12' cy='12' r='10' stroke='#4CAF50' strokeWidth='2' />
                                                <circle cx='12' cy='12' r='6' stroke='#4CAF50' strokeWidth='2' />
                                                <circle cx='12' cy='12' r='2' fill='#4CAF50' />
                                            </svg>
                                        </span>{' '}
                                        0
                                    </div>

                                    <span role='img' aria-label='share'>
                                        <ShareAltOutlined />
                                    </span>{' '}
                                    0
                                </div>

                                <div className='flex flex-wrap md:flex-nowrap items-center gap-3'>
                                    <span role='img' aria-label='details' className='text-purple-600  flex items-center gap-1'>
                                        <ExportOutlined style={{ width: '10px', fontSize: '14px' }} />
                                        <p className='m-0'>{record?.details ?? '0'}</p>
                                        details
                                    </span>

                                    {Object.keys(record?.place || {}).length === 0 ? (
                                        ''
                                    ) : (
                                        <span role='img' aria-label='chat' className='text-green-500 flex items-center gap-1'>
                                            <MessageOutlined style={{ width: '10px', fontSize: '14px' }} />
                                            <span>{record?.chats ?? '0'}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    )
}

export default BannerCardView
