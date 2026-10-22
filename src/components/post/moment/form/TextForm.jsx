
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { Form, Input, Select, Card } from 'antd'
const { Option } = Select

import DropLocation from '../DropLocation'
import Mention from '../Mention'
import DescriptionHastage from '../../DescriptionHastage'

import { AuthContext } from '../../../../contexts/AuthContext'
import BusiessPlaceOptServices from '../../../../services/options/BusinessPlace'
const PLACE_MARK = '\u200c'
//  Unicode hashtag extract + Khmer fallback
const KHMER_RANGE = '\u1780-\u17FF\u19E0-\u19FF'
const extractHashtags = (txt) => {
    const s = String(txt || '')

    let re = null

    try {
        new RegExp('\\p{L}', 'u')
        re = /#[\p{L}\p{M}\p{N}_]+/gu
    } catch {
        re = new RegExp(`#[A-Za-z0-9_${KHMER_RANGE}]+`, 'gu')
    }

    return Array.from(new Set((s.match(re) || []).map((t) => t.replace(/^#/, ''))))
}

//  mention extract (slugs)
const extractMentions = (txt) => {
    const s = String(txt || '')
    let re = null
    try {
        new RegExp('\\p{L}', 'u')
        // only place mentions: @ + PLACE_MARK + token
        re = new RegExp(`@${PLACE_MARK}[\\p{L}\\p{M}\\p{N}_]+`, 'gu')
    } catch {
        re = new RegExp(`@${PLACE_MARK}[A-Za-z0-9_${KHMER_RANGE}]+`, 'gu')
    }


    return Array.from(new Set((s.match(re) || []).map((t) =>
        t.replace(new RegExp(`^@${PLACE_MARK}`), '').toLowerCase()
    )))
}

const escapeRegExp = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//  same slug logic as editor
const FALLBACK_TOKEN_CHARS = `A-Za-z0-9_${KHMER_RANGE}`
const toMentionSlug = (name) => {
    let s = String(name || '').replace(/^@/, '')
    try {
        s = s.normalize('NFKC')
    } catch { }
    s = s.toLowerCase()

    try {
        new RegExp('\\p{L}', 'u')
        s = s.replace(/[^\p{L}\p{M}\p{N}_ ]/gu, '')
    } catch {
        s = s.replace(new RegExp(`[^${FALLBACK_TOKEN_CHARS} ]`, 'gu'), '')
    }

    s = s.replace(/\s+/g, '').trim()
    return s
}

const uniq = (arr = []) => Array.from(new Set(arr.filter(Boolean)))

function TextForm(props) {
    const { form, onFinish, locations, setLocations, isMoment = null, placeholderText = '', disableMention = false } = props
    const { access_token } = useContext(AuthContext)

    const [selectedLocations, setSelectedLocations] = useState([])
    const [placeSuggestions, setPlaceSuggestions] = useState([])
    const hadMentionsRef = useRef(false)

    //  pagination meta for places
    const [placePagination, setPlacePagination] = useState({ page: 1, limit: 10, total: 0 })

    // Mention modal
    const [isMentionModalVisible, setIsMentionModalVisible] = useState(false)
    const [mentionSearchResults, setMentionSearchResults] = useState([])
    const [mentionSearchTerm, setMentionSearchTerm] = useState('')
    const [mentionType, setMentionType] = useState('user')

    // watch values
    const captionValue = Form.useWatch('description', form) || ''
    const hashtagsValue = Form.useWatch('hashtags', form) || []

    useEffect(() => {
        if (Array.isArray(locations)) setSelectedLocations(locations)
        else setSelectedLocations([])
    }, [locations])

    const setAllLocations = useCallback(
        (next) => {
            const arr = Array.isArray(next) ? next : []
            setSelectedLocations(arr)
            if (typeof setLocations === 'function') setLocations(arr)
            form?.setFieldsValue({ location: arr.length ? arr : undefined })
        },
        [setLocations, form]
    )

    const normalizePlace = useCallback((place, mentionSlugUsed = '') => {
        if (!place) return null
        const _id = place._id || place.id
        if (!_id) return null

        const nameEn = place.nameEn || ''
        const nameKh = place.nameKh || ''
        const displayName = place.name || nameEn || nameKh || ''

        const slugUsed = toMentionSlug(mentionSlugUsed || place.mentionSlug || displayName)
        const slugEn = toMentionSlug(nameEn)
        const slugKh = toMentionSlug(nameKh)

        const mentionSlugs = uniq([slugUsed, slugEn, slugKh])

        return {
            ...place,
            _id,
            name: displayName,
            nameEn,
            nameKh,
            mentionSlug: slugUsed,
            mentionSlugs,
        }
    }, [])

    const getLocationSlugs = (loc) => {
        if (!loc) return []
        if (Array.isArray(loc.mentionSlugs) && loc.mentionSlugs.length) return uniq(loc.mentionSlugs.map((x) => String(x).toLowerCase()))
        const one = toMentionSlug(loc.mentionSlug || loc.name || loc.nameEn || loc.nameKh || '')
        return one ? [one] : []
    }
    const removeMentionsForSlugs = (text, slugs = []) => {
        let out = String(text || '')
        const list = uniq(slugs.map((s) => String(s).toLowerCase()))

        list.forEach((slug) => {
            const re = new RegExp(`(^|\\s)@(?:${PLACE_MARK})?${escapeRegExp(slug)}(?=\\s|$)`, 'giu')
            out = out.replace(re, (m, sp) => sp)
        })

        out = out.replace(/[ \t]{2,}/g, ' ')
        out = out.replace(/ \n/g, '\n')
        out = out.replace(/\n /g, '\n')
        return out
    }
    const appendMentionIfMissing = (text, slug) => {
        const s = String(slug || '').toLowerCase()
        if (!s) return String(text || '')

        // match both forms: @slug OR @<mark>slug
        const re = new RegExp(`(^|\\s)@(?:${PLACE_MARK})?${escapeRegExp(s)}(?=\\s|$)`, 'i')
        const cur = String(text || '')
        if (re.test(cur)) return cur

        const sep = cur && !/[\s\n]$/.test(cur) ? ' ' : ''
        return `${cur}${sep}@${PLACE_MARK}${s} `
    }


    const setDescriptionAndTags = useCallback(
        (txt) => {
            const next = String(txt || '')
            const extracted = extractHashtags(next)
            form?.setFieldsValue({
                description: next,
                caption: next, // keep old concept (if you use caption somewhere)
                hashtags: extracted,
            })
        },
        [form]
    )

    const syncLocationsFromDescription = useCallback(
        (txt, meta = {}) => {
            const inputType = String(meta?.inputType || '')
            const isDelete = inputType.startsWith('delete')

            const mentionSlugs = extractMentions(txt)
            if (mentionSlugs.length > 0) hadMentionsRef.current = true

            //  IMPORTANT:
            // - If user is typing/spacing (not delete) -> DO NOT unselect places
            if (!isDelete) return

            //  If there are NO mentions, don't wipe everything unless we already had mentions before
            // (meaning user likely deleted them)
            if (mentionSlugs.length === 0 && !hadMentionsRef.current) return

            const base = Array.isArray(selectedLocations) ? selectedLocations : []
            if (!base.length) return

            const next = base.filter((loc) => {
                const slugs = getLocationSlugs(loc)
                return slugs.some((s) => mentionSlugs.includes(String(s).toLowerCase()))
            })

            if (next.length !== base.length) {
                setAllLocations(next)
            }
        },
        [selectedLocations, setAllLocations]
    )

    //  FIX: accept meta from editor and pass into syncLocationsFromDescription
    const handleCaptionChange = (txt, meta) => {
        setDescriptionAndTags(txt)
        syncLocationsFromDescription(txt, meta) //  this was missing
    }

    //  SEARCH places (API) + set list + set pagination
    const fetchPlaces = useCallback(
        async (payload = {}) => {
            const q = String(payload?.search || '').trim()
            const page = Number(payload?.page || 1)
            const limit = Number(payload?.limit || 10)

            if (!q) {
                setPlaceSuggestions([])
                setPlacePagination({ page: 1, limit, total: 0 })
                return
            }

            try {
                const res = await BusiessPlaceOptServices.fetchBusinessPlaceOpt({
                    access_token: payload?.access_token || access_token,
                    search: q,
                    page,
                    limit,
                })

                const list = Array.isArray(res?.data) ? res.data : []
                const pg = res?.pagination || { page, limit, total: 0 }

                setPlaceSuggestions(list)
                setPlacePagination({
                    page: Number(pg?.page || page),
                    limit: Number(pg?.limit || limit),
                    total: Number(pg?.total || 0),
                })
            } catch (e) {
                console.error(e)
                setPlaceSuggestions([])
                setPlacePagination({ page: 1, limit, total: 0 })
            }
        },
        [access_token]
    )

    //  from editor: selecting place (@ dropdown)
    const onSelectPlace = useCallback(
        (place, mentionSlugUsed) => {
            const normalized = normalizePlace(place, mentionSlugUsed)
            if (!normalized?._id) return

            const base = Array.isArray(selectedLocations) ? selectedLocations : []
            if (base.some((loc) => String(loc?._id) === String(normalized._id))) return

            const updated = [...base, normalized]
            setAllLocations(updated)
        },
        [selectedLocations, setAllLocations, normalizePlace]
    )

    //  DropLocation (modal / x / unselect) -> remove/add AND sync @mention in description
    const onToggleLocation = useCallback(
        (place, forceSelected) => {
            const normalized = normalizePlace(place)
            if (!normalized?._id) return

            const base = Array.isArray(selectedLocations) ? selectedLocations : []
            const exists = base.some((x) => String(x?._id) === String(normalized._id))
            const nextSelected = typeof forceSelected === 'boolean' ? forceSelected : !exists

            const currentText = String(form?.getFieldValue?.('description') ?? captionValue ?? '')

            if (nextSelected) {
                const slug = normalized.mentionSlug || toMentionSlug(normalized.name || normalized.nameEn || normalized.nameKh || '')
                const nextText = appendMentionIfMissing(currentText, slug)

                const updated = exists ? base : [...base, { ...normalized, mentionSlug: slug, mentionSlugs: uniq([slug, ...getLocationSlugs(normalized)]) }]
                setAllLocations(updated)
                setDescriptionAndTags(nextText)
                return
            }

            // remove
            const existing = base.find((x) => String(x?._id) === String(normalized._id)) || normalized
            const slugs = getLocationSlugs(existing)
            const nextText = removeMentionsForSlugs(currentText, slugs)

            const updated = base.filter((x) => String(x?._id) !== String(normalized._id))
            setAllLocations(updated)
            setDescriptionAndTags(nextText)
        },
        [selectedLocations, normalizePlace, setAllLocations, form, captionValue, setDescriptionAndTags]
    )

    const handleSelectMention = (item) => {
        const baseText = String(form?.getFieldValue?.('description') ?? captionValue ?? '')

        // keep old concept for user mention
        if (mentionType !== 'place') {
            const newText = `${baseText}${baseText && !/[\s\n]$/.test(baseText) ? ' ' : ''}@${item.name} `
            setDescriptionAndTags(newText)
            setIsMentionModalVisible(false)
            setMentionSearchTerm('')
            return
        }

        //  if mentionType is place, use slug so it can be removed correctly
        const slug = toMentionSlug(item?.name || item?.nameEn || item?.nameKh || '')
        const newText = `${baseText}${baseText && !/[\s\n]$/.test(baseText) ? ' ' : ''}@${slug} `
        setDescriptionAndTags(newText)
        onSelectPlace(item, slug)

        setIsMentionModalVisible(false)
        setMentionSearchTerm('')
    }

    return (
        <div className="font-sans">
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    component={false}
                    initialValues={{
                        title: '',
                        description: '',
                        caption: '',
                        status: 'Active',
                        hashtags: [],
                    }}
                >
                    {isMoment === 'post' && (
                        <Form.Item name="title" label={<span className="text-gray-700 font-medium">Title</span>}>
                            <Input placeholder="Enter title" disabled={disableMention} />
                        </Form.Item>
                    )}

                    <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select a status!' }]}>
                        <Select placeholder="Select status" disabled={disableMention} allowClear>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                            <Option value="Expired">Expired</Option>
                        </Select>
                    </Form.Item>

                    {/* Caption editor */}
                    <Form.Item

                        style={{ marginBottom: 0 }}
                        name="description"
                        label={
                            <span className="text-gray-700 font-medium">
                                {isMoment === 'post' ? 'Description' : isMoment === 'video' ? 'Caption' : ''}
                            </span>
                        }
                    >
                        <DescriptionHastage
                            value={captionValue}
                            hashtags={hashtagsValue}
                            onChange={handleCaptionChange} //  now receives (txt, meta)
                            placeholder={placeholderText}
                            placeSuggestions={placeSuggestions}
                            placePagination={placePagination}
                            fetchPlaces={fetchPlaces}
                            disableMention={disableMention}
                            onSelectPlace={onSelectPlace}
                        />
                    </Form.Item>

                    <div className="text-right text-sm text-gray-500 mt-1">{String(captionValue).length}</div>

                    <Form.Item name="hashtags" hidden>
                        <Input />
                    </Form.Item>

                    {/* IMPORTANT: this holds the real list for validation & submit */}
                    <Form.Item name="location" hidden>
                        <Input />
                    </Form.Item>
                </Form>

                {/* Drop Location (now synced with @mention) */}
                <DropLocation
                    form={form}
                    locations={selectedLocations || []}
                    setLocations={setAllLocations}
                    mentionSearchResults={mentionSearchResults}
                    onToggleLocation={onToggleLocation}
                />

                {/* Mention Modal */}
                <Mention
                    isMentionModalVisible={isMentionModalVisible}
                    setIsMentionModalVisible={setIsMentionModalVisible}
                    mentionType={mentionType}
                    setMentionType={setMentionType}
                    mentionSearchResults={mentionSearchResults}
                    mentionSearchTerm={mentionSearchTerm}
                    handleSelectMention={handleSelectMention}
                    setMentionSearchTerm={setMentionSearchTerm}
                    setMentionSearchResults={setMentionSearchResults}
                />
            </Card>
        </div>
    )
}

export default TextForm
