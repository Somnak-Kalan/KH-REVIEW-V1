import React, { useState, useEffect } from 'react';
import { Link, Smartphone, MapPin, User, BriefcaseBusiness, Search, Image as ImageIcon } from 'lucide-react';

const ActionButtonConfiguration = ({ onConfigChange }) => {
    // Use a single state object for a cleaner approach to managing configuration
    const [config, setConfig] = useState({
        buttonTitle: 'Learn More',
        actionType: 'Navigate to App Screen',
        targetAppScreen: 'Province detail',
        selectedProfile: null,
        targetWebsite: 'https://example.com'
    });

    // State for the search term
    const [searchTerm, setSearchTerm] = useState('');
    // State for the filtered profiles
    const [filteredProfiles, setFilteredProfiles] = useState([]);

    // Sample data for demonstration purposes with unique IDs and new fields
    const mockData = {
        'Province detail': [
            { id: '1', name_en: 'Phnom Penh', name_kh: 'ភ្នំពេញ', icon: <MapPin size={24} />, image: 'https://placehold.co/50x50/3366ff/FFFFFF?text=PP' },
            { id: '2', name_en: 'Siem Reap', name_kh: 'សៀមរាប', icon: <MapPin size={24} />, image: 'https://placehold.co/50x50/ff9900/FFFFFF?text=SR' },
            { id: '3', name_en: 'Battambang', name_kh: 'បាត់ដំបង', icon: <MapPin size={24} />, image: 'https://placehold.co/50x50/33cc33/FFFFFF?text=BT' },
            { id: '4', name_en: 'Preah Sihanouk', name_kh: 'ព្រះសីហនុ', icon: <MapPin size={24} />, image: null }, // Example of a null image
            { id: '5', name_en: 'Kampong Cham', name_kh: 'កំពង់ចាម', icon: <MapPin size={24} />, image: 'https://placehold.co/50x50/ff6666/FFFFFF?text=KC' },
        ],
        'Business profile': [
            { id: '6', name_en: 'Coffee Corner', name_kh: 'ហាងកាហ្វេ', icon: <BriefcaseBusiness size={24} />, image: 'https://placehold.co/50x50/996633/FFFFFF?text=CC' },
            { id: '7', name_en: 'Tech Innovations', name_kh: 'បច្ចេកវិទ្យា', icon: <BriefcaseBusiness size={24} />, image: 'https://placehold.co/50x50/666666/FFFFFF?text=TI' },
            { id: '8', name_en: 'Green Leaf Eatery', name_kh: 'ហាងអាហារ', icon: <BriefcaseBusiness size={24} />, image: null }, // Example of a null image
        ],
        'User profile': [
            { id: '9', name_en: 'John Doe', name_kh: 'ចន ដូ', icon: <User size={24} />, image: 'https://placehold.co/50x50/007bff/FFFFFF?text=JD' },
            { id: '10', name_en: 'Jane Smith', name_kh: 'ជេន ស្មីត', icon: <User size={24} />, image: null }, // Example of a null image
            { id: '11', name_en: 'Peter Jones', name_kh: 'ពីទ័រ ចូន', icon: <User size={24} />, image: 'https://placehold.co/50x50/ff4500/FFFFFF?text=PJ' },
        ],
    };

    // Effect to call the parent's handler whenever the configuration changes
    useEffect(() => {
        if (onConfigChange) {
            onConfigChange(config);
        }
    }, [config, onConfigChange]);

    // Effect to filter profiles whenever the search term or target screen changes
    useEffect(() => {
        if (config.actionType === 'Navigate to App Screen') {
            const currentProfiles = mockData[config.targetAppScreen];
            const filtered = currentProfiles.filter(profile =>
                profile.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (profile.name_kh && profile.name_kh.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredProfiles(filtered);
        }
    }, [searchTerm, config.targetAppScreen, config.actionType]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prevConfig => ({
            ...prevConfig,
            [name]: value,
            // Reset selected profile and search term when the target screen changes
            ...(name === 'targetAppScreen' && { selectedProfile: null, searchTerm: '' })
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectProfile = (profileId) => {
        setConfig(prevConfig => ({
            ...prevConfig,
            selectedProfile: profileId
        }));
    };

    return (
        <div className="rounded-xl shadow-sm space-y-0 mx-auto my-10 flex flex-col md:flex-row gap-6 font-sans">
            {/* Left side: Configuration form */}
            <div className="flex-1 space-y-1 border p-2 rounded-md ">
                {/* Button Title Input */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="buttonTitle" className="text-sm font-medium text-gray-700">Button Title</label>
                    <div className="relative">
                        <input
                            id="buttonTitle"
                            name="buttonTitle"
                            type="text"
                            value={config.buttonTitle}
                            onChange={handleInputChange}
                            placeholder="e.g. see more"
                            className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Action Type Select */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="actionType" className="text-sm font-medium text-gray-700">Action Type</label>
                    <div className="relative">
                        <select
                            id="actionType"
                            name="actionType"
                            value={config.actionType}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            <option value="Navigate to App Screen">Navigate to App Screen</option>
                            <option value="Navigate to Website">Navigate to Website</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* Conditional Target Input */}
                {config.actionType === 'Navigate to App Screen' && (
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="targetAppScreen" className="text-sm font-medium text-gray-700">Target App Screen</label>
                        <div className="relative">
                            <select
                                id="targetAppScreen"
                                name="targetAppScreen"
                                value={config.targetAppScreen}
                                onChange={handleInputChange}
                                className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                <option value="Province detail">Province detail</option>
                                <option value="Business profile">Business profile</option>
                                <option value="User profile">User profile</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <Smartphone className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}

                {config.actionType === 'Navigate to Website' && (
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="targetWebsite" className="text-sm font-medium text-gray-700">Target Website</label>
                        <div className="relative">
                            <input
                                id="targetWebsite"
                                name="targetWebsite"
                                type="text"
                                value={config.targetWebsite}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                                className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Link className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right side: Selectable list */}
            {config.actionType === 'Navigate to App Screen' && (
                <div className="flex-1 space-y-2 p-2 border bg-white rounded-md">
                    <h3 className="text-sm font-semibold text-gray-800">Select {config.targetAppScreen}</h3>
                    {/* Search Input Field */}
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder={`Search ${config.targetAppScreen}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    {/* List of profiles */}
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {filteredProfiles.length > 0 ? (
                            filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => handleSelectProfile(profile.id)}
                                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${config.selectedProfile === profile.id
                                        ? 'bg-blue-100 border-blue-500 border-2'
                                        : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    {profile.image ? (
                                        <img src={profile.image} alt={profile.name_en} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-500">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-gray-800 font-medium">{profile.name_en}</span>
                                        <span className="text-sm text-gray-500">{profile.name_kh}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-500 py-4">No results found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App component to demonstrate the usage
const App = () => {
    const [currentConfig, setCurrentConfig] = useState({});

    return (
        <div className="items-center justify-center ">
            <ActionButtonConfiguration onConfigChange={setCurrentConfig} />
        </div>
    );
};
export default App;
