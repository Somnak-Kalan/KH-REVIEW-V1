import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'antd'
import Swal from 'sweetalert2'
import PlaceAddress from './PlaceAddress'
import AllPropertyServices from '../../../../../../../../services/ManageProperty/PlaceListing/AllProperty'
import { useAllPropertyStore } from '../../../../../../../../Stores/ManageProperty/AllProperty/AllProperty.store'
export default function CreateNonBusiness(props) {
  const { open, setOpen, propData, access_token, getBusinessProperty } = props
  //
  const [form] = Form.useForm()

  const [nonBusinessData, setNonBusinessData] = useState()
  const [googleMap, setGoogleMap] = useState()
  //media
  const [googlePlaceLink, setGooglePlaceLink] = useState()
  const { fetchNonBusinessPropertyById, updatePropertyAddress } = useAllPropertyStore()
  //
  const [btn_loading, setBtnLoading] = useState(false)
  const getNonBusinessProperty = async (record) => {
    try {
      const data = await fetchNonBusinessPropertyById({
        _id: record?._id,
        access_token,
      })

      const detail =
        data?.data?.locations?.[0] ||
        data?.data?.data?.locations?.[0] ||
        data?.data?.data?.[0] ||
        data?.data?.[0] ||
        data?.data ||
        null

      if (detail) {
        setNonBusinessData(detail)
      }
    } catch (error) {
      console.error('getNonBusinessProperty error:', error)
    }
  }

  useEffect(() => {
    if (!open) return
    if (!propData?._id) return
    if (nonBusinessData?._id === propData._id) return

    getNonBusinessProperty(propData)
  }, [open, propData?._id, nonBusinessData?._id])
  //
  useEffect(() => {
    if (!nonBusinessData) return

    const locPath = [
      nonBusinessData?.address?.location?.provinceId,
      nonBusinessData?.address?.location?.districtId,
      nonBusinessData?.address?.location?.communeId,
    ].filter(Boolean)

    form.setFieldsValue({
      location: locPath, // the 3-level id array
      addressDetails: nonBusinessData?.address?.addressDetails,
      googleMap: nonBusinessData?.address?.googleMap,
      googlePlaceLink: nonBusinessData?.address?.googlePlaceLink,
      coordinates: nonBusinessData?.address?.coordinates,
    })
    setGoogleMap(nonBusinessData?.address?.googleMap?.googleMap)
    setGooglePlaceLink(nonBusinessData?.address?.googlePlaceLink)
  }, [nonBusinessData])

  /* put this inside CreateNonBusiness, above return */
  const resetWizard = () => {
    // clear all Ant-Design forms
    form.resetFields()

    setNonBusinessData(undefined)
    setGoogleMap(undefined)
  }

  const handleSubmit = async () => {
    // setBtnLoading(true)
    try {
      /*  1) Validate all the forms you care about */
      await Promise.all([form.validateFields()])
      const address = form.getFieldsValue(true)

      const doc1 = { _id: propData._id, address }

      try {
        const doc = doc1
        const data = await updatePropertyAddress(access_token, doc)

        if (data) {
          setBtnLoading(false)
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            timer: 1200,
            showConfirmButton: false,
          }).then(() => {
            resetWizard()
            setOpen(false)
            setBtnLoading(false)
          })
        }
      } catch (erro) {
        console.log(erro)
        setBtnLoading(false)
      }
    } catch (err) {
      console.error('Validation failed', err)
      setBtnLoading(false)
    }
  }

  return (
    <>
      <Modal
        open={open}

        title='Edit Place Address'
        onCancel={async () => {
          const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Changes you made may not be saved.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, close it',
            cancelButtonText: 'No, keep editing',
          })

          if (result.isConfirmed) {
            setOpen(false)
            setBtnLoading(false)
            resetWizard() // Optional: clear form data on cancel
          }
        }}
        footer={null}
        width={1000}
      >
        <PlaceAddress
          form={form}
          access_token={access_token}
          googleMap={googleMap}
          googlePlaceLink={googlePlaceLink}
        />
        <div className='flex justify-end mt-5'>
          <Button loading={btn_loading} type='primary' onClick={handleSubmit}>
            Save Change
          </Button>
        </div>
      </Modal>
    </>
  )
}
