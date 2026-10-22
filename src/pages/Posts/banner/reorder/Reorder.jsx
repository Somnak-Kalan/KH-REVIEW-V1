import React, { useState, useCallback, useEffect, useContext } from 'react'
import { Button, message, Modal } from 'antd'
import {
    CloseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons'
import { AuthContext } from '../../../../contexts/AuthContext'
import BannerService from '../../../../services/post/banner/Banner'
import dayjs from 'dayjs'
// Language dictionary for UI text
const translations = {
    en: {
        title: 'Ordering List',
        orderedList: 'Ordered List',
        addTasksPrompt: 'Add items here to order them.',
        saveOrder: 'Done Order',
        resetAll: 'Reset All',
        saveSuccess: 'Item order added successfully!',
    },
    km: {
        title: 'បញ្ជីលំដាប់',
        orderedList: 'បញ្ជីលំដាប់',
        addTasksPrompt: 'បន្ថែមធាតុ​នៅទីនេះ​ដើម្បី​រៀបចំ​លំដាប់។',
        saveOrder: 'រក្សាទុកលំដាប់',
        resetAll: 'កំណត់ឡើងវិញទាំងអស់',
        saveSuccess: 'បានរក្សាទុកលំដាប់ដោយជោគជ័យ!',
    },
}

// show 10 items per “screen”
const PAGE_SIZE = 10

// Small card for each item
const ListItem = ({
    item,
    index, // global index
    language,
    onUnorder,
    onMoveUp,
    onMoveDown,
    totalItems,

}) => {
    const title = language === 'en' ? item.title_en : item.title_km
    const subtitle = language === 'en' ? item.subtitle_en : item.subtitle_km

    return (
        <div className="p-2 my-1 bg-white border border-gray-200 rounded-md shadow-sm flex items-center transition-all duration-200 ease-in-out hover:shadow-md">
            <div className="flex items-center flex-1">
                {/* image */}
                <div className="w-6 h-6 mr-3 rounded-md overflow-hidden flex-shrink-0">
                    <img
                        src={item.image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* text */}
                <div>
                    <h3 className="font-semibold text-xs truncate max-w-[220px]">
                        {title}
                    </h3>
                    <p className="text-[10px] text-gray-500 truncate max-w-[220px]">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* actions */}
            <div className="flex items-center space-x-1 ml-auto">
                <Button
                    type="text"
                    size="small"
                    shape="circle"
                    icon={<ArrowUpOutlined />}
                    onClick={() => onMoveUp(index)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={index === 0}
                />
                <Button
                    type="text"
                    size="small"
                    shape="circle"
                    icon={<ArrowDownOutlined />}
                    onClick={() => onMoveDown(index)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={index === totalItems - 1}
                />
                <Button
                    type="text"
                    size="small"
                    shape="circle"
                    icon={<CloseOutlined />}
                    onClick={() => onUnorder(item)}
                    className="text-gray-500 hover:text-gray-700"
                />
            </div>
        </div>
    )
}

// helper: map tab -> type (same as your other component)
const mapTabToType = (tab) => {
    if (tab === 'homeTop') return 'HomeTop'
    if (tab === 'category') return 'Category'
    return 'Moment' // bannerInMoment
}

const ReOrder = ({ open, setOpen, activeTab = 'bannerInMoment', handleSaveOrderRequest }) => {
    const { access_token } = useContext(AuthContext)

    const [orderedItems, setOrderedItems] = useState([])
    const [language, setLanguage] = useState('en')
    const [loading, setLoading] = useState(false) // for initial fetch

    // page of 10 items we’re currently viewing
    const [page, setPage] = useState(0)

    const t = translations[language]

    const totalItems = orderedItems.length
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

    const startIndex = page * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    const visibleItems = orderedItems.slice(startIndex, endIndex)

    // ---- SAVE FULL ORDER TO SERVER (ALL ITEMS) ----
    const saveOrderToServer = useCallback(
        async (items) => {
            const type = mapTabToType(activeTab)

            // build orders array: [{ bannerId, order }]
            // use 0-based or 1-based; here I use 0-based to match your sample (0..9)
            const orders = items.map((item, index) => ({
                bannerId: item.id,
                order: index,
            }))

            try {
                await BannerService.updateBannerOrders({
                    access_token,
                    doc: {
                        // type,
                        orders,
                    },
                })
            } catch (err) {
                console.error('Failed to update banner order', err)
                message.error('Failed to update banner order')
            }
        },
        [access_token, activeTab]
    )

    // ---- FETCH DATA (follow getBannerList style, but big limit and client 10-per-view) ----
    const fetchOrderData = useCallback(async () => {
        if (!open) return
        setLoading(true)

        const type = mapTabToType(activeTab)

        try {
            const doc = {
                page: 1,
                // we fetch a bigger chunk, but UI still shows only 10 at a time
                limit: 200,
                keyword: '',
                status: '',
                createdBy: '',
                startDate: '',
                endDate: '',
                type,
            }
            const res = await BannerService.ListBanner({ access_token, doc })
            const raw = res?.data || []

            // sort by order first (so UI matches existing order)
            const sorted = [...raw].sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0)
            )

            // map API -> items for this UI (small card)
            const mapped = sorted.map((item) => ({
                id: item._id,
                title_en: item?.title?.en ?? item.titleEn ?? 'N/A',
                title_km: item?.title?.kh ?? item.titleKh ?? '',
                subtitle_en:
                    item?.description?.en ??
                    item.descriptionEn ??
                    dayjs(item?.createdAt).format('MMM D, YYYY'),
                subtitle_km:
                    item?.description?.kh ??
                    item.descriptionKh ??
                    dayjs(item?.createdAt).format('MMM D, YYYY'),
                image:
                    item?.image?.small?.en?.url ||
                    item?.image?.small?.km?.url ||
                    'https://placehold.co/64x64/EEEEEE/999999?text=B',
            }))

            setOrderedItems(mapped)
            setPage(0)
        } catch (err) {
            console.error('Error fetching banners for reorder:', err)
            message.error('Failed to load banners for ordering')
        } finally {
            setLoading(false)
        }
    }, [access_token, activeTab, open])

    useEffect(() => {
        fetchOrderData()
    }, [fetchOrderData])

    // ---- REORDER HANDLERS ----

    const handleUnorder = useCallback(
        (item) => {
            setOrderedItems((prev) => {
                const newItems = prev.filter((i) => i.id !== item.id)
                // after removing, re-sync all orders
                saveOrderToServer(newItems)
                return newItems
            })
        },
        [saveOrderToServer]
    )

    const handleMoveUp = useCallback(
        (globalIndex) => {
            if (globalIndex === 0) return

            setOrderedItems((prev) => {
                const newItems = [...prev]
                const [moved] = newItems.splice(globalIndex, 1)
                const newIndex = globalIndex - 1
                newItems.splice(newIndex, 0, moved)

                // update ALL items order to match new list
                saveOrderToServer(newItems)

                return newItems
            })

            // if we moved the first visible item up, jump page back
            if (globalIndex === startIndex && page > 0) {
                setPage((p) => p - 1)
            }
        },
        [page, startIndex, saveOrderToServer]
    )

    const handleMoveDown = useCallback(
        (globalIndex) => {
            if (globalIndex === totalItems - 1) return

            setOrderedItems((prev) => {
                const newItems = [...prev]
                const [moved] = newItems.splice(globalIndex, 1)
                const newIndex = globalIndex + 1
                newItems.splice(newIndex, 0, moved)

                // update ALL items order to match new list
                saveOrderToServer(newItems)

                return newItems
            })

            const lastIndexInPage = startIndex + visibleItems.length - 1

            // if we moved the last visible item down, jump page forward
            if (globalIndex === lastIndexInPage && page < totalPages - 1) {
                setPage((p) => p + 1)
            }
        },
        [page, startIndex, visibleItems.length, totalItems, totalPages, saveOrderToServer]
    )

    const handleReset = () => {
        // just refetch original order from server
        fetchOrderData()
    }

    const handleSaveOrder = () => {

        message.success(t?.saveSuccess)
        setOpen(false)
        handleSaveOrderRequest()
    }

    const handlePageUp = () => {
        setPage((p) => Math.max(0, p - 1))
    }

    const handlePageDown = () => {
        setPage((p) => Math.min(totalPages - 1, p + 1))
    }

    return (
        <div className="font-sans">
            <Modal
                title={t.title}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={1000}
            >
                {/* List */}
                <div className="w-full">
                    <div className="w-full">
                        <div
                            className="
               
                border-dashed border-2 border-indigo-400
                rounded-lg p-2 overflow-hidden
              "
                        >
                            <div
                                className="
                  relative h-full overflow-y-auto
                  transition-all duration-300 ease-in-out
                "
                            >
                                {visibleItems.length > 0 ? (
                                    visibleItems.map((item, indexInPage) => {
                                        const globalIndex = startIndex + indexInPage
                                        return (
                                            <ListItem
                                                key={item.id}
                                                item={item}
                                                index={globalIndex}
                                                language={language}
                                                onUnorder={handleUnorder}
                                                onMoveUp={handleMoveUp}
                                                onMoveDown={handleMoveDown}
                                                totalItems={totalItems}
                                            />
                                        )
                                    })
                                ) : (
                                    <div className="text-center text-gray-400 p-8">
                                        {loading ? 'Loading...' : t.addTasksPrompt}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* scroll 10-items-at-once controls */}
                        {totalItems > PAGE_SIZE && (
                            <div className="flex items-center justify-center mt-3 space-x-4">
                                <Button
                                    type="text"
                                    icon={<ArrowUpOutlined />}
                                    onClick={handlePageUp}
                                    disabled={page === 0}
                                />
                                <span className="text-xs text-gray-500">
                                    Page {page + 1} / {totalPages}
                                </span>
                                <Button
                                    type="text"
                                    icon={<ArrowDownOutlined />}
                                    onClick={handlePageDown}
                                    disabled={page === totalPages - 1}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mt-6 justify-center">
                    <Button
                        type="primary"
                        onClick={handleSaveOrder}
                        className="rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all"
                        disabled={orderedItems.length === 0}
                    >
                        {t.saveOrder}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default ReOrder