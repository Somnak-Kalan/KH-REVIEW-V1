import React, {
    useContext,
    useEffect,
    useMemo,
} from 'react'

import {
    Alert,
    Modal,
    Spin,
    Table,
    Tag,
} from 'antd'

import { AuthContext }
    from '../../../contexts/AuthContext'

import useTemplateReviewStore
    from '../../../Stores/ReviewManagement/Reviews/Template'

const dimensionColumns = [
    {
        title: (
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                Dimension
            </span>
        ),
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: '38%',
        render: (
            nameEn
        ) => {
            return (
                <span
                    style={{
                        color: '#262626',
                        fontSize: 12,
                    }}
                >
                    {nameEn || '-'}
                </span>
            )
        },
    },
    {
        title: (
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                Khmer
            </span>
        ),
        dataIndex: 'nameKh',
        key: 'nameKh',
        width: '37%',
        render: (
            nameKh
        ) => {
            return (
                <span
                    style={{
                        color: '#262626',
                        fontSize: 12,
                    }}
                >
                    {nameKh || '-'}
                </span>
            )
        },
    },
    {
        title: (
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                Weight
            </span>
        ),
        dataIndex: 'weight',
        key: 'weight',
        width: '25%',
        align: 'center',
        render: (
            weight,
            record
        ) => {
            const displayWeight =
                Number(
                    weight ??
                    record?.weightPercent ??
                    0
                )

            return (
                <Tag
                    bordered={false}
                    style={{
                        margin: 0,
                        padding:
                            '1px 8px',
                        color: '#4b5563',
                        background:
                            '#f3f4f6',
                        borderRadius: 4,
                        fontSize: 11,
                    }}
                >
                    {displayWeight}%
                </Tag>
            )
        },
    },
]

