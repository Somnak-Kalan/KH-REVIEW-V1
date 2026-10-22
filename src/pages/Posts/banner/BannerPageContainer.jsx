import {
    Breadcrumb,
    Pagination,
    Table,
    Card,
} from 'antd'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import SearchAction from '../../../components/Filter/Post/FilterBanner'
import SwitchOffOn from '../../../components/post/banner/LiveAndHiddenOnApp'
import TableHeader from '../../../widgets/TableHeader'

import {
    HomeOutlined,
} from '@ant-design/icons'

import AddBannerComponent from './Add'
import EditBannerComponent from './Edit'
import dayjs from 'dayjs'
import Dashboard from '../../../components/Dashboard/StatusCard'
import { PERMS } from '../../../constants/permission/perms'
import { useBannerStore } from '../../../Stores/Post/Banner.store'
import helpFunctions from '../../../utils/helpFunctions'
import showAlert from '../../../components/Action/ConfirmRemove'
import ReOrder from './reorder/Reorder'
import CountdownTimer from '../../../components/post/banner/mainFunction/CountDown'
import ImageLoading from '../../../components/Loading/ImageLoading'

//  extracted
import { useBannerPageData } from '../../../hooks/Post/Banner/useBannerPageData'
import { getBannerColumns } from './ui/bannerColumns'
import BannerCardView from './ui/BannerCardView'

const BANNER_VIEW_MODE_KEY = 'banner_view_mode'

