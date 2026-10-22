import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

// Mock data for the new UI, replicating the screenshot's content
const mockCategories = [
    {
        name: 'Hotel & Resort', khmerName: 'សណ្ឋាគារ & រីសត', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 8V20H21V8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-purple-500'
    },
    {
        name: 'Spa & Sauna', khmerName: 'ស្ប៉ា & សូណា', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 16H9C6.23858 16 4 13.7614 4 11C4 8.23858 6.23858 6 9 6H15C17.7614 6 20 8.23858 20 11C20 13.7614 17.7614 16 15 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 18C12 19.1046 11.1046 20 10 20H8C6.89543 20 6 19.1046 6 18C6 16.8954 6.89543 16 8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-blue-500'
    },
    {
        name: 'Dining', khmerName: 'អាហារ', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8C21 7.46957 20.7893 6.96086 20.4142 6.58579C20.0391 6.21071 19.5304 6 19 6H5C4.46957 6 3.96086 6.21071 3.58579 6.58579C3.21071 6.96086 3 7.46957 3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-green-500'
    },
    {
        name: 'Shopping', khmerName: 'ទិញទំនិញ', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-red-500'
    },
    {
        name: 'Location', khmerName: 'ទីតាំង', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-blue-500'
    },
    {
        name: 'Calendar', khmerName: 'ប្រតិទិន', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-green-500'
    },
    {
        name: 'Camera', khmerName: 'កាមេរ៉ា', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 9L12 14L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 14V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-yellow-500'
    },
    {
        name: 'Hotel', khmerName: 'សណ្ឋាគារ', icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19V2H2V19H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 15L8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 15L16 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), color: 'text-orange-500'
    },
];

const mockPromotions = [
    { id: 1, title: 'Hot Offer', description: 'Up to 20% off!', image: 'https://placehold.co/150x100/FF7F50/ffffff?text=Hot+Offer', khmerTitle: 'ការផ្តល់ជូនពិសេស', khmerDesc: 'បញ្ចុះតម្លៃរហូតដល់ ២០%' },
    { id: 2, title: 'Summer Sale', description: 'Book now!', image: 'https://placehold.co/150x100/6495ED/ffffff?text=Summer+Sale', khmerTitle: 'ការលក់រដូវក្តៅ', khmerDesc: 'កក់ឥឡូវនេះ!' },
    { id: 3, title: 'Holiday Deals', description: 'Don\'t miss out!', image: 'https://placehold.co/150x100/90EE90/ffffff?text=Holiday+Deals', khmerTitle: 'កិច្ចព្រមព្រៀងថ្ងៃឈប់សម្រាក', khmerDesc: 'កុំខកខាន!' },
];

const mockCards = [
    { id: 1, title: 'Luxury Hotel', khmerTitle: 'សណ្ឋាគារប្រណិត', image: 'https://placehold.co/150x100/FF6347/ffffff?text=Hotel', rating: 4.2 },
    { id: 2, title: 'Beach Resort', khmerTitle: 'រមណីយដ្ឋានឆ្នេរ', image: 'https://placehold.co/150x100/4682B4/ffffff?text=Resort', rating: 4.9 },
    { id: 3, title: 'City View Hotel', khmerTitle: 'សណ្ឋាគារមើលទីក្រុង', image: 'https://placehold.co/150x100/3CB371/ffffff?text=Hotel', rating: 4.8 },
];

