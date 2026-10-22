import React, { useEffect, useState } from 'react'
import { Cascader, Form, Input, Card } from 'antd'
import GoogleMap from '../../../other/Map'
import SettingOtherAddressOptServices from '../../../../../../services/options/settings/other/address/Address'

const provinceAbbreviations = {
  'Phnom Penh': 'PP',
  Kandal: 'KD',
  // add more as needed
}

export default function PlaceAddress(props) {
  const { form, access_token, googleMap } = props

  /* ───────────── local state ───────────── */
  const [placeIdCount, setPlaceIdCount] = useState({})
  const [locationOptions, setLocationOptions] = useState([])

  /* ───────────── helpers ───────────── */
  const handleLocationChange = (value, selectedOptions) => {

    if (!value || value.length !== 3) {
      return
    }

    const provinceLabel = selectedOptions[0]?.label

    if (!provinceLabel) return

    const prefix =
      provinceAbbreviations[provinceLabel] ||
      provinceLabel.slice(0, 2).toUpperCase()

    const next = (placeIdCount[prefix] || 0) + 1

    setPlaceIdCount(prev => ({
      ...prev,
      [prefix]: next
    }))

    form.setFieldsValue({
      placeId: `${prefix}${String(next).padStart(3, '0')}`,
    })
  }

  /* ───────────── fetch provinces ───────────── */
  const getProvinceOptions = async () => {
    try {
      const provinces = await SettingOtherAddressOptServices.getProvinceOpt({
        access_token,
      })
      setLocationOptions(
        (provinces || []).map((p) => ({
          value: p.provinceId,
          label: p.provinceEn || p.provinceId,
          id: p.provinceId,
          isLeaf: false,
        }))
      )
    } catch {
      /* ignore */
    }
  }

  /* ───────────── lazy loader ───────────── */
  const loadData = async (selected) => {


    const target =
      selected[selected.length - 1]



    if (target.isLeaf) {

      return

    }



    target.loading = true



    try {


      if (selected.length === 1) {


        const districts =
          await SettingOtherAddressOptServices.getDistrictOpt({

            doc: {
              id: target.id
            },

            access_token,

          })



        target.children =
          (districts || []).map((d) => ({

            value: d.districtId,

            label: d.districtEn || d.districtId,

            id: d.districtId,

            isLeaf: false,

          }))



      }



      else if (selected.length === 2) {



        const communes =
          await SettingOtherAddressOptServices.getCommuneOpt({

            doc: {
              id: target.id
            },

            access_token,

          })



        target.children =
          (communes || []).map((c) => ({

            value: c.communeId,

            label: c.communeEn || c.communeId,

            id: c.communeId,

            isLeaf: true,

          }))



      }



    } catch (error) {


      console.log(error)


    }



    target.loading = false



    setLocationOptions(prev => [
      ...prev
    ])

  }
  /* ───────────── preload selected path ───────────── */
  const ensurePathLoaded = async (provinceId, districtId, communeId) => {
    // if (!provinceId || !districtId || !communeId) return
    let provinceNode = locationOptions.find((p) => p.id === provinceId)
    if (!provinceNode) return
    if (!provinceNode.children) {
      const districts = await SettingOtherAddressOptServices.getDistrictOpt({
        doc: { id: provinceId },
        access_token,
      })
      provinceNode.children = (districts || []).map((d) => ({
        value: d.districtId,
        label: d.districtEn || d.districtId,
        id: d.districtId,
        isLeaf: false,
      }))
    }

    let districtNode = provinceNode.children.find((d) => d.id === districtId)
    if (districtNode && !districtNode.children) {
      const communes = await SettingOtherAddressOptServices.getCommuneOpt({
        doc: { id: districtId },
        access_token,
      })
      districtNode.children = (communes || []).map((c) => ({
        value: c.communeId,
        label: c.communeEn || c.communeId,
        id: c.communeId,
        isLeaf: false,
      }))
    }

    setLocationOptions([...locationOptions])
    form.setFieldsValue({ location: [provinceId, districtId, communeId] })
  }

  /* ───────────── bootstrap ───────────── */
  useEffect(() => {
    getProvinceOptions()
  }, [])
  const [preloaded, setPreloaded] = useState(false) // NEW

  /* ───────────── preload when ready ───────────── */
  useEffect(() => {
    if (preloaded || !locationOptions.length) return // still nothing to work with

    const path =
      Array.isArray(googleMap) && googleMap.length
        ? googleMap
        : form.getFieldValue('location')

    if (path) {
      const [prov, dist, com] = path
      ensurePathLoaded(prov, dist, com).then(() => setPreloaded(true))

    }
  }, [googleMap, preloaded, locationOptions])

  /* ───────────── render ───────────── */
  return (
    <Card className='mt-2'>
      <Form form={form} layout='vertical'>
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
                      'Please select Province, District'
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
            showSearch={{
              filter: (input, path) =>
                path.some((option) =>
                  (option.label || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                ),
              limit: 100,
            }}
            changeOnSelect
            placeholder='Select City/Province - District/Khan - Commune/Sangkat'
            style={{ width: '100%' }}
            onChange={handleLocationChange}
          />
        </Form.Item>

        <Form.Item
          name='addressDetails'
          label='Address Details'
          style={{ marginBottom: 8 }}
        >
          <Input placeholder='Enter Address Details' />
        </Form.Item>
        <GoogleMap formMap={form} googleMap={googleMap} />
      </Form>
    </Card>
  )
}
