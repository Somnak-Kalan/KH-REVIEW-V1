import React, { useState } from 'react';
import { List, Input } from 'antd';
import { Search } from 'lucide-react';

// Mock data for the business places
const MOCK_BUSINESS_DATA = [
    { _id: '1', nameEn: 'Coffee Corner', province: 'Phnom Penh', category: 'Cafe', image: 'https://placehold.co/40x40/5c6ac4/ffffff?text=CC' },
    { _id: '2', nameEn: 'Tech Innovations', province: 'Siem Reap', category: 'Electronics', image: 'https://placehold.co/40x40/de752a/ffffff?text=TI' },
    { _id: '3', nameEn: 'Green Leaf Eatery', province: 'Battambang', category: 'Restaurant', image: 'https://placehold.co/40x40/1a9e7a/ffffff?text=GL' },
    { _id: '4', nameEn: 'Fashion Forward', province: 'Phnom Penh', category: 'Clothing', image: 'https://placehold.co/40x40/d64545/ffffff?text=FF' },
    { _id: '5', nameEn: 'Book Nook', province: 'Phnom Penh', category: 'Bookstore', image: 'https://placehold.co/40x40/737373/ffffff?text=BN' },
];

const PlaceSection = (props) => {
    // Destructure props for cleaner access
    const { selectedChatBusiness, setSelectedChatBusiness } = props;

    // State for the search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for the filtered list of businesses, initialized with all mock data
    const [filteredBusinessProperty, setFilteredBusinessProperty] = useState(MOCK_BUSINESS_DATA);

    // This handler toggles the selection of a single item
    const handleChatSupportCheckboxChange = (id) => {
        // If the clicked ID is already selected, unselect it by setting state to null
        if (selectedChatBusiness === id) {
            setSelectedChatBusiness(null);
        } else {
            // Otherwise, select the new ID
            setSelectedChatBusiness(id);
        }
    };

    // This handler updates the search term and filters the list
    const handleSearchTermChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase();
        setSearchTerm(newSearchTerm);

        // Filter the mock data based on the new search term
        const newFilteredList = MOCK_BUSINESS_DATA.filter(item =>
            item.nameEn.toLowerCase().includes(newSearchTerm) ||
            item.province.toLowerCase().includes(newSearchTerm) ||
            item.category.toLowerCase().includes(newSearchTerm)
        );
        setFilteredBusinessProperty(newFilteredList);
    };

    return (
        <div className="">
            <div className="relative mb-4">
                {/* Search input with a magnifying glass icon */}
                <Input
                    placeholder="Search business places by name, location, or category..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="w-full rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Scrollable list of Business Places */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                <List
                    itemLayout="horizontal"
                    dataSource={filteredBusinessProperty}
                    renderItem={item => (
                        <List.Item
                            onClick={() => handleChatSupportCheckboxChange(item._id)}
                            className="rounded-md hover:bg-gray-100 transition-colors  cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 w-full">
                                {/* Custom Checkbox: a rounded-full div */}
                                <div
                                    className={`w-5 h-5 flex-shrink-0 border-2 rounded-full transition-colors duration-200 flex items-center justify-center
                                        ${item._id === selectedChatBusiness ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
                                    `}
                                >
                                    {/* A simple checkmark for the selected state */}
                                    {item._id === selectedChatBusiness && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <img
                                    src={item.image}
                                    alt={item.nameEn}
                                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                                />
                                <div className="flex-grow">
                                    <p className="font-medium text-sm mb-0 text-gray-800">{item.nameEn}</p>
                                    <p className="text-xs text-gray-500 mb-0">{item.province} - {item.category}</p>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>

            {/* Selection status display and unselect button */}
            <div className="mt-4 text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>{selectedChatBusiness ? '1 business selected' : '0 businesses selected'}</span>
                {selectedChatBusiness && (
                    <button
                        onClick={() => setSelectedChatBusiness(null)}
                        className="text-red-500 hover:text-red-700 font-semibold transition-colors focus:outline-none"
                    >
                        Unselect
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlaceSection;