const mockPosts = [
    { id: 1, title: 'Top 3 Ways to Stay Cool', khmerTitle: 'វិធី ៣ យ៉ាងដើម្បីរក្សភាពត្រជាក់', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTbpEsq_XtXy9wcLdzMTrK5Y6BVG4_EvBqM8I5pAHlUrAowMmStB5xEs0RYk3cyZAGqO8&usqp=CAU', isVideo: false, views: '1k' },
    { id: 2, title: 'Dining at our new cafe', khmerTitle: 'បរិភោគអាហារនៅហាងកាហ្វេថ្មី', image: 'https://placehold.co/100x150/8A2BE2/ffffff?text=Post+2', isVideo: true, views: '1.2k' },
    { id: 3, title: 'Weekend Getaway Ideas', khmerTitle: 'គំនិតសម្រាប់ការទៅវិស្សមកាលចុងសប្តាហ៍', image: 'https://placehold.co/100x150/48D1CC/ffffff?text=Post+3', isVideo: false, views: '800' },
    { id: 4, title: 'New Menu Items', khmerTitle: 'មុខម្ហូបថ្មី', image: 'https://placehold.co/100x150/9932CC/ffffff?text=Post+4', isVideo: false, views: '1.5k' },
    { id: 5, title: 'Exploring the city', khmerTitle: 'ស្វែងយល់ពីទីក្រុង', image: 'https://placehold.co/100x150/50C878/ffffff?text=Post+5', isVideo: false, views: '2.1k' },
    { id: 6, title: 'Delicious Local Food', khmerTitle: 'អាហារក្នុងស្រុកឆ្ងាញ់', image: 'https://placehold.co/100x150/F08080/ffffff?text=Post+6', isVideo: true, views: '1.8k' },
];

// SVG icon for the placeholder
const PlaceholderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PostDetail = ({ onBack, getLanguageText, newFileLargePost, handleChangeTitleEn, language,
    handleChangeTitleKh }) => (

    <div className="absolute top-0 left-0 w-full h-full bg-white z-10 overflow-y-auto shadow-lg">
        <button onClick={onBack} className="absolute top-8 left-4 z-40 bg-white/50 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-white/70 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>

        {
            newFileLargePost?.image?.preview ? (
                <div className='relative w-full'>
                    <div className=''>
                        <img
                            src={newFileLargePost?.image?.preview}
                            alt="Jooz Bar drinks"
                            className="w-[280px] h-[240px]  object-cover "
                        />
                    </div>
                    <div
                        className="absolute bottom-0 left-0 w-full h-1/2"
                        style={{
                            background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255, 255, 255, 0.34) 20%, rgba(255, 255, 255, 0) 100%)'
                        }}
                    />
                </div>
            ) : <div className='relative w-full'>
                <div
                    className="w-full h-60 flex items-center justify-center bg-gray-200 text-gray-500"
                >
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>

                    </div>
                </div>

                <div
                    className="absolute bottom-0 left-0 w-full h-1/2"
                    style={{
                        background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255, 255, 255, 0.34) 20%, rgba(255, 255, 255, 0) 100%)'
                    }}
                />
            </div>
        }
        <div className="relative bg-white  rounded-t-3xl z-30    pb-20">
            {/* Title */}
            {/* ចំណងជើង */}
            <h1 style={{ fontSize: '20px' }} className="font-bold mb-2 mx-2 text-gray-800">
                {language === 'en' ? handleChangeTitleEn : handleChangeTitleKh
                }

            </h1>

            <p style={{ fontSize: '13px' }} className="text-gray-500 mb-4 px-2">{dayjs().format('MM-DD-YYYY')}</p>

            <div
                style={{ fontSize: '14px' }}
                className="prose prose-lg     rounded-lg px-3"
                dangerouslySetInnerHTML={{ __html: newFileLargePost?.description }}
            />

            <div className='mx-3'>

                <div className="p-1 border rounded-lg border-gray-200  flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Hotel logo - using a placeholder */}
                        {/* និមិត្តសញ្ញាសណ្ឋាគារ - ប្រើកន្លែងដាក់ */}
                        <img
                            src="https://placehold.co/40x40/7B68EE/ffffff?text=G"
                            alt="G Mekong Hotel"
                            className="rounded-full w-6 h-6 shadow-sm"
                        />
                        <div className="ml-4">
                            <p className="font-bold text-xs text-gray-800">
                                {getLanguageText('សណ្ឋាគារ G Mekong Hotel', 'G Mekong Hotel')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {getLanguageText('G Mekong Hotel', 'សណ្ឋាគារ G Mekong')}
                            </p>
                        </div>
                    </div>
                    {/* Navigation button */}
                    {/* ប៊ូតុងរុករក */}
                    <button className="bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
);


