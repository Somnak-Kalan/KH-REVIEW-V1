
import React, { useContext, useEffect, useState } from 'react'
import { Tabs, Button, } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { AuthContext } from '../../../../../../contexts/AuthContext'
import PlaceInformation from './PlaceInformation'
import PlaceAddress from './PlaceAddress'
import EditPlaceInfo from './GroupUpdate/editPlaceInfo/ModalEditInfor'
import EditPlaceAddress from './GroupUpdate/editAddress/AddressModal'

export default function PlaceTabs(props) {
  const { businessProperty, getBusinessProperty } = props

  const [activeKey, setActiveKey] = useState('1')
  const [openEditInfo, setOpenEditInfo] = useState(false)
  const [openEditAddress, setOpenEditAddress] = useState(false)

  const { user, access_token } = useContext(AuthContext)
  const [username, setUsername] = useState()


  useEffect(() => {
    setUsername(user?.username)
  }, [user])

  /* --------------------------------------------------------
  ---------------------------------------------------------*/
  const items = [
    {
      key: '1',
      label: 'Place Information',
      children: <PlaceInformation information={businessProperty} />,
    },
    {
      key: '2',
      label: 'Place Address',
      children: <PlaceAddress addressInfo={businessProperty} />,
    },
  ]

  const extra = (
    <Button
      style={{ background: '#ECB603', color: 'white' }}
      icon={<EditOutlined />}
      className='place-tabs-edit'
      onClick={
        activeKey === '1'
          ? () => setOpenEditInfo(true)
          : () => setOpenEditAddress(true)
      }
    >
      Edit
    </Button>
  )

  return (
    <div className='place-tabs-wrapper'>
      {/* Edit modals */}
      {openEditInfo === true && (
        <EditPlaceInfo
          open={openEditInfo}
          setOpen={setOpenEditInfo}
          propData={businessProperty}
          access_token={access_token}
          username={username}
          getBusinessProperty={getBusinessProperty}
        />)
      }
      {
        openEditAddress === true && (
          <EditPlaceAddress
            open={openEditAddress}
            setOpen={setOpenEditAddress}
            propData={businessProperty}
            access_token={access_token}
            username={username}
            getBusinessProperty={getBusinessProperty}
          />
        )
      }


      {/* Tabs */}
      <Tabs
        items={items}
        activeKey={activeKey}
        onChange={setActiveKey}
        className='place-tabs'
        animated={false}
        tabBarExtraContent={extra}
      />
    </div>
  )
}
