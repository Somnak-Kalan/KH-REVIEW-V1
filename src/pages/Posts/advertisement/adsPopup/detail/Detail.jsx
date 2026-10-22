import React, { useState, useEffect, navigate } from 'react';
import {
    Card,
    Row, Col,
    Typography,
    Button,
    Avatar,
    Breadcrumb
} from 'antd';
import {
    ClockCircleOutlined,
    EnvironmentOutlined,
    CarOutlined,
    StarFilled,
    UserOutlined, EyeOutlined, HomeOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules'; // Import Navigation
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation'; // Import navigation styles
import { useNavigate, useOutletContext } from 'react-router-dom'
const { Title, Text, Paragraph } = Typography;

// Dummy data to simulate fetching from an API
const dummyAdvertisement = {
    id: 1,
    scheduleForLater: true,
    startDate: '2025-10-27',
    runType: 'indefinitely',
    scheduleForLater: true,
    startDate: '2025-10-27',
    runType: 'indefinitely',
    // Added new fields for start date, end date, duration, and time left
    starts: 'Oct 27, 2025 at 12:00:00 AM',
    ends: 'Nov 3, 2025 at 12:00:00 AM',
    duration: '7 days',
    timeLeft: '6 days, 8 hours, 27 minutes, 35 seconds',
    english: {
        title: 'New Product Launch Campaign',
        description: 'Discover our latest collection of sustainable and stylish products. Enjoy an exclusive 20% discount on your first order. Limited time offer!',
        smallPoster: 'https://placehold.co/200x267/F0F0F0/ADADAD?text=Small+Poster+EN',
        largePoster: 'https://placehold.co/294x267/F0F0F0/ADADAD?text=Large+Poster+EN',
    },
    khmer: {
        title: 'យុទ្ធនាការផ្សព្វផ្សាយផលិតផលថ្មី',
        description: 'ស្វែងយល់ពីបណ្តុំផលិតផលចុងក្រោយរបស់យើងដែលមាននិរន្តរភាព និងទាន់សម័យ។ សូមរីករាយជាមួយការបញ្ចុះតម្លៃពិសេស 20% លើការបញ្ជាទិញលើកដំបូងរបស់អ្នក។ ការផ្តល់ជូនមានកំណត់!',
        smallPoster: 'https://placehold.co/200x267/F0F0F0/ADADAD?text=Small+Poster+KH',
        largePoster: 'https://placehold.co/294x267/F0F0F0/ADADAD?text=Large+Poster+KH',
    }
};
const productData = {
    title: 'New Relaxed Fit Sweatshirt Vol. III',
    rating: 4.5,
    totalReviews: 623, // Renamed to avoid a duplicate key
    said: 1919,
    price: 899,
    currency: '$',
    availableColors: ['#000000', '#2C3E50', '#808080', '#A52A2A'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 5,
    images: {
        main: 'https://placehold.co/400x534/2C3E50/ADADAD?text=Main+Product',
        thumbnails: [
            'https://placehold.co/100x133/2C3E50/ADADAD?text=Thumb+1',
            'https://placehold.co/100x133/2C3E50/ADADAD?text=Thumb+2',
        ]
    },
    description: [
        'Long-sleeve dress shirt in classic fit featuring button-down collar',
        'Comfortable and quality dress shirt',
        'Go To Classic button down shirt for all special occasions',
    ],
    shipping: [
        {
            icon: <EnvironmentOutlined />,
            label: 'Delivery',
            value: 'Jakarta, Indonesia',
        },
        {
            icon: <CarOutlined />,
            label: 'Shipping',
            value: 'International Shipping',
        },
        {
            icon: <ClockCircleOutlined />,
            label: 'Arrive',
            value: 'Estimated on 27 Oct 2022',
        },
    ],
    reviews: [
        {
            name: 'Alex Mathie',
            date: '13 Oct 2024',
            stars: 5,
            comment: '"NextGen\'s dedication to sustainability and ethical practices resonates strongly with today\'s consumers, positioning the brand as a responsible choice in the fashion world."',
        },
        {
            name: 'Alex Mathie',
            date: '13 Oct 2024',
            stars: 5,
            comment: '"NextGen\'s dedication to sustainability and ethical practices resonates strongly with today\'s consumers, positioning the brand as a responsible choice in the fashion world."',
        },
    ],
};

const StarRating = ({ rating, count }) => {
    const stars = Array.from({ length: 5 }, (_, index) => (
        <StarFilled
            key={index}
            className={`text-base ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
    ));
    return (
        <div className="flex items-center space-x-1">
            <span className="text-gray-600 font-semibold">[{rating}]</span>
            <span className="flex">{stars}</span>
            <Text className="text-gray-500 text-sm">
                {count} reviews {productData.said} Said
            </Text>
        </div>
    );
};
const AdvertisementDetail = () => {
    const images = [
        dummyAdvertisement.english.smallPoster,
        dummyAdvertisement.english.largePoster,
        dummyAdvertisement.khmer.smallPoster,
        dummyAdvertisement.khmer.largePoster
    ];
    const { setDisplayEmitContent } = useOutletContext()
    const cardStyle = {
        borderRadius: 8,
        border: '1px solid #E2EFFF',
        background: '#fff',
    }
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    // Combine all four images into a single array
    const allImages = [
        productData.images.main,
        productData.images.thumbnails[0],
        productData.images.thumbnails[1],
        'https://placehold.co/400x534/ADADAD/2C3E50?text=Extra+Image'
    ];
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
                            title: <span>Advertisment</span>,
                        },
                        {
                            href: '',
                            title: <span>Detail</span>,
                        },
                    ]}
                />
            </div>
        )
    }, [navigate])
    return (
        <div className="">
            <Card
                style={{ ...cardStyle }}
                title={
                    <div className="flex items-center text-md font-semibold text-gray-800">
                        <ClockCircleOutlined className="mr-2" />
                        Advertisement Schedule
                    </div>
                }
                className="rounded-lg shadow-lg  my-2 mb-4"
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Text className="text-sm font-medium text-gray-700">Starts:</Text>
                        <Text className="font-semibold">{dummyAdvertisement.starts}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                        <Text className="text-sm font-medium text-gray-700">Ends:</Text>
                        <Text className="font-semibold">{dummyAdvertisement.ends}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                        <Text className="text-sm  font-medium text-gray-700">Duration:</Text>
                        <Text className="font-semibold">{dummyAdvertisement.duration}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                        <Text className="text-sm  font-medium text-gray-700">Time Left:</Text>
                        <Text className="font-semibold text-green-500">{dummyAdvertisement.timeLeft}</Text>
                    </div>
                </div>
            </Card>

            <Row gutter={[0, 8]} >
                <Col xs={24} sm={12} md={6} style={{ ...cardStyle }}>
                    <Card style={{ border: 'none', padding: '0px' }}>
                        <div className='flex justify-center'>
                            <div className="space-y-4 ">
                                {/* Main image */}
                                <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                                    <img
                                        src={allImages[selectedImageIndex]}
                                        alt="Main Product"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Thumbnails */}
                                <div className="flex space-x-4 justify-center">
                                    {allImages.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className="w-1/4 aspect-[4/5] rounded-lg overflow-hidden border-2 cursor-pointer transition-colors duration-300"
                                            style={{ borderColor: index === selectedImageIndex ? '#1890ff' : 'transparent' }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                            </div>

                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={18} style={{ ...cardStyle }}>
                    <Card style={{ marginBottom: '20px', border: 'none' }}>
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Advertisement EN
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        {dummyAdvertisement.english.title}
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Advertisement Kh
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        {dummyAdvertisement.khmer.title}
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Status
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        Scheduled
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Created At
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        Oct 27, 2025
                                    </Paragraph>
                                </Card>
                            </Col>

                        </Row>
                        <Row className='mt-2' gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Button Action
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        ស្វែងយល់បន្ថែម
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Action Type
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        Navigation To App screen
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card size='small' style={cardStyle}>
                                    <Text type='secondary' style={{ fontSize: '12' }}>
                                        Target App Screen
                                    </Text>
                                    <Paragraph level={5} style={{ margin: 0 }}>
                                        User Profile
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} >
                                <Card size='small' style={cardStyle}>
                                    <div className="   flex justify-between items-center ">
                                        <div className="flex items-center space-x-4 ">
                                            {/* Ant Design Avatar component */}
                                            <div>

                                            </div>
                                            <Avatar size={64} icon={<UserOutlined />} className="bg-black" />

                                            {/* User name and a label */}
                                            <div>
                                                <div className="text-xl font-bold text-gray-800">John</div>
                                                <div className="text-gray-500">ចន</div>
                                            </div>

                                        </div>
                                        <div>
                                            <ArrowRightOutlined />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                        </Row>

                    </Card>

                </Col>

            </Row>

            <Col xs={24} >
                <Card className="mt-2" size='small' style={cardStyle}>
                    <Text type='secondary' style={{ fontSize: '12' }}>
                        Description KH
                    </Text>
                    <div level={5} style={{ margin: 0, padding: 0 }}>
                        <p className='p-0 m-0'> {dummyAdvertisement.english.description}</p>
                        <p className='p-0 m-0'>  {dummyAdvertisement.khmer.description}</p>
                    </div>
                </Card>
            </Col>



        </div>
    );
};

export default AdvertisementDetail;