const MobilePreview = (props) => {
    const { language, fileENSmall, fileKHSmall, fileENLarge, fileKHLarge, descriptionEn, descriptionKh, previewData, activeTab, handleChangeTitleEn,
        handleChangeTitleKh } = props;
    const [activeDevice, setActiveDevice] = useState('iphone');
    const [previewLanguage, setPreviewLanguage] = useState('en');
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [bottomTab, setBottomTab] = useState('Home');
    useEffect(() => {
        setPreviewLanguage(language);
        if (fileENSmall) {
            setIsImageUploaded(true);
        } else {
            setIsImageUploaded(false);
        }
    }, [language, fileENSmall]);

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const handleDeviceChange = (device) => {
        setActiveDevice(device);
    };

    const getLanguageText = (en, kh) => previewLanguage === 'kh' ? kh : en;

    // Use a function to get the correct icon for the navigation bar
    const getBottomNavIcon = (name, active = false) => {
        const color = active ? '#1E6BFF' : '#C7C1B7';

        switch (name) {
            case 'Home':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5 10.2L10.8 5.7C11.51 5.15 12.49 5.15 13.2 5.7L19 10.2V17.5C19 18.33 18.33 19 17.5 19H6.5C5.67 19 5 18.33 5 17.5V10.2Z"
                            stroke={color}
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={active ? color : 'none'}
                        />
                        <path
                            d="M12 14.5V17"
                            stroke={active ? '#ffffff' : color}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case 'Trending':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 18H19" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
                        <path d="M7 18V12" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
                        <path d="M12 18V9" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
                        <path d="M17 18V6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
                        <path d="M6.5 9.5L10.4 7.6L13 9.4L17.5 5.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );

            case 'Explore':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8 5.5L4.5 7.2C4.19 7.35 4 7.66 4 8V17.2C4 17.78 4.61 18.17 5.14 17.93L8 16.6M8 5.5L16 8.4M8 5.5V16.6M16 8.4L19.5 6.75C20.03 6.5 20.64 6.89 20.64 7.47V16.1C20.64 16.44 20.45 16.75 20.15 16.9L16 18.9M16 8.4V18.9M16 18.9L8 16.6"
                            stroke={color}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={active ? color : 'none'}
                        />
                    </svg>
                );

            case 'Chat':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M7.5 6H16.5C18.43 6 20 7.57 20 9.5V13C20 14.93 18.43 16.5 16.5 16.5H12L8.2 19.2C7.54 19.67 6.62 19.2 6.62 18.39V16.5H7.5C5.57 16.5 4 14.93 4 13V9.5C4 7.57 5.57 6 7.5 6Z"
                            stroke={color}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={active ? color : 'none'}
                        />
                        <circle cx="9" cy="11.2" r="1" fill={active ? '#ffffff' : color} />
                        <circle cx="12" cy="11.2" r="1" fill={active ? '#ffffff' : color} />
                        <circle cx="15" cy="11.2" r="1" fill={active ? '#ffffff' : color} />
                    </svg>
                );

            case 'Profile':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 11.5C13.933 11.5 15.5 9.933 15.5 8C15.5 6.067 13.933 4.5 12 4.5C10.067 4.5 8.5 6.067 8.5 8C8.5 9.933 10.067 11.5 12 11.5Z"
                            stroke={color}
                            strokeWidth="1.8"
                        />
                        <path
                            d="M5 18.5C6.4 15.9 8.86 14.5 12 14.5C15.14 14.5 17.6 15.9 19 18.5"
                            stroke={color}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            default:
                return null;
        }
    };
    // Create a new post object for the uploaded image file
    const newFilePost = {
        id: 'new-file',
        title: 'New Featured Post',
        khmerTitle: 'ប្រកាសពិសេសថ្មី',
        image: language === 'en' ? fileENSmall?.preview : fileKHSmall?.preview,
        isVideo: false,
        views: 'N/A'
    };
    const [newFileLargePost, setNewFileLargePost] = useState({
        id: 'new-file',
        title: 'New Featured Post',
        khmerTitle: 'ប្រកាសពិសេសថ្មី',
        image: language === 'en' ? fileENLarge?.preview : fileKHLarge?.preview,
        isVideo: false,
        views: 'N/A'
    });
    const [titleEn, setTitleEn] = useState()
    const [titleKh, setTitleKh] = useState()
    useEffect(() => {
        setNewFileLargePost(prev => ({
            ...prev,
            image: language === 'en' ? fileENLarge : fileKHLarge,
            description: language === 'en' ? descriptionEn : descriptionKh,
            title: language === 'en' ? titleEn : titleKh,
        }));
    }, [fileENLarge, fileKHLarge, language, descriptionEn, descriptionKh, titleEn, titleKh]);
    useEffect(() => {
        if (previewData?.titleEn) {
            setTitleEn(previewData?.titleEn)
        } else {
            setTitleKh(previewData?.titleKh)
        }
        if (previewData?.titleEn === '') {
            setTitleEn('')
        } else if (previewData?.titleKh === '') {
            setTitleKh('')
        }
    }, [previewData])
    // Combine the new post with the existing mock posts
    const combinedPosts = [newFilePost, ...mockPosts];

    // Split the combined posts into two columns based on their new index
    const leftColumnPosts = combinedPosts.filter((_, index) => index % 2 === 0);
    const rightColumnPosts = combinedPosts.filter((_, index) => index % 2 !== 0);
    return (
        <div className="flex items-center justify-center font-sans">
            <div className="">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex rounded-lg">
                        <button
                            onClick={() => handleDeviceChange('iphone')}
                            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${activeDevice === 'iphone' ? 'bg-black text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                            iPhone 15
                        </button>
                        <button
                            onClick={() => handleDeviceChange('android')}
                            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${activeDevice === 'android' ? 'bg-black text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="7" y="4" width="10" height="16" rx="1" ry="1"></rect>
                                <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                            Android
                        </button>
                    </div>
                </div>
                {/* Device Frame */}
                <div
                    className={`relative mx-auto border-[10px] bg-black/30 shadow-xl overflow-hidden
                         ${activeDevice === 'iphone'
                            ? 'border-black rounded-[2rem] w-[300px] h-[600px] transition-all duration-300'
                            : 'border-black rounded-[1.5rem] w-[280px] h-[600px] transition-all duration-300'
                        }`}
                >
                    {activeDevice === 'iphone' && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full flex items-center justify-center z-40">
                            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        </div>
                    )}
                    <div className="absolute top-[-10px] w-full flex items-center justify-center z-40">
                        <div className="flex justify-between items-center py-2 px-2 text-sm w-full">
                            <span className="font-bold">{hours}:{minutes}</span>
                            <div className="flex items-center space-x-0">
                                <svg width="25" className='' height="15" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="10" y="55" width="15" height="35" rx="7.5" fill="black" />
                                    <rect x="30" y="40" width="15" height="50" rx="7.5" fill="black" />
                                    <rect x="50" y="25" width="15" height="65" rx="7.5" fill="black" />
                                    <rect x="70" y="10" width="15" height="80" rx="7.5" fill="black" />
                                </svg>
                                <svg width="25" height="15" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M256 96C158.8 96 67.6 132.9 0 192L32 224C89.5 174.6 169.3 144 256 144C342.7 144 422.5 174.6 480 224L512 192C444.4 132.9 353.2 96 256 96Z" fill="black" />
                                    <path d="M256 224C192.3 224 129.4 247.2 80 288L112 320C153.3 285.4 203.5 264 256 264C308.5 264 358.7 285.4 400 320L432 288C382.6 247.2 319.7 224 256 224Z" fill="black" />
                                    <path d="M256 352C229.5 352 204.4 362.7 186.5 380.5L256 448L325.5 380.5C307.6 362.7 282.5 352 256 352Z" fill="black" />
                                </svg>
                                <svg width="30" height="25" viewBox="0 0 50 32" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="6" width="42" height="20" rx="6" ry="6" fill="none" stroke="#999" strokeWidth="2" />
                                    <rect x="5" y="10" width="34" height="12" rx="3" ry="3" fill="black" />
                                    <rect x="44" y="12" width="4" height="8" rx="1" ry="1" fill="#999" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {/* Main content area */}
                    <div className={`relative w-full   h-full bg-white overflow-y-auto ${activeDevice === 'iphone' ? 'rounded-[1.5rem]' : 'rounded-[1rem]'}`}>
                        {showPostDetail ? (
                            <PostDetail language={language} onBack={() => setShowPostDetail(false)} getLanguageText={getLanguageText} fileENLarge={fileENLarge} newFileLargePost={newFileLargePost} handleChangeTitleEn={handleChangeTitleEn}
                                handleChangeTitleKh={handleChangeTitleKh} />
                        ) : (
                            <>
                                {/* Top Header based on screenshot */}

                                <div className=" bg-white     z-10 mt-5 flex items-center justify-between p-3 border-b border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <h1 className="text-xl font-bold">khreview</h1>
                                    </div>
                                    <div className="flex items-center space-x-2 pr-2">
                                        <div className="p-1 rounded-full bg-red-500 text-white text-xs font-semibold">25</div>
                                        <div className="text-sm font-semibold flex items-center">
                                            {getLanguageText('EN', 'ខ្មែរ')}

                                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" viewBox="0 0 320 512" fill="currentColor">
                                                <path d="M320 448c0 17.7-14.3 32-32 32s-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32V448z" />
                                            </svg>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 512 512" fill="currentColor">
                                            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="p-3 ">
                                    {/* Navigation grid */}
                                    <div className="grid grid-cols-4 gap-4 text-center text-xs ">
                                        {mockCategories.map((category, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center  bg-gray-100`}>
                                                    {category.icon}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* // */}
                                    {
                                        activeTab !== 'bannerInMoment' && (
                                            <>
                                                {leftColumnPosts.map((post) => (
                                                    <div key={post.id} className="relative mt-4  rounded-lg overflow-hidden shadow-sm  ">
                                                        {post.id === 'new-file' && !isImageUploaded ? (
                                                            <div
                                                                className="bg-gray-200 flex items-center justify-center flex-col w-[256px] h-[87.7px]  p-4 cursor-pointer hover:bg-gray-300 transition-colors "
                                                                onClick={() => setShowPostDetail(true)}
                                                            >
                                                                <PlaceholderIcon />
                                                                <p className="mt-2 text-xs font-semibold text-gray-500 text-center">{getLanguageText(post.title, post.khmerTitle)}</p>
                                                            </div>
                                                        ) : post.id === 'new-file' && (
                                                            <div className=' w-[256px] h-[87.7px] flex items-center justify-center rounded-lg'>
                                                                <img onClick={() => setShowPostDetail(true)} src={!post?.image?.file ? post?.image : post?.image?.file} alt={getLanguageText(post.title, post.khmerTitle)} className="w-full h-auto object-contain    cursor-pointer" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        )
                                    }
                                    {/* // */}
                                    <div className={`border-t border-gray-200 ${activeTab === 'bannerInMoment' ? 'mb-3 mt-5' : ''}`}></div>
                                    {/* Cards section */}
                                    <h2 className="text-sm font-semibold mb-2">{getLanguageText('Featured Places', 'កន្លែងលេចធ្លោ')}</h2>
                                    <div className="flex space-x-2 overflow-x-auto  scrollbar-hide">
                                        {mockCards.map((card) => (
                                            <div key={card.id} className="flex-shrink-0 w-40 bg-gray-100 rounded-lg p-2 shadow-sm">
                                                <img src={card.image} alt={getLanguageText(card.title, card.khmerTitle)} className="w-full h-24 object-cover rounded-lg mb-2" />
                                            </div>
                                        ))}
                                    </div>
                                    {
                                        activeTab === 'bannerInMoment' && (
                                            <>
                                                <div className="border-t border-gray-200 my-4"></div>
                                                {/* Grid posts section */}
                                                <h2 className="text-sm font-semibold mb-2">{getLanguageText('Top Stories', 'រឿងរ៉ាវលេចធ្លោ')}</h2>

                                                <div className="flex gap-2">
                                                    {/* Right Column */}
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        {leftColumnPosts.map((post) => (
                                                            <div key={post.id} className="relative rounded-lg overflow-hidden shadow-sm  ">
                                                                {post.id === 'new-file' && !isImageUploaded ? (
                                                                    <div
                                                                        className="bg-gray-200 flex items-center justify-center flex-col w-[135px] p-4 h-[180px] cursor-pointer hover:bg-gray-300 transition-colors"
                                                                        onClick={() => setShowPostDetail(true)}
                                                                    >
                                                                        <PlaceholderIcon />
                                                                        <p className="mt-2 text-xs font-semibold text-gray-500 text-center">{getLanguageText(post.title, post.khmerTitle)}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className='w-[135px]  h-[180px] flex items-center justify-center rounded-lg'>

                                                                        <img onClick={() => setShowPostDetail(true)} src={!post?.image?.file ? post?.image : post?.image?.file} alt={getLanguageText(post.title, post.khmerTitle)} className="w-full h-auto object-contain    cursor-pointer" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Left Column */}
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        {rightColumnPosts.map((post) => (
                                                            <div key={post.id} className="relative rounded-lg overflow-hidden shadow-sm h-[125px] h-[170px]">
                                                                <img src={post.image} alt={getLanguageText(post.title, post.khmerTitle)} className="w-full h-auto object-contain " />
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>
                                            </>
                                        )
                                    }

                                </div>
                            </>
                        )}
                    </div>
                    {/* Bottom Navigation */}
                    {/* Bottom Navigation */}
                    {!showPostDetail && (
                        <div className="absolute bottom-0 left-0 w-full px-0">
                            <div className="relative w-full h-[78px] bg-white border-t border-gray-200 rounded-t-[22px] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-start justify-between overflow-hidden">
                                {[
                                    { key: 'Home', labelEn: 'Home', labelKh: 'ទំព័រដើម' },
                                    { key: 'Trending', labelEn: 'Trending', labelKh: 'ពេញនិយម' },
                                    { key: 'Explore', labelEn: 'Explore', labelKh: 'រុករក' },
                                    { key: 'Chat', labelEn: 'Chat', labelKh: 'ជជែក' },
                                    { key: 'Profile', labelEn: 'Profile', labelKh: 'គណនី' },
                                ].map((item) => {
                                    const isActive = bottomTab === item.key;

                                    return (
                                        <div
                                            key={item.key}
                                            onClick={() => setBottomTab(item.key)}
                                            className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer"
                                        >
                                            <div
                                                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-200 ${isActive ? 'w-[78%] bg-blue-500' : 'w-0 bg-transparent'
                                                    }`}
                                            />

                                            <div
                                                className={`flex flex-col items-center justify-center gap-[2px] mt-[6px] ${isActive ? 'text-blue-600' : 'text-[#c7c1b7]'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center h-[24px]">
                                                    {getBottomNavIcon(item.key, isActive)}
                                                </div>

                                                <span className="text-[11px] leading-[14px] font-medium text-center px-1">
                                                    {getLanguageText(item.labelEn, item.labelKh)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default MobilePreview;
