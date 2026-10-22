
import React, { useMemo, useState } from 'react'
import { Row, Col } from 'antd'
import Logo from '../../../assets/logo/Newkhlogo.png' // adjust path
const pickSmallImage = (images = []) => {
    if (!Array.isArray(images)) return ''
    return (
        images.find((u) => typeof u === 'string' && u.includes('/original-')) ||
        images[3] ||
        images[0] ||
        ''
    )
}
const FALLBACK_IMG =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiIC8+PHRleHQgeD0iMTUwIiB5PSIxMDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTZweCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

export default function ProvinceGrid({ data = [], onView }) {
    // Track loading state by province id
    const initialLoadingMap = useMemo(() => {
        const m = {}
        data?.forEach((p) => {
            if (p?._id) m[p._id] = true
        })
        return m
    }, [data])

    const [imgLoading, setImgLoading] = useState(initialLoadingMap)

    const setLoaded = (id) => {
        if (!id) return
        setImgLoading((prev) => ({ ...prev, [id]: false }))
    }

    const setError = (id, e) => {
        // stop spinner + fallback image
        setLoaded(id)
        if (e?.currentTarget) {
            e.currentTarget.src = FALLBACK_IMG
        }
    }

    return (
        <Row gutter={[16, 16]} className="my-4">
            {data.map((p) => {
                const img = pickSmallImage(p?.images)
                const id = p?._id
                const isLoading = imgLoading?.[id] !== false

                return (
                    <Col key={id} xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                        <div
                            className="
                                rounded overflow-hidden shadow bg-white transition
                                hover:shadow-xl hover:scale-[1.01]
                                dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800
                            "
                        >
                            <div
                                className="cursor-pointer relative bg-white dark:bg-slate-900"
                                onClick={() => onView?.(id)}
                            >
                                {/* Image */}
                                <img
                                    className="w-full h-[20vh] object-cover"
                                    src={img || FALLBACK_IMG}
                                    alt={p?.provinceEn || 'No Image'}
                                    onLoad={() => setLoaded(id)}
                                    onError={(e) => setError(id, e)}
                                    loading="lazy"
                                />

                                {/* Spinner overlay while loading */}
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                                        <div className="relative w-14 h-14">
                                            <div className="absolute inset-0 rounded-full border-4 border-slate-300 dark:border-slate-700" />
                                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />

                                            <div className="absolute inset-0 m-auto w-8 h-8 mt-5 ml-5 rounded-full " >
                                                <img src={Logo} alt="Logo" className="app-loading-logo w-1/2 " />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4">
                                <div className="font-semibold mb-2 text-center text-gray-700 dark:text-slate-200">
                                    <p className="text-xl">{p?.provinceEn || '-'}</p>
                                    <span className="text-gray-500 dark:text-slate-400">
                                        {p?.provinceKh || ''}
                                    </span>
                                </div>

                                <div className="flex justify-around items-center border-t border-gray-200 dark:border-slate-700 pt-4" />
                            </div>

                            <div className="px-6 py-4 flex justify-between text-sm text-gray-500 dark:text-slate-400">
                                <p>
                                    {p?.createdAt
                                        ? new Date(p.createdAt).toISOString().slice(0, 10)
                                        : '-'}
                                </p>
                                <p>Admin</p>
                            </div>
                        </div>
                    </Col>
                )
            })}
        </Row>
    )
}
