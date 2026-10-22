import React from 'react'
import { Card, Typography } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'

const { Text } = Typography

const getPlaceImage = (place) => {
    return (
        place?.image ||
        place?.imageUrl ||
        place?.thumbnail ||
        place?.cover ||
        place?.photo ||
        place?.media?.[0]?.url ||
        place?.images?.[0]?.url ||
        null
    )
}

const getPlaceName = (place) => {
    return place?.name || place?.nameEn || place?.title || '-'
}

const getPlaceSubName = (place) => {
    return place?.nameKh || place?.khName || place?.address || place?.province || ''
}

const Location = ({ places = [] }) => {
    return (
        <Card
            className="my-2"
            styles={{
                body: {
                    padding: 14,
                },
            }}
            style={{
                borderRadius: 8,
                border: '1px solid #E2EFFF',
            }}
        >
            <div
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: '#111827',
                }}
            >
                Location
            </div>

            {places.length === 0 ? (
                <Text type="secondary">No location</Text>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    {places.map((place, index) => {
                        const image = getPlaceImage(place)
                        const name = getPlaceName(place)
                        const subName = getPlaceSubName(place)

                        return (
                            <div
                                key={place?._id || place?.id || index}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    minWidth: 120,
                                    maxWidth: 180,
                                    padding: '5px 8px',
                                    border: '1px solid #d9ecff',
                                    borderRadius: 6,
                                    background: '#fff',
                                }}
                            >
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        background: '#f5f5f5',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <EnvironmentOutlined style={{ color: '#1677ff' }} />
                                    )}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: '#111827',
                                            lineHeight: '16px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {name}
                                    </div>

                                    {subName && (
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: '#6b7280',
                                                lineHeight: '14px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {subName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </Card>
    )
}

export default Location