import React from 'react'

const pickSmallImage = (images = []) => {
    if (!Array.isArray(images)) return ''
    return (
        images.find((u) => typeof u === 'string' && u.includes('/small-')) ||
        images[3] ||
        images[0] ||
        ''
    )
}

export default function ProvinceTable({ data = [], onView }) {
    //  Mobile card list (watch-safe)
    const MobileCards = () => (
        <div className="grid gap-3 sm:hidden">
            {data.map((p) => {
                const img = pickSmallImage(p?.images)

                return (
                    <div
                        key={p?._id}
                        className="
              bg-white dark:bg-slate-900
              rounded-xl border border-gray-200 dark:border-slate-700
              p-3 shadow-sm dark:shadow-none
              active:scale-[0.99] transition cursor-pointer
            "
                        onClick={() => onView?.(p?._id)}
                    >
                        {/*  on very tiny width: stack (flex-col) */}
                        <div className="flex flex-col xs:flex-row gap-3">
                            {/*  smaller image for tiny screens */}
                            <div className="h-12 w-12 xs:h-14 xs:w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                                {img ? (
                                    <img
                                        src={img}
                                        alt={p?.provinceEn || 'province'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 dark:text-slate-100 truncate text-sm xs:text-base">
                                    {p?.provinceEn || '-'}
                                </div>
                                <div className="text-gray-500 dark:text-slate-400 text-xs xs:text-sm truncate">
                                    {p?.provinceKh || ''}
                                </div>

                                <div className="mt-2 text-xs xs:text-sm text-gray-600 dark:text-slate-300">
                                    <div className="text-gray-400 dark:text-slate-500 text-[11px]">Created</div>
                                    <div className="font-medium">
                                        {p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <button
                                        className="
                      w-full px-3 py-2 rounded-lg
                      border border-gray-300 dark:border-slate-600
                      hover:border-gray-400 dark:hover:border-slate-500
                      text-xs xs:text-sm font-medium
                      text-gray-800 dark:text-slate-100
                      bg-white dark:bg-slate-900
                    "
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onView?.(p?._id)
                                        }}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {data.length === 0 && (
                <div className="py-10 text-center text-gray-500 dark:text-slate-400">
                    No provinces found.
                </div>
            )}
        </div>
    )
    const DesktopTable = () => (
        <div className="hidden sm:block w-full overflow-x-auto">
            <table className="min-w-[640px] w-full bg-white dark:bg-slate-900">
                <thead>
                    <tr className="text-left text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-4">Province</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((p) => {
                        const img = pickSmallImage(p?.images)
                        return (
                            <tr
                                key={p?._id}
                                className="
                  border-b border-gray-200 dark:border-slate-700
                  hover:bg-gray-50 dark:hover:bg-slate-800
                  transition cursor-pointer
                "
                                onClick={() => onView?.(p?._id)}
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={p?.provinceEn || 'province'}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                                                {p?.provinceEn || '-'}
                                            </div>
                                            <div className="text-gray-500 dark:text-slate-400 text-sm truncate">
                                                {p?.provinceKh || ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-3 px-4 text-gray-700 dark:text-slate-200 whitespace-nowrap">
                                    {p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                                </td>

                                <td className="py-3 px-4 text-right">
                                    <button
                                        className="
                      px-3 py-1 rounded-lg
                      border border-gray-300 dark:border-slate-600
                      hover:border-gray-400 dark:hover:border-slate-500
                      text-sm
                      text-gray-800 dark:text-slate-100
                      bg-white dark:bg-slate-900
                    "
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onView?.(p?._id)
                                        }}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {data.length === 0 && (
                <div className="py-10 text-center text-gray-500 dark:text-slate-400">
                    No provinces found.
                </div>
            )}
        </div>
    )

    return (
        <div className="w-full">
            <MobileCards />
            <DesktopTable />
        </div>
    )
}
