import React from 'react'
import { Tabs } from 'antd'
import PlaceSecions from '../form/PlaceSections'
import ProvinceSection from '../form/ProvinceSection'
import ListUser from '../form/ListUser'

const { TabPane } = Tabs

const BannerTabsSection = ({
    form,
    searchTerm,
    setSearchTerm,
    setSelectedChatBusiness,
    selectedChatBusiness,
    // filteredBusinessProperty,
    access_token,
    activeTab,
    setSelectedProvinceIds,
    selectedProvinceIds,
    selectedUsers,
    setSelectedUsers,
}) => {
    const onChange = (key) => {
        console.log(key)
    }

    return (
        <Tabs defaultActiveKey="1" onChange={onChange}>
            <TabPane tab="Business Place Section" key="1">
                <PlaceSecions
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setSelectedChatBusiness={setSelectedChatBusiness}
                    selectedChatBusiness={selectedChatBusiness}
                    form={form}
                    // filteredBusinessProperty={filteredBusinessProperty}
                    access_token={access_token}
                    activeTab={activeTab}
                />
            </TabPane>

            <TabPane tab=" Provinces Sectioin" key="2">
                <ProvinceSection
                    form={form}
                    access_token={access_token}
                    setSelectedProvinceIds={setSelectedProvinceIds}
                    selectedProvinceIds={selectedProvinceIds}
                />
            </TabPane>

            <TabPane tab=" User Sectioin" key="3">
                <ListUser
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    form={form}
                    access_token={access_token}
                />
            </TabPane>
        </Tabs>
    )
}

export default BannerTabsSection