const BannerPageContainer = () => {
    const { user, access_token, checkPermission } = useContext(AuthContext)
    const { setDisplayEmitContent } = useOutletContext()
    const { getFileByNewUrl } = helpFunctions
    const [tabSearchParams, setTabSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const [username, setUsername] = useState(user?.username)

    // CHECK PERMISSION
    const hasPermission = checkPermission(PERMS.PROMOTION_AND_EVENT_MANAGEMENT)

    useEffect(() => {
        if (!hasPermission) {
            navigate('/', { replace: true })
        }
    }, [hasPermission, navigate])
    // END CHECK PERMISSION

    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [propData, setPropData] = useState()
    const [openOrder, setOrder] = useState(false)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem(BANNER_VIEW_MODE_KEY)
    }) // 'table' or 'card'
    const { listBanner, summaryStatus } = useBannerStore()

    //  moved “heavy lines ~100-250” to hook
    const {
        tabData,
        setTabData,
        activeTab,
        setActiveTab,
        loading,
        getBannerList,
        currentTabState,
        data,
        currentPage,
        pageSize,
        total,
        renderStatusTag,
        handleUpdateStatus,
    } = useBannerPageData({
        access_token,
        listBanner,
        dayjs,
    })

    useEffect(() => {
        localStorage.setItem(BANNER_VIEW_MODE_KEY, viewMode)
    }, [viewMode])

    const handleEdit = (record) => {
        setPropData(record)
        setOpenEdit(true)
    }

    const handleView = (record) => {
        navigate('/banner/detail/' + record?._id)
    }

    const onSwitchView = (value) => setViewMode(value)

    useEffect(() => {
        setDisplayEmitContent(
            <div className='flex justify-between my-3'>
                <Breadcrumb
                    items={[
                        {
                            title: <HomeOutlined style={{ cursor: 'pointer' }} />,
                        },
                        {
                            href: '',
                            title: <span>Post</span>,
                        },
                        {
                            href: '',
                            title: <span>Banner</span>,
                        },
                    ]}
                />
            </div>
        )
    }, [navigate, setDisplayEmitContent])

    const handleSaveOrderRequest = () => {
        // reload current tab after ordering saved
        getBannerList(activeTab, {
            search: currentTabState.searchQuery,
            status: currentTabState.filterStatus,
        })
    }

    const handleTabChange = (key) => {
        if (key === activeTab) return
        setActiveTab(key)
        setTabSearchParams({ tab: key })
    }

    useEffect(() => {
        const tab = tabSearchParams.get('tab')

        if (tab && ['bannerInMoment', 'category', 'homeTop'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [tabSearchParams, setActiveTab])

    const columns = getBannerColumns({
        activeTab,
        handleView,
        handleEdit,
        checkPermission,
        PERMS,
        access_token,
        showAlert,
        getBannerList,
        currentTabState,
        renderStatusTag,
        handleUpdateStatus,
        CountdownTimer,
        dayjs,
    })

    return (
        <>
            {openAdd && (
                <AddBannerComponent
                    activeTab={activeTab}
                    getBannerList={() =>
                        getBannerList(activeTab, {
                            search: currentTabState.searchQuery,
                            status: currentTabState.filterStatus,
                        })
                    }
                    open={openAdd}
                    username={username}
                    setOpen={setOpenAdd}
                />
            )}

            {openEdit && (
                <EditBannerComponent
                    username={username}
                    activeTab={activeTab}
                    propData={propData}
                    getBannerList={() =>
                        getBannerList(activeTab, {
                            search: currentTabState.searchQuery,
                            status: currentTabState.filterStatus,
                        })
                    }
                    getFileByNewUrl={getFileByNewUrl}
                    open={openEdit}
                    setOpen={setOpenEdit}
                />
            )}

            {openOrder && (
                <ReOrder
                    open={openOrder}
                    setOpen={setOrder}
                    activeTab={activeTab}
                    handleSaveOrderRequest={handleSaveOrderRequest}
                />
            )}

            {/* Button-based tabs */}
            <div className='bg-white rounded p-2'>
                <div className='flex justify-start items-center space-x-4'>
                    {/* Banner In Moment Tab */}
                    <div
                        className={`p-1 rounded-lg flex-1 cursor-pointer transition-colors duration-200 ${activeTab === 'bannerInMoment' ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => handleTabChange('bannerInMoment')}
                    >
                        <div className='flex items-center space-x-2 justify-center'>
                            <HomeOutlined
                                style={{
                                    fontSize: '15px',
                                    color: activeTab === 'bannerInMoment' ? 'black' : 'gray',
                                }}
                            />
                            <span
                                className={`font-semibold text-sm ${activeTab === 'bannerInMoment' ? 'text-black' : 'text-gray-500'
                                    }`}
                            >
                                Banner In Moment
                            </span>
                        </div>
                        <div className='text-center text-sm text-gray-500'>2/2</div>
                    </div>

                    {/* Category Tab */}
                    <div
                        className={`p-1 rounded-lg flex-1 cursor-pointer transition-colors duration-200 ${activeTab === 'category' ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => handleTabChange('category')}
                    >
                        <div className='flex items-center space-x-2 justify-center'>
                            <HomeOutlined
                                style={{
                                    fontSize: '15px',
                                    color: activeTab === 'category' ? 'black' : 'gray',
                                }}
                            />
                            <span
                                className={`font-semibold text-sm ${activeTab === 'category' ? 'text-black' : 'text-gray-500'
                                    }`}
                            >
                                Banner In Category
                            </span>
                        </div>
                        <div className='text-center text-sm text-gray-500'>0/1</div>
                    </div>

                    {/* Home Top Tab */}
                    <div
                        className={`p-1 rounded-lg flex-1 cursor-pointer transition-colors duration-200 ${activeTab === 'homeTop' ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                        onClick={() => handleTabChange('homeTop')}
                    >
                        <div className='flex items-center space-x-2 justify-center'>
                            <HomeOutlined
                                style={{
                                    fontSize: '15px',
                                    color: activeTab === 'homeTop' ? 'black' : 'gray',
                                }}
                            />
                            <span
                                className={`font-semibold text-sm ${activeTab === 'homeTop' ? 'text-black' : 'text-gray-500'
                                    }`}
                            >
                                Home Top
                            </span>
                        </div>
                        <div className='text-center text-sm text-gray-500'>1/1</div>
                    </div>
                </div>
            </div>

            <SwitchOffOn
                open={openAdd}
                setOpen={setOpenAdd}
                checkPermission={checkPermission}
                PERMS={PERMS}
                activeTab={activeTab}
                access_token={access_token}
            />
            <Card className="my-2 p-0" style={{ width: '100%' }} styles={{ body: { padding: '12px' } }}>



                <Dashboard summaryStatus={summaryStatus} />

                <Card className='my-2 p-0' style={{ width: '100%' }} styles={{ body: { padding: 12 } }}>
                    <SearchAction
                        viewMode={viewMode}
                        onSwitchView={(e) => onSwitchView(e)}
                        onReorder={setOrder}
                        activeTab={activeTab}
                        viewType='banner'
                        onSearchChange={(value) =>
                            setTabData((prev) => ({
                                ...prev,
                                [activeTab]: {
                                    ...prev[activeTab],
                                    searchQuery: value,
                                    currentPage: 1,
                                },
                            }))
                        }
                        onStatusChange={(value) =>
                            setTabData((prev) => ({
                                ...prev,
                                [activeTab]: {
                                    ...prev[activeTab],
                                    filterStatus: value,
                                    currentPage: 1,
                                },
                            }))
                        }
                        onCreatedByChange={(value) =>
                            setTabData((prev) => ({
                                ...prev,
                                [activeTab]: {
                                    ...prev[activeTab],
                                    filterCreatedBy: value,
                                    currentPage: 1,
                                },
                            }))
                        }
                        onDateRangeChange={(dates) =>
                            setTabData((prev) => ({
                                ...prev,
                                [activeTab]: {
                                    ...prev[activeTab],
                                    dateRange: dates,
                                    currentPage: 1,
                                },
                            }))
                        }
                    />
                </Card>
                <TableHeader total={summaryStatus?.all} label="Total Amount">

                    <div style={{ position: 'relative' }}>
                        {loading && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 10,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.6)',
                                }}
                            >
                                <ImageLoading overlay={false} size={60} logoSize={25} />
                            </div>
                        )}

                        {viewMode === 'table' ? (
                            <Table
                                columns={columns}
                                dataSource={data}
                                bordered={false}
                                size='small'
                                loading={loading}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                className='custom-table-category'
                                rowKey='_id'
                                rowClassName={(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
                            />
                        ) : (
                            <BannerCardView
                                cardData={data}
                                activeTab={activeTab}
                                handleEdit={handleEdit}
                                handleView={handleView}
                                showAlert={showAlert}
                                access_token={access_token}
                                getBannerList={getBannerList}
                                currentTabState={currentTabState}
                                dayjs={dayjs}
                            />
                        )}

                        <div className='flex justify-end my-4' style={{ textAlign: 'center' }}>
                            <Pagination
                                current={currentPage}
                                total={total ?? data.length}
                                pageSize={pageSize}
                                pageSizeOptions={[
                                    '10',
                                    '20',
                                    '30',
                                    '40',
                                    '50',
                                    '60',
                                    '70',
                                    '80',
                                    '90',
                                    '100',
                                ]}
                                showSizeChanger
                                onChange={(page, size) => {
                                    setTabData((prev) => ({
                                        ...prev,
                                        [activeTab]: {
                                            ...prev[activeTab],
                                            currentPage: page,
                                            pageSize: size,
                                        },
                                    }))
                                }}
                                onShowSizeChange={(current, size) => {
                                    setTabData((prev) => ({
                                        ...prev,
                                        [activeTab]: {
                                            ...prev[activeTab],
                                            currentPage: 1,
                                            pageSize: size,
                                        },
                                    }))
                                }}
                            />
                        </div>
                    </div>
                </TableHeader>
            </Card>
        </>
    )
}

export default BannerPageContainer
