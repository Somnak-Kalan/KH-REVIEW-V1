import React from 'react'
import { Card, Space, Typography } from 'antd'

const { Text } = Typography

const TableHeader = ({
    total = 0,
    label = '',
    prefixText = '',
    suffixText = null,
    extra = null,
    children,
    style,
    className = '',
    countClassName = 'text-blue-700',
    labelClassName = 'text-gray-400 dark:text-slate-400',
    tabsHeader = null,
    specialKey = false,
    ...cardProps
}) => {
    const isDark =
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark')

    return (
        <Card
            {...cardProps}
            title={
                <div>
                    <div>
                        {tabsHeader}
                    </div>
                    {
                        specialKey === false && (
                            <Space size={6} style={{ lineHeight: 1, flexWrap: 'wrap' }}>
                                {prefixText ? (
                                    <Text className="text-sm dark:text-slate-200">{prefixText}</Text>
                                ) : null}

                                <span className={`text-sm font-semibold dark:text-slate-400 ${countClassName}`}>
                                    {total || ''}
                                </span>

                                <span className={`text-sm ${labelClassName}`}>{label !== '' ? '|' : ''} {label}</span>

                                {suffixText ? (
                                    <span className="ml-3 inline-flex items-center">
                                        {suffixText}
                                    </span>
                                ) : null}
                            </Space>
                        )
                    }

                </div>
            }
            extra={extra}
            className={className}
            style={{ borderRadius: 10, ...style }}
        >
            {children}
        </Card>
    )
}

export default TableHeader