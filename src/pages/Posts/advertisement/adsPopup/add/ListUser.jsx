import React, { useState } from 'react';
import { List, Input } from 'antd';
import { Search } from 'lucide-react';

// Mock data for users
const MOCK_USER_DATA = [
    { _id: '1', nameEn: 'John Doe', province: 'Phnom Penh', category: 'Software Engineer', image: 'https://placehold.co/40x40/5c6ac4/ffffff?text=JD' },
    { _id: '2', nameEn: 'Jane Smith', province: 'Siem Reap', category: 'UX Designer', image: 'https://placehold.co/40x40/de752a/ffffff?text=JS' },
    { _id: '3', nameEn: 'Peter Jones', province: 'Battambang', category: 'Data Scientist', image: 'https://placehold.co/40x40/1a9e7a/ffffff?text=PJ' },
    { _id: '4', nameEn: 'Lisa Chen', province: 'Phnom Penh', category: 'Project Manager', image: 'https://placehold.co/40x40/d64545/ffffff?text=LC' },
    { _id: '5', nameEn: 'Mike Brown', province: 'Phnom Penh', category: 'Product Manager', image: 'https://placehold.co/40x40/737373/ffffff?text=MS' },
];

const UserSelection = (props) => {
    // State to hold the array of selected user IDs
    const [selectedUsers, setSelectedUsers] = useState([]);

    // State for the search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for the filtered list of users, initialized with all mock data
    const [filteredUsers, setFilteredUsers] = useState(MOCK_USER_DATA);

    // This handler toggles the selection of multiple items
    const handleUserCheckboxChange = (id) => {
        // Check if the ID is already in the selectedUsers array
        if (selectedUsers.includes(id)) {
            // If it exists, remove it from the array
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            // If it doesn't exist, add it to the array
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    // This handler updates the search term and filters the list
    const handleSearchTermChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase();
        setSearchTerm(newSearchTerm);

        // Filter the mock data based on the new search term
        const newFilteredList = MOCK_USER_DATA.filter(item =>
            item.nameEn.toLowerCase().includes(newSearchTerm) ||
            item.province.toLowerCase().includes(newSearchTerm) ||
            item.category.toLowerCase().includes(newSearchTerm)
        );
        setFilteredUsers(newFilteredList);
    };

    return (
        <div className="">
            <div className="relative mb-4">
                {/* Search input with a magnifying glass icon */}
                <Input
                    placeholder="Search users by name, location, or role..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="w-full rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Scrollable list of users */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                <List
                    itemLayout="horizontal"
                    dataSource={filteredUsers}
                    renderItem={item => (
                        <List.Item
                            onClick={() => handleUserCheckboxChange(item._id)}
                            className="rounded-md hover:bg-gray-100 transition-colors  cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 w-full">
                                {/* Custom Checkbox: a square div with rounded corners */}
                                <div
                                    className={`w-5 h-5 flex-shrink-0 border-2 rounded-md transition-colors duration-200 flex items-center justify-center
                                        ${selectedUsers.includes(item._id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
                                    `}
                                >
                                    {/* A simple checkmark for the selected state */}
                                    {selectedUsers.includes(item._id) && (
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
                <span>{selectedUsers.length} users selected</span>
                {selectedUsers.length > 0 && (
                    <button
                        onClick={() => setSelectedUsers([])}
                        className="text-red-500 hover:text-red-700 font-semibold transition-colors focus:outline-none"
                    >
                        Unselect All
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserSelection;
