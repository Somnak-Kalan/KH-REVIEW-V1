import React, { useEffect, useState } from 'react';
// Placeholder image URLs
const PLACEHOLDER_BANNER_EN = 'https://placehold.co/240x80/007bff/ffffff?text=EN+Banner';
const PLACEHOLDER_BANNER_KH = 'https://placehold.co/240x80/28a745/ffffff?text=KH+Banner';
const PLACEHOLDER_STAR_IMAGE = 'https://placehold.co/12x12/FFD700/000000?text=★';
const PLACEHOLDER_VECTOR_IMAGE = 'https://placehold.co/8x8/FFD700/000000?text=★';
const PLACEHOLDER_BLANK_IMAGE = 'https://placehold.co/80x80/F5F5F5/808080?text=No+Image';
const PLACEHOLDER_DETAIL_BANNER = 'https://placehold.co/220x100/FF6347/ffffff?text=Second+Banner+Detail';
// Mock service for fetching data. This replaces the original service call.
const MockBusinessPropertyService = {
    fetchNonBusinessPropertyById: (id) => {
        console.log(`Mocking API call for ID: ${id}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        locations: [
                            {
                                nameEn: 'Mock Hotel & Resort',
                                nameKh: 'សណ្ឋាគារក្លែងក្លាយ',
                                address: {
                                    location: {
                                        provinceEn: 'Phnom Penh',
                                    },
                                },
                                media: {
                                    image: [
                                        'https://placehold.co/40x40/A0D8B3/555555?text=Hotel',
                                    ],
                                },
                            },
                        ],
                    },
                });
            }, 500); // Simulate a network delay
        });
    },
};

// Mock help functions. This replaces the original utility functions.
const MockHelpFunctions = {
    getFileByName: (fileName) => {
        return fileName;
    },
};

const MobilePreview = (props) => {
    const { previewData, fileEn, fileKh, language } = props;
    const { getFileByName } = MockHelpFunctions;

    const [activeDevice, setActiveDevice] = useState('iphone');
    const [location, setLocation] = useState();
    const [previewLanguage, setPreviewLanguage] = useState('en');
    const [isDetailVisible, setIsDetailVisible] = useState(false);

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const handleDeviceChange = (device) => {
        setActiveDevice(device);
    };
    useEffect(() => {
        setPreviewLanguage(language)
    }, [language])
    const toggleDetailContent = () => {
        setIsDetailVisible(!isDetailVisible);
    };

    const getBusinessById = async (id) => {
        try {
            const res = await MockBusinessPropertyService.fetchNonBusinessPropertyById(id);
            if (res) {
                setLocation(res?.data?.locations?.[0]);
            }
        } catch (error) {
            console.error('Error fetching business properties:', error);
        }
    };

    useEffect(() => {
        if (previewData?.placeId !== undefined) {
            getBusinessById(previewData?.placeId);
        }
    }, [previewData?.placeId]);

    return (
        <div className=" flex items-center justify-center  font-sans">
            <div className="">
                <div className="flex items-center justify-between ">
                    <div className="flex rounded-lg mb-1">
                        <button
                            onClick={() => handleDeviceChange('iphone')}
                            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${activeDevice === 'iphone'
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                            iPhone 15
                        </button>
                        <button
                            onClick={() => handleDeviceChange('android')}
                            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${activeDevice === 'android'
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-300'
                                }`}
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
                            ? 'border-black rounded-[2rem] w-[280px] h-[550px] transition-all duration-300'
                            : 'border-black rounded-[1.5rem] w-[260px] h-[550px] transition-all duration-300'
                        }`}
                // ${activeDevice === 'iphone'
                //         ? 'border-black rounded-[2rem] w-[280px] h-[600px] transition-all duration-300'
                //         : 'border-black rounded-[1.5rem] w-[260px] h-[580px] transition-all duration-300'
                //     }`}
                >
                    {activeDevice === 'iphone' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full flex items-center justify-center z-10">
                            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        </div>
                    )}

                    <div className="absolute top-0 w-full flex items-center justify-center z-10">
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

                    <div className="absolute bottom-0 left-0 w-full rounded-full flex items-center justify-center z-10">
                        <div className="absolute bottom-0 bg-white w-full border-t border-gray-200 flex justify-around items-center h-16 p-2">
                            <button className="flex-1 flex items-center justify-center bg-blue-100 text-blue-600 py-2 mx-1 rounded-full">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.78 2.49 15.45 3.37 16.92L2.05 21.05C1.88 21.57 2.41 22.1 2.93 21.93L7.06 20.61C8.53 21.51 10.22 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7 11C7.55 11 8 11.45 8 12C8 12.55 7.55 13 7 13C6.45 13 6 12.55 6 12C6 11.45 6.45 11 7 11ZM12 11C12.55 11 13 11.45 13 12C13 12.55 12.55 13 12 13C11.45 13 11 12.55 11 12C11 11.45 11.45 11 12 11ZM17 11C17.55 11 18 11.45 18 12C18 12.55 17.55 13 17 13C16.45 13 16 12.55 16 12C16 11.45 16.45 11 17 11Z" fill="#3B82F6" />
                                </svg>
                                <span className="text-xs">Chat</span>
                            </button>
                        </div>
                    </div>

                    {activeDevice === 'android' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full z-10"></div>
                    )}

                    <div className={`relative w-full h-full bg-white overflow-y-auto
                    ${activeDevice === 'iphone' ? 'rounded-[1.5rem]' : 'rounded-[1rem]'}`}>

                        {isDetailVisible ? (
                            <div className="p-[10px] bg-white mt-14">
                                <div
                                    onClick={() => setIsDetailVisible(false)}
                                    className="absolute top-8 left-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-500/50 backdrop-blur-sm cursor-pointer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </div>
                                <div className="p-2 mb-4">
                                    <img
                                        src={PLACEHOLDER_DETAIL_BANNER}
                                        alt="Detail Banner"
                                        className="w-full rounded-md object-cover"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-[10px] bg-white">
                                <div
                                    onClick={toggleDetailContent}
                                    className={`relative rounded-xl mt-12 overflow-hidden mb-4 cursor-pointer
                                    ${activeDevice === 'iphone' ? 'h-[80px]' : 'h-[76px]'}
                                    ${fileKh?.file ? '' : 'bg-black/5'}
                                    ${fileEn?.file ? '' : 'bg-black/10'}`}>
                                    <img
                                        src={previewLanguage === 'en' ? fileEn?.file || PLACEHOLDER_BANNER_EN : fileKh?.file || PLACEHOLDER_BANNER_KH}
                                        className="rounded-xl"
                                        alt="Banner"
                                    />
                                    <div style={{ width: '100%', display: 'flex', justifyContent: "center" }}>
                                        <img
                                            src={PLACEHOLDER_BLANK_IMAGE}
                                            className="rounded-xl"
                                            width={80}
                                            alt="Blank Placeholder"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 style={{ fontSize: '12px' }} className="font-bold text-gray-800">
                                        {previewLanguage === 'en' ? previewData?.titleEn || 'caption...' : previewData?.titleKh || 'ចំណងជើង...'}
                                    </h3>
                                    <p className="text-gray-500 text-xs mb-5">{date.toLocaleDateString()}</p>

                                    {/* This is the key change to render rich text */}
                                    <div
                                        style={{ fontSize: '10px' }}
                                        className="text-gray-700"
                                        dangerouslySetInnerHTML={{
                                            __html: previewLanguage === 'en' ? previewData?.descriptionEn || 'description...' : previewData?.descriptionKh || 'ការពណ៍នា...',
                                        }}
                                    />
                                </div>

                                {previewData?.placeId && (
                                    <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm mb-2">
                                        {location?.media?.image?.[0] ? (
                                            <img
                                                src={getFileByName(location?.media?.image?.[0])}
                                                alt={location?.nameEn || 'Hotel'}
                                                className="w-6 h-6 rounded-md object-cover mr-2"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/40x40/E0E0E0/555555?text=Error';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-300 rounded-md mr-2 flex items-center justify-center text-[8px] text-gray-600">
                                                No Image
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] text-gray-800 font-semibold whitespace-nowrap">
                                                    {location?.nameKh}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    <img width={8} src={PLACEHOLDER_VECTOR_IMAGE} alt="Star Icon" />
                                                    <img width={12} src={PLACEHOLDER_STAR_IMAGE} alt="Star Rating" />
                                                </div>
                                            </div>

                                            <p className="text-[7px] text-gray-500 mt-[2px]">
                                                {location?.nameEn}
                                            </p>

                                            <div className="flex items-center text-gray-600 mt-[2px]">
                                                <svg width={10} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                                    <path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z" />
                                                </svg>
                                                <span className="ml-1 text-[7px] text-gray-500">
                                                    {location?.address?.location?.provinceEn}
                                                </span>
                                            </div>
                                        </div>

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-400 ml-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobilePreview;