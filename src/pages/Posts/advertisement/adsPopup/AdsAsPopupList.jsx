import React, { useState, useEffect, useContext } from 'react';
import { Table, Tag, Space, Card, Pagination, Flex, Breadcrumb } from 'antd';
import { EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { getBannerColumns } from './Column'
import HeaderAds from './HeaderAds'
import Add from './add//Add'
import Edit from './edit/Edit'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
// Tailwind CSS is assumed to be available
import { useNavigate, useOutletContext } from 'react-router-dom'
// Placeholder for a card view, as its implementation was not provided.
const renderCardView = (data) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {data.map((item) => (
                <Card key={item.key} className="shadow-lg rounded-xl">
                    <p className="font-bold">{item.bannerDetails.split('\n')[0]}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.bannerDetails.split('\n')[3]}</p>
                    <p className="mt-2">Status: {getStatusColor(item?.status)}</p>
                    <p>Created By: {item.createdBy}</p>
                </Card>
            ))}
        </div>
    );
};

// Data used for the table
const rawData = [
    {
        key: '1',
        bannerDetails: 'Grand Opening Sale\n\n\nការផ្សព្វផ្សាយការលក់ដ៏ធំ',
        provinces: 'Phnom Penh',
        status: 'Active',
        schedule: 'Starts: Aug 21, 2025 at 12:00:00 AM',
        interaction: 'Chat Available',
        place: 'City Mall\n\n\nផ្សារទំនើប City',
        engagement: '121 details',
        createdBy: 'admin',
    },
    {
        key: '2',
        bannerDetails: 'Summer Festival\n\n\nបុណ្យរដូវក្ដៅ',
        provinces: 'Siem Reap, Battambang',
        status: 'Active',
        schedule: 'Starts: Aug 20, 2025 at 12:00:00 AM\n\nEnds: Sep 1, 2025 at 12:00:00 AM\n\nDuration: 8 days\n\nTime Left: 6 days, 8 hours, 23 minutes, 16 seconds',
        interaction: null,
        place: 'Place Not Selected Yet',
        engagement: '55 details',
        createdBy: 'manager',
    },
    {
        key: '3',
        bannerDetails: 'Expired Event\n\n\nព្រឹត្តិការណ៍ផុតកំណត់',
        provinces: 'Kep',
        status: 'Expired',
        schedule: 'Starts: Aug 18, 2025 at 12:00:00 AM\n\nEnds: Aug 23, 2025 at 12:00:00 AM\n\nDuration: 7 days\n\nEnded',
        interaction: 'Detail Only',
        place: 'Place Not Selected Yet',
        engagement: '200 details',
        createdBy: 'admin',
    },
    {
        key: '4',
        bannerDetails: 'Category Spotlight\n\n\nការផ្សព្វផ្សាយប្រភេទ',
        provinces: null,
        status: 'Pending',
        schedule: 'Starts: Aug 20, 2025 at 12:00:00 AM\n\nDuration: 5 day\n\nTime Left: 1 days, 8 hours, 23 minutes, 16 seconds',
        interaction: 'Action Button',
        place: 'Online Store\n\n\nហាងលក់ទំនិញតាមអនឡាញ',
        engagement: '300 details',
        createdBy: 'supervisor',
    },
    {
        key: '5',
        bannerDetails: 'City-wide Campaign\n\n\nយុទ្ធនាការទូទាំងទីក្រុង',
        provinces: 'Phnom Penh, Kandal',
        status: 'Inactive',
        schedule: 'Starts: Aug 20, 2025 at 12:00:00 AM\n\nEnds: Aug 25, 2025 at 12:00:00 AM\n\nDuration: 5 day\n\nTime Left: 1 days, 8 hours, 23 minutes, 16 seconds',
        interaction: null,
        place: 'Riverside Park\n\n\nឧទ្យានមាត់ទន្លេ',
        engagement: '188 details',
        createdBy: 'admin',
    },
    {
        key: '6',
        bannerDetails: 'New Year Promotion\n\n\nការផ្សព្វផ្សាយឆ្នាំថ្មី',
        provinces: 'Sihanoukville',
        status: 'Expired',
        schedule: 'Starts: Aug 23, 2025 at 12:00:00 AM\n\nEnds: Aug 25, 2025 at 12:00:00 AM\n\nDuration: 5 day\n\nEnded',
        interaction: null,
        place: 'Place Not Selected Yet',
        engagement: '96 details',
        createdBy: 'manager',
    },
];

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'active':
            return (
                <Tag color='#16a34a' className='px-4 '>
                    Active
                </Tag>
            )
        case 'pending':
            return (
                <Tag color='#6b7280' className='px-3 '>
                    Inactive
                </Tag>
            )
        case 'inactive':
            return (
                <Tag color='#dc2626' className='px-3 '>
                    Expired
                </Tag>
            )
        case 'expired':
            return (
                <Tag color='#CA8A04' className='px-3 '>
                    Pending
                </Tag>
            )
        default:
            return <Tag>Unknown</Tag>
    }
}



const PromotionAndEvents = () => {
    const [viewMode, setViewMode] = useState('table');
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const { setDisplayEmitContent } = useOutletContext()
    const { access_token, checkPermission } = useContext(AuthContext)
    const navigate = useNavigate()
    //
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    // const columns = getBannerColumns({ statusConfig })

    const [tabData, setTabData] = useState({
        all: { currentPage: 1, pageSize: 10 },
    });

    useEffect(() => {
        // This is where you would typically fetch and filter data
        setFilteredData(rawData);
        setLoading(false);
    }, []);

    const onSwitchView = (mode) => {
        setViewMode(mode);
    };

    const setOrder = () => {
        // Placeholder for reorder logic
        console.log('Reorder action triggered');
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    //
    const handleEdit = () => {
        setOpenEdit(true)
    }
    const handleView = () => {
        navigate('/ads-moment/1')
        console.log('hello');

    }
    //
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
                            title: <span>Advertisement</span>,
                        },
                        {
                            href: '',
                            title: <span>Popup</span>,
                        },
                    ]}
                />
            </div>
        )
    }, [navigate])
    return (
        <div className="">
            <Add open={openAdd} setOpen={setOpenAdd} />
            <Edit open={openEdit} setOpen={setOpenEdit} />
            <HeaderAds open={openAdd} setOpen={setOpenAdd} />
            <Card className='my-2 p-0' style={{ width: '100%' }} styles={{ body: { padding: 12 } }}>

            </Card>
            {viewMode === 'table' ? (
                <Table
                    columns={getBannerColumns({ getStatusColor: getStatusColor, checkPermission: checkPermission, PERMS: PERMS, handleEdit: handleEdit, handleView: handleView })}
                    dataSource={paginatedData}
                    bordered={false}
                    size='small'
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    className='custom-table-category'
                    rowClassName={(record, index) =>
                        index % 2 === 0 ? 'even-row' : 'odd-row'
                    }
                />
            ) : (
                renderCardView(paginatedData)
            )}
            <div className='flex justify-center my-4' style={{ textAlign: 'center' }}>
                <Pagination
                    current={currentPage}
                    total={filteredData.length}
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
                        setTabData(prev => ({
                            ...prev,
                            [activeTab]: { ...prev[activeTab], currentPage: page, pageSize: size }
                        }));
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                    onShowSizeChange={(current, size) => {
                        setTabData(prev => ({
                            ...prev,
                            [activeTab]: { ...prev[activeTab], currentPage: 1, pageSize: size }
                        }));
                        setCurrentPage(current);
                        setPageSize(size);
                    }}
                />
            </div>
        </div>
    );
}

export default PromotionAndEvents;
