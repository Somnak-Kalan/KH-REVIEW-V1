
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react'
import { Modal, Input, Form, message, Empty } from 'antd'

import { AuthContext } from '../../../contexts/AuthContext'
import BusiessPlaceOptServices from '../../../services/options/BusinessPlace'

// ---------- helpers ----------
const isKhmerText = (s = '') => /[\u1780-\u17FF]/.test(String(s || ''))

const pickDisplayName = (place, query) => {
    const q = String(query || '').trim()
    const kh = String(place?.nameKh || '').trim()
    const en = String(place?.nameEn || '').trim()

    if (isKhmerText(q)) return kh || en || 'Unnamed'
    return en || kh || 'Unnamed'
}

const buildImageUrl = (place) => {
    const img = place?.media?.image
    if (Array.isArray(img) && img.length > 0) return img[0]
    return ''
}

const debounce = (fn, delay = 300) => {
    let t
    return (...args) => {
        clearTimeout(t)
        t = setTimeout(() => fn(...args), delay)
    }
}

// --- SVG Icons ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

const LocationPinIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

// ---------- Modal ----------
const DropLocationModal = ({
    visible,
    onCancel,
    selectedLocations = [],
    setSelectedLocations,
    form,
    onToggleLocation, // 

}) => {
    const { access_token } = useContext(AuthContext)

    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)

    const [results, setResults] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

    const [activeIndex, setActiveIndex] = useState(0)
    const navDirRef = useRef(null)

    const listRef = useRef(null)
    const inputRef = useRef(null)

    const safeSelected = Array.isArray(selectedLocations) ? selectedLocations : []
    const formLocations = Form.useWatch('location', form) || []

    const totalPages = useMemo(() => {
        const limit = Number(pagination?.limit || 10)
        const total = Number(pagination?.total || 0)
        return limit ? Math.max(1, Math.ceil(total / limit)) : 1
    }, [pagination])

    const canPrev = Number(pagination?.page || 1) > 1
    const canNext = Number(pagination?.page || 1) < totalPages

    const isSelected = useCallback(
        (loc) => {
            const base = safeSelected.length ? safeSelected : (Array.isArray(formLocations) ? formLocations : [])
            return base.some((x) => String(x?._id) === String(loc?._id))
        },
        [safeSelected, formLocations]
    )

    const updateLocations = useCallback(
        (next) => {
            if (typeof setSelectedLocations === 'function') {
                setSelectedLocations(next)
            }
            if (form?.setFieldsValue) {
                form.setFieldsValue({ location: next.length ? next : undefined })
            }
        },
        [setSelectedLocations, form]
    )

    const toggleSelection = useCallback(
        (loc) => {
            const base = safeSelected.length ? safeSelected : (Array.isArray(formLocations) ? formLocations : [])
            const exists = base.some((x) => String(x?._id) === String(loc?._id))
            const nextSelected = !exists

            //  If parent provided sync handler, use it (it will also remove/add @mention)
            if (typeof onToggleLocation === 'function') {
                onToggleLocation(loc, nextSelected)
                return
            }

            // fallback old behavior
            const next = exists ? base.filter((x) => String(x?._id) !== String(loc?._id)) : [...base, loc]
            updateLocations(next)
        },
        [safeSelected, formLocations, updateLocations, onToggleLocation]
    )

    const fetchPage = useCallback(
        async ({ query, page, limit, dir = null }) => {
            if (!access_token) return
            setLoading(true)
            try {
                const res = await BusiessPlaceOptServices.fetchBusinessPlaceOpt({
                    access_token,
                    search: query ?? '',
                    page,
                    limit,
                })

                const dataArr = Array.isArray(res?.data) ? res.data : []
                const pg = res?.pagination || { page, limit, total: 0 }

                const normalized = dataArr.map((p) => {
                    const displayName = pickDisplayName(p, query)
                    const secondary =
                        displayName === String(p?.nameKh || '').trim()
                            ? String(p?.nameEn || '').trim()
                            : String(p?.nameKh || '').trim()

                    return {
                        ...p,
                        _id: p?._id,
                        placeId: p?.placeId,
                        nameEn: p?.nameEn,
                        nameKh: p?.nameKh,
                        name: displayName,
                        secondaryName: secondary,
                        imageUrl: buildImageUrl(p),
                    }
                })

                navDirRef.current = dir
                setResults(normalized)
                setPagination({
                    page: Number(pg?.page || page),
                    limit: Number(pg?.limit || limit),
                    total: Number(pg?.total || 0),
                })
            } catch (e) {
                console.error(e)
                setResults([])
                setPagination({ page: 1, limit, total: 0 })
            } finally {
                setLoading(false)
            }
        },
        [access_token]
    )

    const debouncedFetch = useMemo(
        () =>
            debounce((q) => {
                fetchPage({ query: q, page: 1, limit: Number(pagination?.limit || 10) })
            }, 350),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fetchPage, pagination?.limit]
    )

    useEffect(() => {
        if (!visible) return
        setActiveIndex(0)
        fetchPage({ query: searchQuery, page: 1, limit: Number(pagination?.limit || 10) })
        setTimeout(() => inputRef.current?.focus?.(), 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    useEffect(() => {
        if (!visible) return
        const dir = navDirRef.current
        if (!dir) return
        if (dir === 'next') setActiveIndex(0)
        if (dir === 'prev') setActiveIndex(Math.max(0, results.length - 1))
        navDirRef.current = null
    }, [results, visible])

    useEffect(() => {
        const box = listRef.current
        if (!box) return
        const el = box.querySelector(`[data-idx="${activeIndex}"]`)
        if (el?.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
    }, [activeIndex])

    const gotoPrev = () => {
        if (!canPrev) return
        fetchPage({
            query: searchQuery,
            page: Number(pagination?.page || 1) - 1,
            limit: Number(pagination?.limit || 10),
            dir: 'prev',
        })
    }

    const gotoNext = () => {
        if (!canNext) return
        fetchPage({
            query: searchQuery,
            page: Number(pagination?.page || 1) + 1,
            limit: Number(pagination?.limit || 10),
            dir: 'next',
        })
    }

    const onInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (activeIndex < results.length - 1) setActiveIndex((i) => i + 1)
            else if (canNext) gotoNext()
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (activeIndex > 0) setActiveIndex((i) => i - 1)
            else if (canPrev) gotoPrev()
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            const item = results[activeIndex]
            if (item) toggleSelection(item)
            return
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            onCancel?.()
        }
    }

    return (
        <Modal open={visible} onCancel={onCancel} footer={null} closable width={420} className="rounded-lg">
            <div className="p-4">
                <Input
                    placeholder="Search location (Khmer / English)"
                    prefix={<SearchIcon />}
                    className="rounded-full my-3 border-gray-300 focus:border-blue-500 !p-2 !pl-10"
                    value={searchQuery}
                    ref={inputRef}
                    onKeyDown={onInputKeyDown}
                    onChange={(e) => {
                        const v = e.target.value
                        setSearchQuery(v)
                        setActiveIndex(0)
                        debouncedFetch(v)
                    }}
                />

                <div className="text-sm font-medium text-gray-600 mb-2">
                    Total Place : {Number(pagination?.total || 0)}
                </div>

                <div ref={listRef} className="max-h-[40vh] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">Loading...</div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((loc, idx) => {
                                const active = idx === activeIndex
                                return (
                                    <div
                                        key={loc._id || `${loc.name}-${idx}`}
                                        data-idx={idx}
                                        className={`flex justify-between items-center py-3 cursor-pointer border-b border-gray-100 px-2 -mx-2 ${active ? 'bg-blue-500/10' : 'hover:bg-gray-50'
                                            }`}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => toggleSelection(loc)}
                                    >
                                        <div className="flex gap-3 items-center">
                                            {loc.imageUrl ? (
                                                <img
                                                    src={loc.imageUrl}
                                                    alt={loc.name}
                                                    className="w-12 h-12 rounded-md object-cover shadow-sm"
                                                    onError={(ev) => {
                                                        ev.currentTarget.onerror = null
                                                        ev.currentTarget.src = `https://placehold.co/80x80/CCCCCC/333333?text=${String(loc.name || 'NA')
                                                            .substring(0, 2)
                                                            .toUpperCase()}`
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-md">
                                                    <LocationPinIcon className="w-6 h-6 text-blue-500" />
                                                </div>
                                            )}

                                            <div>
                                                <div className="text-sm font-medium text-gray-800">
                                                    {loc.name}
                                                    {loc.placeId ? <span className="ml-2 text-xs text-gray-400">({loc.placeId})</span> : null}
                                                </div>
                                                {loc.secondaryName ? (
                                                    <div className="text-xs text-gray-500">{loc.secondaryName}</div>
                                                ) : (
                                                    <div className="text-xs text-gray-500">&nbsp;</div>
                                                )}
                                            </div>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={isSelected(loc)}
                                            readOnly
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded-md cursor-pointer"
                                        />
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">
                            {searchQuery ? `No results for "${searchQuery}".` : 'Type to search locations.'}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-black/10">
                    <button
                        type="button"
                        disabled={!canPrev}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            gotoPrev()
                        }}
                        className={`text-xs px-3 py-1 rounded-md border ${canPrev ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                            }`}
                    >
                        Prev
                    </button>

                    <div className="text-xs text-black/60 whitespace-nowrap">
                        Page <span className="font-semibold text-black/80">{Number(pagination?.page || 1)}</span> / {totalPages}
                    </div>

                    <button
                        type="button"
                        disabled={!canNext}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            gotoNext()
                        }}
                        className={`text-xs px-3 py-1 rounded-md border ${canNext ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ---------- Main Component ----------
export default function DropLocation(props) {
    const { locations = [], setLocations, form, onToggleLocation } = props
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        if (!form?.setFieldsValue) return
        form.setFieldsValue({
            location: Array.isArray(locations) && locations.length > 0 ? locations : undefined,
        })
    }, [locations, form])

    const safe = Array.isArray(locations) ? locations : []

    return (
        <div className="flex items-center justify-center font-sans">
            <div className="w-full mx-auto">
                <Form form={form} component={false}>
                    <Form.Item
                        label="Drop Location"
                        name="location"
                        labelCol={{ span: 24 }}
                        required
                        validateStatus={safe.length === 0 ? 'error' : ''}
                        help={safe.length === 0 ? 'Please select at least one location' : ''}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                {safe.length === 0 ? (
                                    <div className="">
                                        <Empty description="No locations selected" className="py-3" />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {safe.map((loc) => (
                                            <div
                                                key={loc._id}
                                                className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1"
                                            >
                                                <span>{loc.name || loc.nameEn || loc.nameKh || 'Unnamed'}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // ✅ remove also removes @mention (handled by parent)
                                                        if (typeof onToggleLocation === 'function') {
                                                            onToggleLocation(loc, false)
                                                            return
                                                        }

                                                        // fallback old
                                                        if (typeof setLocations === 'function') {
                                                            setLocations(safe.filter((l) => String(l?._id) !== String(loc?._id)))
                                                        } else {
                                                            message.error('setLocations is not a function')
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    aria-label="Remove"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalVisible(true)}
                                className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 text-sm"
                            >
                                <span>Add</span>
                            </button>
                        </div>
                    </Form.Item>
                </Form>
            </div>

            <DropLocationModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                selectedLocations={safe}
                setSelectedLocations={setLocations}
                form={form}
                onToggleLocation={onToggleLocation}
            />
        </div>
    )
}
