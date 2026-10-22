import React, {
  useEffect,
  useState,
} from 'react'

import {
  Cascader,
  Form,
  Input,
  Card,
} from 'antd'
import SettingOtherAddressOptServices
  from '../../../../../../../../services/options/settings/other/address/Address'
import GoogleMap from '../../../../other/Map'
export default function PlaceAddress(props) {
  const {
    form,
    access_token,
    googleMap,
    googlePlaceLink
  } = props
  const [
    locationOptions,
    setLocationOptions
  ] = useState([])
  const [
    preloadDone,
    setPreloadDone
  ] = useState(false)
  /*
  ===============================
  Province
  ===============================
  */
  const getProvinceOptions = async () => {
    try {

      const provinces =
        await SettingOtherAddressOptServices
          .getProvinceOpt({

            access_token

          })
      setLocationOptions(

        (provinces || []).map(p => ({
          value: String(p.provinceId),

          label:
            p.provinceEn ||
            String(p.provinceId),
          id: String(p.provinceId),
          isLeaf: false
        }))
      )
    }
    catch (error) {
      console.log(error)
    }
  }
  /*
  ===============================
  Load children

  Province
       |
       District
       |
       Commune

  ===============================
  */

  const loadData = async (selected) => {
    const target =
      selected[selected.length - 1]
    target.loading = true
    try {
      // Province -> District
      if (selected.length === 1) {
        const districts =
          await SettingOtherAddressOptServices
            .getDistrictOpt({
              doc: {
                id: target.id
              },
              access_token
            })
        target.children =
          (districts || []).map(d => ({
            value: String(d.districtId),
            label:
              d.districtEn ||
              String(d.districtId),
            id: String(d.districtId),
            // IMPORTANT
            // allow commune
            isLeaf: false
          }))
      }
      // District -> Commune
      if (selected.length === 2) {
        const communes =
          await SettingOtherAddressOptServices
            .getCommuneOpt({
              doc: {
                id: target.id
              },
              access_token
            })
        target.children =

          (communes || []).map(c => ({
            value: String(c.communeId),
            label:
              c.communeEn ||
              String(c.communeId),
            id: String(c.communeId),
            isLeaf: true
          }))
      }
    }
    catch (error) {
      console.log(error)
    }
    target.loading = false


    setLocationOptions(prev => [
      ...prev
    ])
  }
  /*
  ===============================
  Preload edit
  ===============================
  */
  const preloadLocation = async () => {
    const location =
      form.getFieldValue('location')
    if (
      !location ||
      location.length < 2
    ) {
      return
    }
    const [
      provinceId,
      districtId,
      communeId

    ] = location
    const provinceNode =
      locationOptions.find(
        item =>
          String(item.id) === String(provinceId)
      )
    if (!provinceNode)
      return
    // Load district
    if (!provinceNode.children) {
      const districts =
        await SettingOtherAddressOptServices
          .getDistrictOpt({
            doc: {
              id: provinceId
            },
            access_token
          })
      provinceNode.children =
        (districts || []).map(d => ({
          value: String(d.districtId),
          label:
            d.districtEn ||
            String(d.districtId),
          id: String(d.districtId),
          // allow commune
          isLeaf: false
        }))
    }
    const districtNode =
      provinceNode.children.find(
        d =>
          String(d.id) === String(districtId)
      )
    // Load commune if exists
    if (

      districtNode &&
      communeId &&
      !districtNode.children

    ) {
      const communes =
        await SettingOtherAddressOptServices
          .getCommuneOpt({
            doc: {
              id: districtId
            },
            access_token

          })
      districtNode.children =
        (communes || []).map(c => ({
          value: String(c.communeId),
          label:
            c.communeEn ||
            String(c.communeId),
          id: String(c.communeId),
          isLeaf: true
        }))
    }
    setLocationOptions(prev => [
      ...prev
    ])
    form.setFieldsValue({
      location: [
        String(provinceId),
        String(districtId),
        communeId
          ?
          String(communeId)
          :
          undefined
      ]
    })
  }
  useEffect(() => {
    getProvinceOptions()
  }, [])
  useEffect(() => {
    if (
      locationOptions.length &&
      !preloadDone
    ) {
      preloadLocation()
      setPreloadDone(true)
    }
  }, [
    locationOptions,
    preloadDone
  ])
  return (
    <Card className="mt-2">
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="location"
          label="Select Location"
          rules={[
            {
              required: true,
              validator: (_, value) => {
                if (
                  !value ||
                  value.length < 2
                ) {
                  return Promise.reject(
                    new Error(
                      'Please select Province and District'
                    )
                  )
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Cascader
            options={locationOptions}
            loadData={loadData}
            changeOnSelect
            placeholder="Select Province / District / Commune"
            style={{
              width: '100%'
            }}
          />
        </Form.Item>
        <Form.Item
          name="addressDetails"
          label="Address Details"
        >
          <Input
            placeholder="Enter Address Details"
          />
        </Form.Item>
        <GoogleMap
          formMap={form}
          googleMap={googleMap}
          displayGoogleMap={googlePlaceLink}
        />
      </Form>
    </Card>

  )

}