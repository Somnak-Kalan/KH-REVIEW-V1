import React, { useState, useEffect, useRef } from 'react'
import { List, Input, Form } from 'antd'
import { Search } from 'lucide-react'
import BusiessPlaceOptServices from '../../../../services/options/BusinessPlace'
import helpFunctions from '../../../../utils/helpFunctions'

const PlaceSection = (props) => {
    const {
        selectedChatBusiness,
        setSelectedChatBusiness,
        access_token,
        form,
        activeTab,
    } = props

    const [searchTerm, setSearchTerm] = useState('')
    const [businessList, setBusinessList] = useState([])
    const [filteredBusinessList, setFilteredBusinessList] = useState([])
    const [loadingBusinessList, setLoadingBusinessList] = useState(false)

    const requestIdRef = useRef(0)

    const { getFileImage } = helpFunctions

    // FIX ONLY: normalize image url so it won't become: api.khreview.comhttps//....
    const getSafeImageUrl = (img) => {
        if (!img) return ''

        let s = String(img).trim()

        // fix common typo from API/data: "https//" or "http//"
        s = s.replace(/^https\/\//i, 'https://')
        s = s.replace(/^http\/\//i, 'http://')

        // if already absolute URL, return it directly (do NOT prepend api base)
        if (/^https?:\/\//i.test(s)) return s

        // otherwise use your existing helper (relative path case)
        return getFileImage(s)
    }

    const getBusinessPlaceOpt = async (search = '') => {

        const currentRequestId = ++requestIdRef.current

        try {
            setLoadingBusinessList(true)

            const res =
                await BusiessPlaceOptServices.fetchBusinessPlaceOpt({
                    access_token,
                    search,

                })

            // Ignore an older request if another API search was already started.
            if (currentRequestId !== requestIdRef.current) return

            const data = Array.isArray(res?.data)
                ? res.data
                : res?.data?.data || []

            setBusinessList(data)
            setFilteredBusinessList(data)
        } catch (error) {
            if (currentRequestId !== requestIdRef.current) return

            console.error(
                'Error fetching business place options:',
                error
            )
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setLoadingBusinessList(false)
            }
        }
    }

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            getBusinessPlaceOpt(searchTerm.trim())
        }, 400)

        return () => {
            clearTimeout(delaySearch)

            // Make any previous API request outdated when search text changes.
            requestIdRef.current += 1
        }
    }, [searchTerm, access_token])


    // Handle selection toggle
    const handleChatSupportCheckboxChange = (item, id) => {


        if (selectedChatBusiness === id) {
            setSelectedChatBusiness(null)
            form.setFieldsValue({ placeId: null })
        } else {
            setSelectedChatBusiness(id)
            form.setFieldsValue({ placeId: id })
        }
    }

    // Handle search from API
    const handleSearchTermChange = (e) => {
        const term = e.target.value
        setSearchTerm(term)
    }

    // Form submission (not really used because parent form validates/handles submit)
    const onFinish = (values) => {
        console.log('Form submitted with values:', values)
        console.log('Selected Business ID:', selectedChatBusiness)
    }

    // get error for placeId to show under list
    const placeIdErrors = form.getFieldError('placeId')

    return (
        <Form onFinish={onFinish} form={form}>
            {/* Visible wrapper to show label + error */}
            <Form.Item>
                {/* actual field used for validation */}
                <Form.Item
                    name="placeId"
                    noStyle
                    rules={[
                        {
                            required:
                                activeTab?.toLowerCase()?.trim() ===
                                    'category'
                                    ? true
                                    : false,
                            message:
                                'Please select a business place.',
                        },
                    ]}
                >
                    <Input type="hidden" />
                </Form.Item>

                {/* Search input */}
                <div className="relative mb-4">
                    <Input
                        placeholder="Search business places by name"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        className="w-full rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />

                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                </div>

                {/* List of businesses */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <List
                        loading={loadingBusinessList}
                        itemLayout="horizontal"
                        dataSource={filteredBusinessList}
                        renderItem={(item) => (
                            <List.Item
                                key={item._id}
                                onClick={() =>
                                    handleChatSupportCheckboxChange(
                                        item,
                                        item._id
                                    )
                                }
                                className="rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center space-x-3 w-full">
                                    <div
                                        className={`w-5 h-5 flex-shrink-0 border-2 rounded-full transition-colors duration-200 flex items-center justify-center
                                        ${item._id ===
                                                selectedChatBusiness
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                            }
                                        `}
                                    >
                                        {item._id ===
                                            selectedChatBusiness && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-white"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                    </div>

                                    <img
                                        src={getSafeImageUrl(
                                            item?.media?.image?.[0]
                                        )}
                                        alt={item.nameEn}
                                        className="w-8 h-8 rounded-full object-cover shadow-sm"
                                    />

                                    <div className="flex-grow">
                                        <p className="font-medium text-sm mb-0 text-gray-800">
                                            {item?.nameEn}
                                        </p>

                                        <p className="text-xs text-gray-500 mb-0">
                                            {item?.nameKh}
                                        </p>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Selected summary + unselect */}
                <div className="mt-4 text-sm font-medium text-gray-600 flex items-center justify-between">
                    <span>
                        {selectedChatBusiness
                            ? '1 business selected'
                            : '0 businesses selected'}
                    </span>

                    {selectedChatBusiness && (
                        <button
                            type="button"
                            onClick={() =>
                                handleChatSupportCheckboxChange(
                                    null,
                                    selectedChatBusiness
                                )
                            }
                            className="text-red-500 hover:text-red-700 font-semibold transition-colors focus:outline-none"
                        >
                            Unselect
                        </button>
                    )}
                </div>

                {/* (optional) show error under list if you want - you already have placeIdErrors */}
                {/* {placeIdErrors?.length > 0 && (
                    <div className="mt-2 text-xs text-red-500">{placeIdErrors[0]}</div>
                )} */}
            </Form.Item>
        </Form>
    )
}

export default PlaceSection