const ReviewTemplateDetail = ({
    open,
    templateId,
    onClose,
}) => {
    const { access_token } =
        useContext(AuthContext)

    const template =
        useTemplateReviewStore(
            (state) =>
                state
                    .templateReviewDetail
        )

    const loading =
        useTemplateReviewStore(
            (state) =>
                state.detailLoading
        )

    const error =
        useTemplateReviewStore(
            (state) =>
                state.error
        )

    const fetchTemplateReviewById =
        useTemplateReviewStore(
            (state) =>
                state
                    .fetchTemplateReviewById
        )

    const clearTemplateReviewDetail =
        useTemplateReviewStore(
            (state) =>
                state
                    .clearTemplateReviewDetail
        )

    const clearError =
        useTemplateReviewStore(
            (state) =>
                state.clearError
        )

    useEffect(() => {
        if (
            !open ||
            !templateId ||
            !access_token
        ) {
            return
        }

        fetchTemplateReviewById({
            access_token,
            templateId,
        }).catch(() => {
            // Error is handled
            // inside Zustand store.
        })
    }, [
        open,
        templateId,
        access_token,
        fetchTemplateReviewById,
    ])

    useEffect(() => {
        if (!open) {
            clearTemplateReviewDetail()
            clearError()
        }
    }, [
        open,
        clearTemplateReviewDetail,
        clearError,
    ])

    const dimensions =
        useMemo(() => {
            if (
                Array.isArray(
                    template
                        ?.dimensions
                )
            ) {
                return template
                    .dimensions
            }

            if (
                Array.isArray(
                    template
                        ?.criteria
                )
            ) {
                return template
                    .criteria.map(
                        (
                            criterion,
                            index
                        ) => ({
                            ...criterion,

                            _id:
                                criterion
                                    ?._id ||
                                criterion
                                    ?.id ||
                                criterion
                                    ?.key ||
                                `criterion-${index}`,

                            weight:
                                Number(
                                    criterion
                                        ?.weight ??
                                    criterion
                                        ?.weightPercent ??
                                    0
                                ),
                        })
                    )
            }

            return []
        }, [template])

    const subCategories =
        useMemo(() => {
            if (
                Array.isArray(
                    template
                        ?.subCategories
                )
            ) {
                return template
                    .subCategories
            }

            if (
                Array.isArray(
                    template
                        ?.categories
                )
            ) {
                return template
                    .categories
            }

            return []
        }, [template])

    const totalWeight =
        useMemo(() => {
            return dimensions.reduce(
                (
                    total,
                    dimension
                ) => {
                    return (
                        total +
                        Number(
                            dimension
                                ?.weight ??
                            dimension
                                ?.weightPercent ??
                            0
                        )
                    )
                },
                0
            )
        }, [dimensions])

    const templateName =
        template?.templateName ||
        template?.nameEn ||
        template?.name ||
        ''

    const handleClose = () => {
        clearTemplateReviewDetail()
        clearError()
        onClose?.()
    }

    return (
        <Modal
            open={open}
            onCancel={
                handleClose
            }
            footer={null}
            width={720}
            centered
            destroyOnClose
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems:
                            'center',
                        flexWrap: 'wrap',
                        gap: 5,
                        paddingRight: 25,
                    }}
                >
                    <span
                        style={{
                            color: '#262626',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        Template Details
                    </span>

                    {templateName ? (
                        <span
                            style={{
                                color: '#262626',
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            {templateName}
                        </span>
                    ) : null}
                </div>
            }
            styles={{
                content: {
                    padding: 20,
                    borderRadius: 8,
                },
                header: {
                    marginBottom: 18,
                },
                body: {
                    padding: 0,
                },
            }}
        >
            <Spin
                spinning={loading}
            >
                <div
                    style={{
                        minHeight: 220,
                    }}
                >
                    {error &&
                        !loading ? (
                        <Alert
                            type='error'
                            showIcon
                            message={error}
                            style={{
                                marginBottom:
                                    12,
                            }}
                        />
                    ) : null}

                    <div
                        style={{
                            marginBottom: 8,
                            color: '#262626',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        Used by Categories
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            flexWrap: 'wrap',
                            gap: 5,
                            minHeight: 24,
                            marginBottom: 12,
                        }}
                    >
                        {subCategories
                            .length >
                            0 ? (
                            subCategories.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const nameEn =
                                        item
                                            ?.nameEn ||
                                        item
                                            ?.name_en ||
                                        '-'

                                    const nameKh =
                                        item
                                            ?.nameKh ||
                                        item
                                            ?.name_kh ||
                                        ''

                                    const label =
                                        nameKh
                                            ? `${nameEn} - ${nameKh}`
                                            : nameEn

                                    return (
                                        <Tag
                                            key={
                                                item
                                                    ?._id ||
                                                item
                                                    ?.id ||
                                                index
                                            }
                                            bordered={
                                                false
                                            }
                                            style={{
                                                margin: 0,
                                                padding:
                                                    '2px 7px',
                                                color:
                                                    '#2458d3',
                                                background:
                                                    '#eef4ff',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                lineHeight:
                                                    '18px',
                                            }}
                                        >
                                            {label}
                                        </Tag>
                                    )
                                }
                            )
                        ) : (
                            <span
                                style={{
                                    color:
                                        '#8c8c8c',
                                    fontSize: 12,
                                }}
                            >
                                {loading
                                    ? 'Loading...'
                                    : 'No category'}
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            flexWrap: 'wrap',
                            gap: 6,
                            marginBottom: 12,
                        }}
                    >
                        <Tag
                            bordered={false}
                            style={{
                                margin: 0,
                                padding:
                                    '2px 7px',
                                color:
                                    totalWeight ===
                                        100
                                        ? '#52c41a'
                                        : '#d48806',
                                background:
                                    totalWeight ===
                                        100
                                        ? '#f6ffed'
                                        : '#fffbe6',
                                borderRadius: 4,
                                fontSize: 11,
                            }}
                        >
                            Total Weight{' '}
                            {totalWeight}%
                        </Tag>

                        <Tag
                            bordered={false}
                            style={{
                                margin: 0,
                                padding:
                                    '2px 7px',
                                color: '#4b5563',
                                background:
                                    '#f5f5f5',
                                borderRadius: 4,
                                fontSize: 11,
                            }}
                        >
                            {dimensions.length}{' '}
                            {dimensions.length ===
                                1
                                ? 'Dimension'
                                : 'Dimensions'}
                        </Tag>
                        {/* 
                        {template
                            ?.overallMode ? (
                            <Tag
                                bordered={false}
                                style={{
                                    margin: 0,
                                    padding:
                                        '2px 7px',
                                    color:
                                        '#0958d9',
                                    background:
                                        '#e6f4ff',
                                    borderRadius: 4,
                                    fontSize: 11,
                                }}
                            >
                                {
                                    template
                                        .overallMode
                                }
                            </Tag>
                        ) : null} */}

                        {/* {template
                            ?.status ? (
                            <Tag
                                bordered={false}
                                style={{
                                    margin: 0,
                                    padding:
                                        '2px 7px',
                                    color:
                                        template
                                            .status ===
                                            'Active'
                                            ? '#389e0d'
                                            : '#8c8c8c',
                                    background:
                                        template
                                            .status ===
                                            'Active'
                                            ? '#f6ffed'
                                            : '#f5f5f5',
                                    borderRadius: 4,
                                    fontSize: 11,
                                }}
                            >
                                {
                                    template
                                        .status
                                }
                            </Tag>
                        ) : null} */}
                    </div>

                    <Table
                        rowKey={(
                            record,
                            index
                        ) => {
                            return (
                                record?._id ||
                                record?.id ||
                                record?.key ||
                                `${record?.nameEn}-${index}`
                            )
                        }}
                        columns={
                            dimensionColumns
                        }
                        dataSource={
                            dimensions
                        }
                        loading={false}
                        pagination={false}
                        bordered={false}
                        size='small'
                        scroll={{ x: 'max-content' }}
                        className='custom-table-review-template-detail'
                        locale={{
                            emptyText:
                                loading
                                    ? 'Loading...'
                                    : 'No dimension available',
                        }}
                    />
                </div>
            </Spin>
        </Modal>
    )
}

export default ReviewTemplateDetail