import React, { useState, useEffect } from 'react'
import { Link, Smartphone, Search, Image as ImageIcon } from 'lucide-react'
import BannerService from '../../../../services/options/Address'
import UserOptServices from '../../../../services/options/User'
import BusiessPlaceOptServices from '../../../../services/options/BusinessPlace'
import { Form, Select } from 'antd'

const mapTargetScreenKey = (key) => {
    // Normalize any older values to the keys we use in mockData
    switch (key) {
        case 'ProvinceProfile':

            return 'ProvinceProfile'
        case 'PlaceProfile':

            return 'PlaceProfile'

        case 'UserProfile':
            return 'UserProfile'
        default:
            return 'ProvinceProfile'
    }
}

const ActionButtonConfiguration = ({
    access_token,
    bannerType,
    setCurrentConfig,
    form,
    config,
    setConfig,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredProfiles, setFilteredProfiles] = useState([])
    const [mockData, setMockData] = useState({
        ProvinceProfile: [],
        PlaceProfile: [],
        UserProfile: [],
    })

    const getUserOpt = async () => {
        try {
            const res = await UserOptServices.fetchUserOpt({ access_token })
            setMockData((prev) => ({
                ...prev,
                UserProfile: [...prev.UserProfile, ...(res?.data || [])],
            }))
        } catch (error) {
            console.error('Error fetching user options:', error)
        }
    }

    const getBusinessPlaceOpt = async () => {
        try {
            const res = await BusiessPlaceOptServices.fetchBusinessPlaceOpt({
                access_token,
            })
            setMockData((prev) => ({
                ...prev,
                PlaceProfile: [...prev.PlaceProfile, ...(res?.data || [])],
            }))
        } catch (error) {
            console.error('Error fetching business place options:', error)
        }
    }

    const getProvinceOpt = async () => {
        try {
            const res = await BannerService.getProvinceOpt({ access_token })
            setMockData((prev) => ({
                ...prev,
                ProvinceProfile: [...prev.ProvinceProfile, ...(res?.data || [])],
            }))
        } catch (error) {
            console.error('Error fetching provinces:', error)
        }
    }

    useEffect(() => {
        getUserOpt()
        getBusinessPlaceOpt()
        getProvinceOpt()
    }, [bannerType])

    // Ensure we always have a normalized targetScreen in config
    useEffect(() => {
        if (!config.targetScreen) {
            setConfig((prev) => ({
                ...prev,
                targetScreen: 'ProvinceProfile',
            }))
        } else {
            const normalized = mapTargetScreenKey(config.targetScreen)
            if (normalized !== config.targetScreen) {
                setConfig((prev) => ({
                    ...prev,
                    targetScreen: normalized,
                }))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // only on mount

    useEffect(() => {
        if (setCurrentConfig) setCurrentConfig(config)
    }, [config, setCurrentConfig])

    useEffect(() => {
        if (config.navigateTo === 'navigate_to_app') {
            const screenKey = mapTargetScreenKey(config.targetScreen)
            const currentProfiles = mockData[screenKey] || [] // ✅ always an array

            const lower = searchTerm.toLowerCase()

            const filtered = currentProfiles.filter((profile) => {
                const fields = [
                    profile?.username,
                    profile?.nickname,
                    profile?.provinceEn,
                    profile?.provinceKh,
                    profile?.nameEn,
                    profile?.nameKh,
                ]
                return fields.some(
                    (f) => typeof f === 'string' && f.toLowerCase().includes(lower),
                )
            })

            setFilteredProfiles(filtered)
        } else {
            // if we navigate to website, no profiles list
            setFilteredProfiles([])
        }
    }, [searchTerm, config.targetScreen, config.navigateTo, mockData])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === 'buttonTitleEn' || name === 'buttonTitleKh') {
            const lang = name === 'buttonTitleEn' ? 'en' : 'kh'
            setConfig((prevConfig) => ({
                ...prevConfig,
                buttonTitle: { ...prevConfig.buttonTitle, [lang]: value },
            }))
        } else {
            setConfig((prevConfig) => ({
                ...prevConfig,
                [name]: value,
                ...(name === 'targetScreen' && { selectedProfile: null }),
            }))
            if (name === 'targetScreen') setSearchTerm('')
        }
    }

    const handleSearchChange = (e) => setSearchTerm(e.target.value)

    const handleSelectProfile = (profileId) =>
        setConfig((prev) => ({ ...prev, selectedProfile: profileId }))

    useEffect(() => {
        form.setFieldsValue({ select_profile: config.selectedProfile })
    }, [config.selectedProfile, form])

    return (
        <Form
            form={form}
            initialValues={{
                navigateTo: 'navigate_to_app',
                targetScreen: 'ProvinceProfile',
            }}
        >
            <div className="rounded-xl shadow-sm space-y-0 mx-auto my-10 flex flex-col md:flex-row gap-6 font-sans">
                <div className="flex-1 space-y-1 border p-2 rounded-md">
                    {/* Button Titles */}
                    {['En', 'Kh'].map((lang) => (
                        <div key={lang} className="flex flex-col space-y-1">
                            <label
                                htmlFor={`buttonTitle${lang}`}
                                className="text-sm font-medium text-gray-700"
                            >
                                Button Title ({lang === 'En' ? 'English' : 'Khmer'})
                            </label>
                            <div className="relative">
                                <Form.Item name={`buttonTitle${lang}`}>
                                    <input
                                        id={`buttonTitle${lang}`}
                                        name={`buttonTitle${lang}`}
                                        type="text"
                                        value={config.buttonTitle[lang.toLowerCase()] || ''}
                                        onChange={handleInputChange}
                                        placeholder={
                                            lang === 'En' ? 'e.g. see more' : 'ឧ. មើលបន្ថែម'
                                        }
                                        className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    ))}

                    {/* Action Type */}
                    <div className="flex flex-col space-y-1">
                        <label
                            htmlFor="navigateTo"
                            className="text-sm font-medium text-gray-700"
                        >
                            Navigation Type
                        </label>
                        <div className="relative">
                            <Form.Item name="navigateTo">
                                <select
                                    id="navigateTo"
                                    name="navigateTo"
                                    value={config?.navigateTo}
                                    onChange={handleInputChange}
                                    className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="navigate_to_app">Navigate to App Screen</option>
                                    <option value="navigate_to_website">
                                        Navigate to Website
                                    </option>
                                </select>
                            </Form.Item>
                        </div>
                    </div>

                    {/* Target Screen */}
                    {config.navigateTo === 'navigate_to_app' && (
                        <Form.Item
                            label="Target Screen"
                            name="targetScreen"
                            labelCol={{ span: 24 }}
                            rules={[
                                { required: true, message: 'Please select a target app screen!' },
                            ]}
                        >
                            <Select
                                placeholder="Select target app screen"
                                value={mapTargetScreenKey(config.targetScreen)}
                                onChange={(value) =>
                                    setConfig((prev) => ({ ...prev, targetScreen: value }))
                                }
                            >
                                <Select.Option value="ProvinceProfile">
                                    Province detail
                                </Select.Option>
                                <Select.Option value="PlaceProfile">
                                    Business profile
                                </Select.Option>
                                <Select.Option value="UserProfile">User profile</Select.Option>
                            </Select>
                        </Form.Item>
                    )}

                    {/* Target Website */}
                    {config.navigateTo === 'navigate_to_website' && (
                        <div className="flex flex-col space-y-1">
                            <label
                                htmlFor="targetWebsite"
                                className="text-sm font-medium text-gray-700"
                            >
                                Target Website
                            </label>
                            <div className="relative">
                                <Form.Item name="website">
                                    <input
                                        id="targetWebsite"
                                        name="targetWebsite"
                                        type="text"
                                        value={config.targetWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                        className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                </Form.Item>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Link className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profiles List */}
                {config.navigateTo === 'navigate_to_app' && (
                    <div className="flex-1 space-y-2 p-2 border bg-white rounded-md">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Select{' '}
                            {mapTargetScreenKey(config.targetScreen) === 'UserProfile'
                                ? 'User Detail'
                                : mapTargetScreenKey(config.targetScreen) === 'PlaceProfile'
                                    ? 'Business Profile'
                                    : 'Profile Detail'}
                        </h3>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder={`Search ${mapTargetScreenKey(
                                    config.targetScreen,
                                )}...`}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-4 pr-10 py-1 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <Form.Item name="select_profile">
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {filteredProfiles.length > 0 ? (
                                    filteredProfiles.map((profile, index) => (
                                        <div
                                            key={`${profile._id}-${index}`}
                                            onClick={() => handleSelectProfile(profile._id)}
                                            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${config.selectedProfile === profile._id
                                                ? 'bg-blue-100 border-blue-500 border-2'
                                                : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                                }`}
                                        >
                                            {profile.image ? (
                                                <img
                                                    src={profile.image}
                                                    alt={profile.name_en}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-500">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-medium">
                                                    {profile.username ||
                                                        profile?.provinceEn ||
                                                        profile?.nameEn ||
                                                        ''}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {profile.nickname ||
                                                        profile?.provinceKh ||
                                                        profile?.nameKh ||
                                                        ''}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No results found.
                                    </p>
                                )}
                            </div>
                        </Form.Item>
                    </div>
                )}
            </div>
        </Form>
    )
}

const CustomAction = ({
    access_token,
    bannerType,
    setCurrentConfig,
    form,
    setConfig,
    config,
}) => {
    return (
        <div className="items-center justify-center">
            <ActionButtonConfiguration
                config={config}
                setConfig={setConfig}
                setCurrentConfig={setCurrentConfig}
                form={form}
                bannerType={bannerType}
                access_token={access_token}
            />
        </div>
    )
}

export default CustomAction
