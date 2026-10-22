import React from 'react'
import dayjs from 'dayjs'

// remove hashtags like #abc_123
// remove hashtags (#...) and mentions (@...) in ALL languages (Unicode) + Khmer fallback
export const stripHashtagsFromDescription = (txt = '') => {
    const s = String(txt || '')

    const KHMER_RANGE = '\u1780-\u17FF\u19E0-\u19FF'
    const FALLBACK_TOKEN_CHARS = `A-Za-z0-9_${KHMER_RANGE}`

    // Prefer Unicode property escapes when supported
    let tokenRe
    try {
        new RegExp('\\p{L}', 'u')
        // Letters + Marks + Numbers + underscore
        // matches #កម្ពុជា or #hello or #東京 or #á (combining marks)
        tokenRe = /([#@])[\p{L}\p{M}\p{N}_]+/gu
    } catch {
        // Fallback: Latin + digits + underscore + Khmer
        tokenRe = new RegExp(`([#@])[${FALLBACK_TOKEN_CHARS}]+`, 'gu')
    }

    let cleaned = s.replace(tokenRe, '')          // remove #... and @...
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ')  // collapse extra spaces
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')  // collapse many newlines
    return cleaned.trim()
}


export const buildMomentFilterDoc = ({
    page,
    limit,
    searchValue,
    filterStatus,
    filterCreatedBy,
    dateRange,
}) => {
    const startDate =
        dateRange && dateRange.length === 2 && dateRange[0]
            ? dayjs(dateRange[0]).format('YYYY-MM-DD')
            : undefined

    const endDate =
        dateRange && dateRange.length === 2 && dateRange[1]
            ? dayjs(dateRange[1]).format('YYYY-MM-DD')
            : undefined

    return {
        page,
        limit,
        keyword: searchValue || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus,
        createdBy: filterCreatedBy === 'all' ? '' : filterCreatedBy,
        startDate,
        endDate,
    }
}

//  keep your Tag renderer (no JSX in .js)
// keep your Tag renderer (no JSX in .js)
export const renderStatusTag = (status, Tag) => {
    if (!Tag) return null

    const lower = String(status || '').toLowerCase()

    const baseStyle = {
        borderRadius: 999,
        padding: '1px 8px',
        fontSize: 10,
        lineHeight: '16px',
        fontWeight: 500,
        border: 'none',
        margin: 0,
    }

    switch (lower) {
        case 'active':
            return React.createElement(
                Tag,
                {
                    style: {
                        ...baseStyle,
                        background: '#52c41a',
                        color: '#ffffff',
                    },
                },
                'Active'
            )

        case 'pending':
            return React.createElement(
                Tag,
                {
                    style: {
                        ...baseStyle,
                        background: '#6b7280',
                        color: '#ffffff',
                    },
                },
                'Under Review'
            )

        case 'inactive':
            return React.createElement(
                Tag,
                {
                    style: {
                        ...baseStyle,
                        background: '#AD383833',
                        color: '#ffffff',
                    },
                },
                'Hide'
            )

        default:
            return React.createElement(
                Tag,
                {
                    style: {
                        ...baseStyle,
                        background: '#d9d9d9',
                        color: '#ffffff',
                    },
                },
                'Unknown'
            )
    }
}

//  shared for detail page: aspectRatio -> css aspect-ratio
export const getCoverAspectStyle = (aspectRatio) => {
    switch (aspectRatio) {
        case 'portrait3:4':
            return { aspectRatio: '3 / 4' }
        case 'square1:1':
            return { aspectRatio: '1 / 1' }
        case 'classic4:3':
        default:
            return { aspectRatio: '4 / 3' }
    }
}
