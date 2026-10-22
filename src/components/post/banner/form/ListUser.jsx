import React, { useEffect, useState } from 'react'
import { List, Input } from 'antd'
import { Search } from 'lucide-react'
import UserOptServices from '../../../../services/options/User'

const UserSelection = ({ access_token, form, name = "userIds", defaultUserId = [], selectedUsers = [], setSelectedUsers }) => {
    // const [selectedUsers, setSelectedUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [allUsers, setAllUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])

    const handleUserCheckboxChange = (id) => {
        let updated
        if (selectedUsers.includes(id)) {
            updated = selectedUsers.filter(userId => userId !== id)
        } else {
            updated = [...selectedUsers, id]
        }
        setSelectedUsers(updated)
        form.setFieldsValue({ [name]: updated })
    }

    const getUserOpt = async () => {
        try {
            const res = await UserOptServices.fetchUserOpt({ access_token })
            if (res?.data) {
                setAllUsers(res.data)
                setFilteredUsers(res.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    useEffect(() => {
        getUserOpt()
    }, [])


    useEffect(() => {
        if (allUsers?.length > 0 && defaultUserId?.length > 0) {
            setSelectedUsers(defaultUserId)
            form.setFieldsValue({ [name]: defaultUserId })
        }
    }, [allUsers, defaultUserId, form, name])


    const handleSearchTermChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase()
        setSearchTerm(newSearchTerm)
        const newFilteredList = allUsers.filter(item =>
            item?.nameEn?.toLowerCase().includes(newSearchTerm) ||
            item?.username?.toLowerCase().includes(newSearchTerm)
        )
        setFilteredUsers(newFilteredList)
    }

    return (
        <div>
            {/* Search Input */}
            <div className="relative mb-4">
                <Input
                    placeholder="Search users by name"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="w-full rounded-md py-2 pl-10 pr-4 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* User List */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                <List
                    itemLayout="horizontal"
                    dataSource={filteredUsers}
                    renderItem={item => (
                        <List.Item
                            key={item._id}
                            onClick={() => handleUserCheckboxChange(item._id)}
                            className="rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 w-full">
                                <div
                                    className={`w-5 h-5 border-2 rounded-md flex items-center justify-center
                                    ${selectedUsers.includes(item._id)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'}
                                `}
                                >
                                    {selectedUsers.includes(item._id) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <p className="font-medium text-sm text-gray-800">{item?.username}</p>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>

            {/* Footer */}
            <div className="mt-4 text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>{selectedUsers.length} users selected</span>
                {selectedUsers.length > 0 && (
                    <button
                        onClick={() => {
                            setSelectedUsers([])
                            form.setFieldsValue({ [name]: [] })
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold"
                    >
                        Unselect All
                    </button>
                )}
            </div>
        </div>
    )
}

export default UserSelection

