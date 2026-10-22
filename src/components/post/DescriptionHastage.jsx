import React, { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { useMomentStore } from '../../Stores/Post/Moment.store'
import { AuthContext } from '../../contexts/AuthContext'

//  Khmer range fallback (when browser doesn't support \p{..})
const KHMER_RANGE = '\u1780-\u17FF\u19E0-\u19FF'
const FALLBACK_TOKEN_CHARS = `A-Za-z0-9_${KHMER_RANGE}`

//  Invisible mark to identify PLACE mentions only (so @user won't affect DropLocation)
const PLACE_MARK = '\u200c' // ZERO WIDTH NON-JOINER

//  allow hashtag/mention tokens in ALL languages (Unicode Letters + Marks + Numbers) + fallback
const VALID_TOKEN_RE = (() => {
    try {
        new RegExp('\\p{L}', 'u')
        return /^[\p{L}\p{M}\p{N}_]+$/u
    } catch {
        return new RegExp(`^[${FALLBACK_TOKEN_CHARS}]+$`, 'u')
    }
})()

const HASHTAG_HL_RE = (() => {
    try {
        new RegExp('\\p{L}', 'u')
        return /(^|[\s])(#[\p{L}\p{M}\p{N}_]+)/gu
    } catch {
        return new RegExp(`(^|[\\s])(#[${FALLBACK_TOKEN_CHARS}]+)`, 'gu')
    }
})()

//  allow optional PLACE_MARK right after @, still highlights like normal
const MENTION_HL_RE = (() => {
    try {
        new RegExp('\\p{L}', 'u')
        return new RegExp(`(^|[\\s])(@${PLACE_MARK}?[\\p{L}\\p{M}\\p{N}_]+)`, 'gu')
    } catch {
        return new RegExp(`(^|[\\s])(@${PLACE_MARK}?[${FALLBACK_TOKEN_CHARS}]+)`, 'gu')
    }
})()

//  detect Khmer in query (to prefer nameKh)
const hasKhmerChar = (s) => /[\u1780-\u17FF]/.test(String(s || ''))

const HashtagDescription = ({
    value,
    onChange,
    placeholder = 'Write here... use #hashtags',
    maxLength = 2200,

    placeSuggestions = [],

    // { page, limit, total }
    placePagination = null,

    fetchPlaces,
    onSelectPlace,
    disableMention = false

}) => {
    const editorRef = useRef(null)
    const rootRef = useRef(null)
    const debounceRef = useRef(null)
    const lastApiQueryRef = useRef('')

    const placeQueryRef = useRef('')
    const lastPlaceApiKeyRef = useRef('')

    const composingRef = useRef(false)
    const pageNavDirRef = useRef(null) // 'next' | 'prev' | null

    const { access_token } = useContext(AuthContext)
    const { hashtagSuggestions, FilterHastages } = useMomentStore()

    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [plain, setPlain] = useState(value ?? '')
    const [mode, setMode] = useState('hashtag') // 'hashtag' | 'place'
    const lastInputTypeRef = useRef('')

    const formatCount = (n) => {
        if (typeof n !== 'number') return ''
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
        return String(n)
    }

    const escapeHtml = (s) =>
        String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

    //  keep ALL-language letters/numbers/marks, remove punctuation, remove spaces
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

    const toStyledHTML = (txt) => {
        const escaped = escapeHtml(txt)

        const withTags = escaped.replace(
            HASHTAG_HL_RE,
            (m, sp, tag) => `${sp}<span class="tag-hl">${tag}</span>`
        )
        const withMentions = withTags.replace(
            MENTION_HL_RE,
            (m, sp, mention) => `${sp}<span class="mention-hl">${mention}</span>`
        )

        const html = withMentions.replace(/\n/g, '<br/>')

        if (html.length === 0) return '<br data-tail="1"/>'
        if (html.endsWith('<br/>')) return html
        return html + '<br data-tail="1"/>'
    }

    const htmlToPlain = (rootEl) => {
        if (!rootEl) return ''
        const clone = rootEl.cloneNode(true)

        clone.querySelectorAll('br[data-tail="1"]').forEach((br) => br.remove())
        clone.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')))
        clone.querySelectorAll('div, p').forEach((block) => {
            const t = block.textContent || ''
            block.replaceWith(document.createTextNode(t + '\n'))
        })

        let txt = (clone.textContent || '').replace(/\u00A0/g, ' ')
        txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        return txt
    }

    // ---------- caret marker ----------
    const insertCaretMarker = () => {
        const el = editorRef.current
        if (!el) return false
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return false
        const range = sel.getRangeAt(0)
        if (!el.contains(range.startContainer)) return false

        el.querySelectorAll('[data-caret-marker="1"]').forEach((n) => n.remove())

        const marker = document.createElement('span')
        marker.setAttribute('data-caret-marker', '1')
        marker.style.display = 'inline-block'
        marker.style.width = '0px'
        marker.style.height = '1em'
        marker.style.verticalAlign = 'bottom'

        range.insertNode(marker)
        range.setStartAfter(marker)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        return true
    }

    const getCaretIndexFromMarker = () => {
        const el = editorRef.current
        if (!el) return 0
        const marker = el.querySelector('[data-caret-marker="1"]')
        if (!marker) return htmlToPlain(el).length

        const range = document.createRange()
        range.selectNodeContents(el)
        range.setEndBefore(marker)

        const frag = range.cloneContents()
        const temp = document.createElement('div')
        temp.appendChild(frag)

        return htmlToPlain(temp).length
    }

    const restoreCaretByIndex = (index) => {
        const el = editorRef.current
        if (!el) return

        el.querySelectorAll('[data-caret-marker="1"]').forEach((n) => n.remove())

        const sel = window.getSelection()
        if (!sel) return

        let current = 0
        const walker = document.createTreeWalker(
            el,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode(node) {
                    if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') return NodeFilter.FILTER_ACCEPT
                    return NodeFilter.FILTER_SKIP
                },
            }
        )

        let node = walker.nextNode()
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const len = node.textContent.length
                if (current + len >= index) {
                    const range = document.createRange()
                    range.setStart(node, Math.max(0, index - current))
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                    return
                }
                current += len
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                if (current === index || current + 1 > index) {
                    const range = document.createRange()
                    range.setStartAfter(node)
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                    return
                }
                current += 1
            }
            node = walker.nextNode()
        }

        const r = document.createRange()
        r.selectNodeContents(el)
        r.collapse(false)
        sel.removeAllRanges()
        sel.addRange(r)
    }

    const applyPlainToEditor = (nextPlain, caretIndex) => {
        const el = editorRef.current
        if (!el) return
        el.innerHTML = toStyledHTML(nextPlain)
        restoreCaretByIndex(caretIndex)
    }

    // ---------- suggestions ----------
    const requestHashtagSuggestions = (q) => {
        const trimmed = String(q || '').trim()
        if (!trimmed) return
        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            if (lastApiQueryRef.current === trimmed) return
            lastApiQueryRef.current = trimmed
            FilterHastages({ access_token, search: trimmed, doc: {} })
        }, 400)
    }

    const requestPlaceSuggestions = (q, page = 1) => {
        const trimmed = String(q || '').trim()
        if (!trimmed) return
        if (typeof fetchPlaces !== 'function') return

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            const limit = Number(placePagination?.limit || 10)
            const key = `${trimmed}|${page}|${limit}`
            if (lastPlaceApiKeyRef.current === key) return

            lastPlaceApiKeyRef.current = key
            placeQueryRef.current = trimmed

            fetchPlaces({ access_token, search: trimmed, page, limit, doc: {} })
        }, 400)
    }

    const gotoPlacePage = (page, dir) => {
        if (typeof fetchPlaces !== 'function') return
        const q = String(placeQueryRef.current || '').trim()
        if (!q) return

        const limit = Number(placePagination?.limit || 10)
        const key = `${q}|${page}|${limit}`
        if (lastPlaceApiKeyRef.current === key) return

        lastPlaceApiKeyRef.current = key
        pageNavDirRef.current = dir

        fetchPlaces({ access_token, search: q, page, limit, doc: {} })
    }

    const filteredHashtags = useMemo(() => {
        if (!open || mode !== 'hashtag') return []
        const arr = Array.isArray(hashtagSuggestions) ? hashtagSuggestions : []
        return arr
            .map((x) => ({
                type: 'hashtag',
                tag: String(x?.hashtag || '').replace(/^#/, ''),
                count: typeof x?.usageCount === 'number' ? x.usageCount : undefined,
            }))
            .filter((x) => x.tag)
            .slice(0, 10)
    }, [open, mode, hashtagSuggestions])

    const filteredPlaces = useMemo(() => {
        if (!open || mode !== 'place') return []
        const arr = Array.isArray(placeSuggestions) ? placeSuggestions : []

        const preferKh = hasKhmerChar(placeQueryRef.current)

        return arr
            .map((x) => {
                const pickedName =
                    typeof x === 'string'
                        ? x
                        : String(
                            (preferKh ? (x?.nameKh || '') : (x?.nameEn || '')) ||
                            x?.name ||
                            x?.title ||
                            x?.placeName ||
                            x?.nameEn ||
                            x?.nameKh ||
                            ''
                        )

                const id = typeof x === 'string' ? pickedName : x?._id || x?.id
                const slug = toMentionSlug(pickedName)

                return { type: 'place', name: pickedName, id, slug, raw: x }
            })
            .filter((x) => x.name && x.slug)
            .slice(0, 10)
    }, [open, mode, placeSuggestions])

    const filtered = useMemo(() => (mode === 'place' ? filteredPlaces : filteredHashtags), [
        mode,
        filteredPlaces,
        filteredHashtags,
    ])

    const getHashtagQueryAtCaret = (txt, caretIndex) => {
        const before = txt.slice(0, caretIndex)
        const hashIndex = before.lastIndexOf('#')
        if (hashIndex === -1) return null
        const prevChar = before[hashIndex - 1]
        if (hashIndex > 0 && prevChar && !/\s/.test(prevChar)) return null
        const token = before.slice(hashIndex + 1)
        if (/\s/.test(token)) return null
        if (token.length > 0 && !VALID_TOKEN_RE.test(token)) return null
        return { start: hashIndex, end: caretIndex, q: token }
    }

    const getPlaceQueryAtCaret = (txt, caretIndex) => {
        const before = txt.slice(0, caretIndex)
        const atIndex = before.lastIndexOf('@')
        if (atIndex === -1) return null
        const prevChar = before[atIndex - 1]
        if (atIndex > 0 && prevChar && !/\s/.test(prevChar)) return null
        const token = before.slice(atIndex + 1)
        if (token.includes('\n')) return null
        if (/\s/.test(token)) return null
        if (token.length > 0 && !VALID_TOKEN_RE.test(token)) return null
        return { start: atIndex, end: caretIndex, q: token }
    }

    const closeDropdown = () => {
        setOpen(false)
        setActiveIndex(0)
        pageNavDirRef.current = null
        if (debounceRef.current) clearTimeout(debounceRef.current)
    }

    const openWithQuery = (q, nextMode = 'hashtag') => {
        setMode(nextMode)
        setOpen(true)
        setActiveIndex(0)
        if (nextMode === 'place') requestPlaceSuggestions(q, 1)
        else requestHashtagSuggestions(q)
    }

    const insertHashtag = (tagRaw) => {
        const el = editorRef.current
        if (!el) return

        insertCaretMarker()
        const caret = getCaretIndexFromMarker()
        const currentPlain = htmlToPlain(el)
        const info = getHashtagQueryAtCaret(currentPlain, caret)
        if (!info) return

        const clean = String(tagRaw || '').replace(/^#/, '')
        const before = currentPlain.slice(0, info.start)
        const after = currentPlain.slice(info.end)

        const nextPlain = `${before}#${clean} ${after}`
        const newCaret = (before + `#${clean} `).length

        setPlain(nextPlain)
        onChange?.(nextPlain, { inputType: 'insertText' })
        closeDropdown()

        requestAnimationFrame(() => {
            applyPlainToEditor(nextPlain, newCaret)
            el.focus()
        })
    }

    const insertPlace = (item) => {
        const el = editorRef.current
        if (!el) return

        insertCaretMarker()
        const caret = getCaretIndexFromMarker()
        const currentPlain = htmlToPlain(el)
        const info = getPlaceQueryAtCaret(currentPlain, caret)
        if (!info) return

        const usedSlug = toMentionSlug(item?.slug || item?.name || item)
        if (!usedSlug) return

        const before = currentPlain.slice(0, info.start)
        const after = currentPlain.slice(info.end)

        //  IMPORTANT: insert place mention with invisible PLACE_MARK
        // It LOOKS like "@slug" but stored as "@\u200cslug"
        const nextPlain = `${before}@${PLACE_MARK}${usedSlug} ${after}`
        const newCaret = (before + `@${PLACE_MARK}${usedSlug} `).length

        //  PASS BACK slugUsed so parent can add location
        if (typeof onSelectPlace === 'function') {
            onSelectPlace(item?.raw || item, usedSlug)
        }

        setPlain(nextPlain)
        onChange?.(nextPlain, { inputType: 'insertText' })
        closeDropdown()

        requestAnimationFrame(() => {
            applyPlainToEditor(nextPlain, newCaret)
            el.focus()
        })
    }

    const insertNewLineAtCaret = () => {
        const el = editorRef.current
        if (!el) return
        insertCaretMarker()
        const caret = getCaretIndexFromMarker()
        const currentPlain = htmlToPlain(el)

        const nextPlain = currentPlain.slice(0, caret) + '\n' + currentPlain.slice(caret)
        const newCaret = caret + 1

        setPlain(nextPlain)
        onChange?.(nextPlain, { inputType: 'insertLineBreak' })
        closeDropdown()

        requestAnimationFrame(() => {
            applyPlainToEditor(nextPlain, newCaret)
            el.focus()
        })
    }

    const handleInput = () => {
        const el = editorRef.current
        if (!el) return
        if (composingRef.current) return

        insertCaretMarker()
        let caret = getCaretIndexFromMarker()

        let nextPlain = htmlToPlain(el)
        if (nextPlain.length > maxLength) {
            nextPlain = nextPlain.slice(0, maxLength)
            caret = Math.min(caret, nextPlain.length)
        }

        setPlain(nextPlain)

        const meta = { inputType: lastInputTypeRef.current || '' }
        onChange?.(nextPlain, meta)
        lastInputTypeRef.current = ''

        requestAnimationFrame(() => {
            applyPlainToEditor(nextPlain, caret)

            const hashInfo = getHashtagQueryAtCaret(nextPlain, caret)
            const placeInfo = getPlaceQueryAtCaret(nextPlain, caret)

            if (placeInfo) openWithQuery(placeInfo.q, 'place')
            else if (hashInfo) openWithQuery(hashInfo.q, 'hashtag')
            else closeDropdown()
        })
    }

    const handleBeforeInput = (e) => {
        if (composingRef.current) return
        const inputType = e?.nativeEvent?.inputType || e?.inputType || ''
        lastInputTypeRef.current = inputType

        if (inputType === 'insertParagraph' || inputType === 'insertLineBreak') {
            e.preventDefault()
            insertNewLineAtCaret()
        }
    }

    const handleKeyDown = (e) => {
        if (open && filtered.length > 0) {
            const isPlace = mode === 'place'

            const page = Number(placePagination?.page || 1)
            const limit = Number(placePagination?.limit || 10)
            const total = Number(placePagination?.total || 0)
            const totalPages = limit ? Math.max(1, Math.ceil(total / limit)) : 1

            const canPrev = isPlace && page > 1
            const canNext = isPlace && page < totalPages

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                if (activeIndex < filtered.length - 1) {
                    setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
                    return
                }
                if (isPlace && canNext) gotoPlacePage(page + 1, 'next')
                return
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault()
                if (activeIndex > 0) {
                    setActiveIndex((i) => Math.max(i - 1, 0))
                    return
                }
                if (isPlace && canPrev) gotoPlacePage(page - 1, 'prev')
                return
            }

            if (e.key === 'Tab') {
                e.preventDefault()
                const item = filtered[activeIndex]
                if (!item) return
                if (item.type === 'place') insertPlace(item)
                else insertHashtag(item.tag)
                return
            }

            if (e.key === 'Escape') {
                e.preventDefault()
                closeDropdown()
                return
            }
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData?.getData('text/plain') ?? ''
        if (!text) return
        const el = editorRef.current
        if (!el) return

        insertCaretMarker()
        const caret = getCaretIndexFromMarker()
        const currentPlain = htmlToPlain(el)

        const nextPlain = (currentPlain.slice(0, caret) + text + currentPlain.slice(caret)).slice(0, maxLength)
        const newCaret = Math.min(caret + text.length, nextPlain.length)

        setPlain(nextPlain)
        onChange?.(nextPlain, { inputType: 'insertFromPaste' })

        requestAnimationFrame(() => {
            applyPlainToEditor(nextPlain, newCaret)
            el.focus()
        })
    }

    const handleClickOutside = (e) => {
        const root = rootRef.current
        if (!root) return
        if (!root.contains(e.target)) closeDropdown()
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    useEffect(() => {
        const el = editorRef.current
        if (!el) return
        el.innerHTML = toStyledHTML(plain)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (typeof value === 'string' && value !== plain) {
            setPlain(value)
            const el = editorRef.current
            if (el) el.innerHTML = toStyledHTML(value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    useEffect(() => {
        if (!open || mode !== 'place') return
        const dir = pageNavDirRef.current
        if (!dir) return

        if (dir === 'next') setActiveIndex(0)
        if (dir === 'prev')
            setActiveIndex(Math.max(0, (Array.isArray(placeSuggestions) ? placeSuggestions.length : 0) - 1))

        pageNavDirRef.current = null
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeSuggestions])

    const showPlaceholder = plain.trim().length === 0
    const dropdownMaxHeightPx = 5 * 56

    const page = Number(placePagination?.page || 1)
    const limit = Number(placePagination?.limit || 10)
    const total = Number(placePagination?.total || 0)
    const totalPages = limit ? Math.max(1, Math.ceil(total / limit)) : 1
    const canPrev = mode === 'place' && page > 1
    const canNext = mode === 'place' && page < totalPages

    return (
        <div ref={rootRef} className="w-full">
            <style>{`
        .tag-hl { color: #1677ff; font-weight: 700; }
        .mention-hl { color: #1677ff; font-weight: 700; }

        .hash-dropdown::-webkit-scrollbar { width: 8px; }
        .hash-dropdown::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 999px; }
        .hash-dropdown::-webkit-scrollbar-track { background: transparent; }
      `}</style>

            <div className="relative rounded-[12px] border border-black/10 bg-white overflow-visible">
                {/* <div
                    ref={editorRef}
                    className="w-full min-h-[160px] px-[14px] py-[14px] outline-none text-[14px] leading-[1.6] break-words whitespace-pre-wrap text-black"
                    style={{
                        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onBeforeInput={handleBeforeInput}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onCompositionStart={() => (composingRef.current = true)}
                    onCompositionEnd={() => {
                        composingRef.current = false
                        handleInput()
                    }}
                /> */}
                <div
                    ref={editorRef}
                    className={`w-full min-h-[160px] px-[14px] py-[14px] outline-none text-[14px] leading-[1.6] break-words whitespace-pre-wrap ${disableMention ? 'text-gray-400 bg-[#0000000A] cursor-not-allowed' : 'text-black'
                        }`}
                    style={{
                        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                    contentEditable={!disableMention}
                    suppressContentEditableWarning
                    spellCheck={false}
                    onBeforeInput={disableMention ? undefined : handleBeforeInput}
                    onInput={disableMention ? undefined : handleInput}
                    onKeyDown={disableMention ? undefined : handleKeyDown}
                    onPaste={disableMention ? undefined : handlePaste}
                    onCompositionStart={
                        disableMention
                            ? undefined
                            : () => {
                                composingRef.current = true
                            }
                    }
                    onCompositionEnd={
                        disableMention
                            ? undefined
                            : () => {
                                composingRef.current = false
                                handleInput()
                            }
                    }
                />

                {showPlaceholder && (
                    <div className="pointer-events-none absolute left-[14px] top-[14px] text-black/35 text-[12px] leading-[1.6]">
                        {placeholder}
                    </div>
                )}

                {open && filtered.length > 0 && (
                    <div
                        className="hash-dropdown absolute left-0 top-full mt-2 w-full bg-white rounded-xl border border-black/10 shadow-xl overflow-hidden z-50"
                        style={{ maxHeight: dropdownMaxHeightPx, overflowY: 'auto' }}
                    >
                        {filtered.map((h, idx) => (
                            <div
                                key={(h.type === 'place' ? `p-${h.id || h.slug || h.name}` : `h-${h.tag}`) + idx}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    if (h.type === 'place') insertPlace(h)
                                    else insertHashtag(h.tag)
                                }}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`flex justify-between gap-3 px-4 py-3 cursor-pointer ${idx === activeIndex ? 'bg-blue-500/10' : ''
                                    }`}
                                style={{ minHeight: 56 }}
                            >
                                {h.type === 'place' ? (
                                    <>
                                        <div className="text-xs font-bold">{h.name}</div>
                                        <div className="text-xs text-black/60 whitespace-nowrap">@{h.slug}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-xs font-bold">#{h.tag}</div>
                                        <div className="text-xs text-black/60 whitespace-nowrap">
                                            {typeof h.count === 'number' ? `${formatCount(h.count)} posts` : ''}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {mode === 'place' && (
                            <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-black/10 bg-white">
                                <button
                                    type="button"
                                    disabled={!canPrev}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        if (!canPrev) return
                                        gotoPlacePage(page - 1, 'prev')
                                    }}
                                    className={`text-xs px-3 py-1 rounded-md border ${canPrev ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                                        }`}
                                >
                                    Prev
                                </button>

                                <div className="text-xs text-black/60 whitespace-nowrap">
                                    Page <span className="font-semibold text-black/80">{page}</span> / {totalPages} • Total {total}
                                    <span className="ml-2">(↑/↓ change page)</span>
                                </div>

                                <button
                                    type="button"
                                    disabled={!canNext}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        if (!canNext) return
                                        gotoPlacePage(page + 1, 'next')
                                    }}
                                    className={`text-xs px-3 py-1 rounded-md border ${canNext ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default HashtagDescription
