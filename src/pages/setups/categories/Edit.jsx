// import { useEffect, useState } from 'react'

// import {
//   Button,
//   Card,
//   Checkbox,
//   Col,
//   Form,
//   Input,
//   Modal,
//   Row,
//   Upload,
// } from 'antd'

// import TextArea from 'antd/es/input/TextArea'

// import { PlusOutlined } from '@ant-design/icons'

// import Swal from 'sweetalert2'

// import useCategoryStore from '../../../Stores/setups/category.store'

// import ImageLoading from '../../../components/Loading/ImageLoading'

// const getBase64 = (file, callback) => {
//   const reader = new FileReader()

//   reader.readAsDataURL(file)

//   reader.onload = () => callback(reader.result)
// }

// const getUploadFile = (fileList) => {
//   return fileList?.[0]?.originFileObj || null
// }

// const normFile = (e) => {
//   if (Array.isArray(e)) {
//     return e
//   }

//   return e?.fileList || []
// }

// const getImageByType = (image) => {
//   if (!image) {
//     return null
//   }

//   if (typeof image === 'string') {
//     return image
//   }

//   return image?.original || image?.url || null
// }

// const EditCategory = (props) => {
//   const { open, setOpen, access_token, propData } = props

//   const updateCategory = useCategoryStore((s) => s.updateCategory)

//   const fetchCategoryById = useCategoryStore((s) => s.fetchCategoryById)

//   const [form] = Form.useForm()

//   const [loading, setLoading] = useState(false)

//   const [category, setCategory] = useState(null)

//   const [imageUrl, setImageUrl] = useState(null)

//   const [imageUrl3D, setImageUrl3D] = useState(null)

//   const [iconLoading, setIconLoading] = useState(false)

//   const [icon3DLoading, setIcon3DLoading] = useState(false)

//   const isWebView = Form.useWatch('isWebView', form)

//   // ==========================
//   // GET CATEGORY DETAIL
//   // ==========================
//   const getCategoryById = async (_id) => {
//     if (!_id) return

//     try {
//       const res = await fetchCategoryById({
//         access_token,
//         _id,
//       })

//       if (res) {
//         const detail =
//           res?.data || res?.doc || res?.result || res?.category || res || null

//         setCategory(detail)
//       }
//     } catch (error) {
//       console.log('Get category error:', error)
//     }
//   }

//   // ==========================
//   // FETCH WHEN OPEN
//   // ==========================
//   useEffect(() => {
//     if (open && propData?._id) {
//       getCategoryById(propData._id)
//     }
//   }, [open, propData?._id])

//   // ==========================
//   // SET FORM DATA
//   // ==========================
//   useEffect(() => {
//     if (!category) return

//     const webViewValue =
//       category?.isWebView === true ||
//       category?.isWebView === 'true' ||
//       category?.is_web_view === true ||
//       category?.is_web_view === 'true'

//     form.setFieldsValue({
//       _id: category?._id,

//       nameEn: category?.nameEn || '',

//       nameKh: category?.nameKh || '',

//       description:
//         category?.description && category?.description !== 'undefined'
//           ? category.description
//           : '',

//       isWebView: webViewValue,

//       webViewLink: category?.webViewLink || category?.web_view_link || '',

//       // Keep these empty.
//       // Existing image is shown
//       // using imageUrl state.
//       icon2d: [],
//       icon3d: [],
//     })

//     setImageUrl(getImageByType(category?.icon2d?.original || category?.icon2d))

//     setImageUrl3D(
//       getImageByType(category?.icon3d?.original || category?.icon3d)
//     )
//   }, [category, form])

//   // ==========================
//   // RESET
//   // ==========================
//   const resetForm = () => {
//     form.resetFields()

//     setCategory(null)

//     setImageUrl(null)
//     setImageUrl3D(null)

//     setIconLoading(false)
//     setIcon3DLoading(false)
//   }

//   // ==========================
//   // CLOSE
//   // ==========================
//   const handleCancel = () => {
//     setOpen(false)
//     resetForm()
//   }

//   // ==========================
//   // 2D ICON
//   // ==========================
//   const handleIconChange = (info) => {
//     const fileList = info.fileList.slice(-1)

//     const file = fileList?.[0]?.originFileObj || null

//     form.setFieldValue('icon2d', fileList)

//     if (!file) {
//       return
//     }

//     setIconLoading(true)

//     getBase64(file, (url) => {
//       setImageUrl(url)
//       setIconLoading(false)
//     })
//   }

//   // ==========================
//   // 3D ICON
//   // ==========================
//   const handleIcon3DChange = (info) => {
//     const fileList = info.fileList.slice(-1)

//     const file = fileList?.[0]?.originFileObj || null

//     form.setFieldValue('icon3d', fileList)

//     if (!file) {
//       return
//     }

//     setIcon3DLoading(true)

//     getBase64(file, (url) => {
//       setImageUrl3D(url)

//       setIcon3DLoading(false)
//     })
//   }

//   // ==========================
//   // WEB VIEW
//   // ==========================
//   const handleWebViewChange = (e) => {
//     const checked = e.target.checked

//     if (!checked) {
//       form.setFieldValue('webviewUrl', '')

//       form.setFields([
//         {
//           name: 'webviewUrl',
//           errors: [],
//         },
//       ])
//     }
//   }

//   // ==========================
//   // UPDATE
//   // ==========================
//   const onFinish = async () => {
//     setLoading(true)

//     try {
//       const values = await form.validateFields()

//       const formData = new FormData()

//       formData.append('_id', values._id)

//       formData.append('nameEn', values.nameEn?.trim() || '')

//       formData.append('nameKh', values.nameKh?.trim() || '')

//       formData.append('description', values.description?.trim() || '')

//       formData.append('isWebView', values.isWebView ? 'true' : 'false')

//       formData.append(
//         'webViewLink',
//         values.isWebView ? values.webViewLink?.trim() || '' : ''
//       )

//       const iconFile = getUploadFile(values.icon2d)

//       const icon3DFile = getUploadFile(values.icon3d)

//       // Only send icon when
//       // user selected a new one.
//       if (iconFile) {
//         formData.append('icon2d', iconFile)
//       }

//       if (icon3DFile) {
//         formData.append('icon3d', icon3DFile)
//       }

//       console.log('===== UPDATE CATEGORY =====')

//       for (const [key, value] of formData.entries()) {
//         console.log(key, value)
//       }

//       const res = await updateCategory({
//         access_token,
//         doc: formData,
//       })

//       if (res) {
//         setOpen(false)

//         resetForm()

//         Swal.fire({
//           icon: 'success',

//           title: 'Update Successful!',

//           text: 'The information has been updated successfully.',

//           showConfirmButton: false,

//           timer: 1500,
//         })
//       }
//     } catch (error) {
//       console.log('Update category error:', error)

//       if (error?.errorFields) {
//         return
//       }

//       Swal.fire({
//         icon: 'error',

//         title: 'Update Failed!',

//         text:
//           error?.response?.data?.message ||
//           error?.response?.data?.msg ||
//           error?.message ||
//           'Something went wrong while updating.',

//         timer: 1500,
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Modal
//       title='Edit Category'
//       open={open}
//       width={650}
//       centered
//       closable
//       destroyOnClose
//       onCancel={handleCancel}
//       footer={
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'flex-end',
//             gap: 10,
//           }}
//         >
//           <Button
//             type='primary'
//             onClick={onFinish}
//             loading={loading}
//             style={{
//               minWidth: 120,
//               borderRadius: 8,
//             }}
//           >
//             Update
//           </Button>
//         </div>
//       }
//     >
//       <Card>
//         <Form form={form} layout='vertical' name='edit_category_form'>
//           <Row gutter={[16, 8]}>
//             <Form.Item hidden name='_id'>
//               <Input />
//             </Form.Item>

//             {/* ==================
//                 2D ICON
//             ================== */}
//             <Col xs={24} sm={5} className='flex justify-center my-2'>
//               <Form.Item
//                 name='icon2d'
//                 valuePropName='fileList'
//                 getValueFromEvent={normFile}
//               >
//                 <Upload
//                   name='icon2d'
//                   listType='picture-card'
//                   showUploadList={false}
//                   beforeUpload={() => false}
//                   maxCount={1}
//                   accept='image/*'
//                   onChange={handleIconChange}
//                 >
//                   {iconLoading ? (
//                     <div
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <ImageLoading />
//                     </div>
//                   ) : imageUrl ? (
//                     <img
//                       src={imageUrl}
//                       alt='2D icon'
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain',
//                         borderRadius: 8,
//                       }}
//                     />
//                   ) : (
//                     <div>
//                       <PlusOutlined />

//                       <div
//                         style={{
//                           marginTop: 8,
//                         }}
//                       >
//                         2D ICON
//                       </div>
//                     </div>
//                   )}
//                 </Upload>
//               </Form.Item>
//             </Col>

//             {/* ==================
//                 3D ICON
//             ================== */}
//             <Col xs={24} sm={5} className='flex justify-center my-2'>
//               <Form.Item
//                 name='icon3d'
//                 valuePropName='fileList'
//                 getValueFromEvent={normFile}
//               >
//                 <Upload
//                   name='icon3d'
//                   listType='picture-card'
//                   showUploadList={false}
//                   beforeUpload={() => false}
//                   maxCount={1}
//                   accept='image/*'
//                   onChange={handleIcon3DChange}
//                 >
//                   {icon3DLoading ? (
//                     <div
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <ImageLoading />
//                     </div>
//                   ) : imageUrl3D ? (
//                     <img
//                       src={imageUrl3D}
//                       alt='3D icon'
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain',
//                         borderRadius: 8,
//                       }}
//                     />
//                   ) : (
//                     <div>
//                       <PlusOutlined />

//                       <div
//                         style={{
//                           marginTop: 8,
//                         }}
//                       >
//                         3D ICON
//                       </div>
//                     </div>
//                   )}
//                 </Upload>
//               </Form.Item>
//             </Col>

//             {/* ==================
//                 NAMES
//             ================== */}
//             <Col xs={24} sm={14}>
//               <Form.Item
//                 label='Category Name (En)'
//                 name='nameEn'
//                 style={{
//                   marginBottom: 8,
//                 }}
//                 rules={[
//                   {
//                     required: true,
//                     whitespace: true,
//                     message: 'Category name EN is required!',
//                   },
//                 ]}
//               >
//                 <Input placeholder='Enter category name EN' maxLength={100} />
//               </Form.Item>

//               <Form.Item
//                 label='Category Name (Kh)'
//                 name='nameKh'
//                 style={{
//                   marginBottom: 8,
//                 }}
//                 rules={[
//                   {
//                     required: true,
//                     whitespace: true,
//                     message: 'Category name KH is required!',
//                   },
//                 ]}
//               >
//                 <Input placeholder='Enter category name KH' maxLength={100} />
//               </Form.Item>
//             </Col>

//             {/* ==================
//                 WEB VIEW
//             ================== */}
//             <Col xs={24}>
//               <Form.Item
//                 name='isWebView'
//                 valuePropName='checked'
//                 style={{
//                   marginBottom: isWebView ? 0 : 2,
//                 }}
//               >
//                 <Checkbox onChange={handleWebViewChange}>Is Web-view</Checkbox>
//               </Form.Item>
//             </Col>

//             {/* ==================
//                 WEB VIEW LINK
//             ================== */}
//             {isWebView && (
//               <Col xs={24}>
//                 <Form.Item
//                   label={
//                     <span>
//                       Web View Link
//                       <span
//                         style={{
//                           color: '#ff4d4f',
//                           marginLeft: 4,
//                         }}
//                       >
//                         *
//                       </span>
//                     </span>
//                   }
//                   name='webviewUrl'
//                   required={false}
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Web View Link is required!',
//                     },
//                     {
//                       type: 'url',
//                       message: 'Please enter a valid URL!',
//                     },
//                   ]}
//                 >
//                   <Input placeholder='https://khreview.com/category' />
//                 </Form.Item>
//               </Col>
//             )}

//             {/* ==================
//                 DESCRIPTION
//             ================== */}
//             <Col xs={24}>
//               <Form.Item label='Description' name='description'>
//                 <TextArea
//                   rows={4}
//                   placeholder='Enter description'
//                   maxLength={1000}
//                   showCount
//                 />
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//       </Card>
//     </Modal>
//   )
// }

// export default EditCategory
import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
} from 'antd'

import TextArea from 'antd/es/input/TextArea'

import { PlusOutlined } from '@ant-design/icons'

import Swal from 'sweetalert2'

import useCategoryStore from '../../../Stores/setups/category.store'

import ImageLoading from '../../../components/Loading/ImageLoading'

const getBase64 = (file, callback) => {
  const reader = new FileReader()

  reader.readAsDataURL(file)

  reader.onload = () => {
    callback(reader.result)
  }
}

const getUploadFile = (fileList) => {
  return fileList?.[0]?.originFileObj || null
}

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e
  }

  return e?.fileList || []
}

const getImageByType = (image) => {
  if (!image) {
    return null
  }

  if (typeof image === 'string') {
    return image
  }

  return image?.original || image?.url || null
}

const EditCategory = (props) => {
  const { open, setOpen, access_token, propData } = props

  const updateCategory = useCategoryStore((s) => s.updateCategory)

  const fetchCategoryById = useCategoryStore((s) => s.fetchCategoryById)

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const [category, setCategory] = useState(null)

  const [imageUrl, setImageUrl] = useState(null)

  const [imageUrl3D, setImageUrl3D] = useState(null)

  const [iconLoading, setIconLoading] = useState(false)

  const [icon3DLoading, setIcon3DLoading] = useState(false)

  // Frontend-only checkbox state.
  const isWebView = Form.useWatch('isWebView', form)

  // ============================================
  // GET CATEGORY BY ID
  // ============================================
  const getCategoryById = async (_id) => {
    if (!_id) {
      return
    }

    try {
      const res = await fetchCategoryById({
        access_token,
        _id,
      })

      if (res) {
        const detail =
          res?.data || res?.doc || res?.result || res?.category || res || null

        setCategory(detail)
      }
    } catch (error) {
      console.log('Get category error:', error)
    }
  }

  // ============================================
  // FETCH DETAIL WHEN MODAL OPENS
  // ============================================
  useEffect(() => {
    if (open && propData?._id) {
      getCategoryById(propData._id)
    }
  }, [open, propData?._id])

  // ============================================
  // SET EXISTING CATEGORY DATA
  // ============================================
  useEffect(() => {
    if (!category) {
      return
    }

    // API:
    // type: "webview"
    const webViewValue = category?.type === 'webview'

    form.setFieldsValue({
      _id: category?._id,

      nameEn: category?.nameEn || '',

      nameKh: category?.nameKh || '',

      description:
        category?.description && category?.description !== 'undefined'
          ? category.description
          : '',

      // Frontend checkbox
      isWebView: webViewValue,

      // Actual API URL field
      webviewUrl: category?.webviewUrl || '',

      // Do not put existing URL images
      // inside Upload fileList.
      icon2d: [],
      icon3d: [],
    })

    // Existing 2D icon
    setImageUrl(getImageByType(category?.icon2d?.original || category?.icon2d))

    // Existing 3D icon
    setImageUrl3D(
      getImageByType(category?.icon3d?.original || category?.icon3d)
    )
  }, [category, form])

  // ============================================
  // RESET
  // ============================================
  const resetForm = () => {
    form.resetFields()

    setCategory(null)

    setImageUrl(null)
    setImageUrl3D(null)

    setIconLoading(false)
    setIcon3DLoading(false)
  }

  // ============================================
  // CLOSE
  // ============================================
  const handleCancel = () => {
    setOpen(false)
    resetForm()
  }

  // ============================================
  // CHANGE 2D ICON
  // ============================================
  const handleIconChange = (info) => {
    const fileList = info.fileList.slice(-1)

    const file = fileList?.[0]?.originFileObj || null

    form.setFieldValue('icon2d', fileList)

    if (!file) {
      return
    }

    setIconLoading(true)

    getBase64(file, (url) => {
      setImageUrl(url)

      setIconLoading(false)
    })
  }

  // ============================================
  // CHANGE 3D ICON
  // ============================================
  const handleIcon3DChange = (info) => {
    const fileList = info.fileList.slice(-1)

    const file = fileList?.[0]?.originFileObj || null

    form.setFieldValue('icon3d', fileList)

    if (!file) {
      return
    }

    setIcon3DLoading(true)

    getBase64(file, (url) => {
      setImageUrl3D(url)

      setIcon3DLoading(false)
    })
  }

  // ============================================
  // WEB VIEW CHECKBOX
  // ============================================
  const handleWebViewChange = (e) => {
    const checked = e.target.checked

    if (!checked) {
      form.setFieldValue('webviewUrl', '')

      form.setFields([
        {
          name: 'webviewUrl',
          errors: [],
        },
      ])
    }
  }

  // ============================================
  // UPDATE CATEGORY
  // ============================================
  const onFinish = async () => {
    setLoading(true)

    try {
      const values = await form.validateFields()

      const formData = new FormData()

      formData.append('_id', values._id)

      formData.append('nameEn', values.nameEn?.trim() || '')

      formData.append('nameKh', values.nameKh?.trim() || '')

      formData.append('description', values.description?.trim() || '')

      // ==========================================
      // API WEBVIEW FIELDS
      // ==========================================
      formData.append('type', values.isWebView ? 'webview' : '')

      formData.append(
        'webviewUrl',
        values.isWebView ? values.webviewUrl?.trim() || '' : ''
      )

      // ==========================================
      // NEW ICON FILES
      // ==========================================
      const iconFile = getUploadFile(values.icon2d)

      const icon3DFile = getUploadFile(values.icon3d)

      // Only send icon if user
      // selected a replacement.
      if (iconFile) {
        formData.append('icon2d', iconFile)
      }

      if (icon3DFile) {
        formData.append('icon3d', icon3DFile)
      }

      // Debug payload
      console.log('===== UPDATE CATEGORY =====')

      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const res = await updateCategory({
        access_token,
        doc: formData,
      })

      if (res) {
        setOpen(false)

        resetForm()

        Swal.fire({
          icon: 'success',
          title: 'Update Successful!',
          text: 'The information has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.log('Update category error:', error)

      if (error?.errorFields) {
        return
      }

      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text:
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          'Something went wrong while updating.',
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Edit Category'
      open={open}
      width={650}
      centered
      closable
      destroyOnClose
      onCancel={handleCancel}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <Button
            type='primary'
            onClick={onFinish}
            loading={loading}
            style={{
              minWidth: 120,
              borderRadius: 8,
            }}
          >
            Update
          </Button>
        </div>
      }
    >
      <Card>
        <Form form={form} layout='vertical' name='edit_category_form'>
          <Row gutter={[16, 8]}>
            {/* ID */}
            <Form.Item hidden name='_id'>
              <Input />
            </Form.Item>

            {/* ================================
                2D ICON
            ================================= */}
            <Col xs={24} sm={5} className='flex justify-center my-2'>
              <Form.Item
                name='icon2d'
                valuePropName='fileList'
                getValueFromEvent={normFile}
              >
                <Upload
                  name='icon2d'
                  listType='picture-card'
                  showUploadList={false}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept='image/*'
                  onChange={handleIconChange}
                >
                  {iconLoading ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ImageLoading />
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt='2D icon'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        2D ICON
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            {/* ================================
                3D ICON
            ================================= */}
            <Col xs={24} sm={5} className='flex justify-center my-2'>
              <Form.Item
                name='icon3d'
                valuePropName='fileList'
                getValueFromEvent={normFile}
              >
                <Upload
                  name='icon3d'
                  listType='picture-card'
                  showUploadList={false}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept='image/*'
                  onChange={handleIcon3DChange}
                >
                  {icon3DLoading ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ImageLoading />
                    </div>
                  ) : imageUrl3D ? (
                    <img
                      src={imageUrl3D}
                      alt='3D icon'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        3D ICON
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            {/* ================================
                CATEGORY NAMES
            ================================= */}
            <Col xs={24} sm={14}>
              <Form.Item
                label='Category Name (En)'
                name='nameEn'
                style={{
                  marginBottom: 8,
                }}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: 'Category name EN is required!',
                  },
                ]}
              >
                <Input placeholder='Enter category name EN' maxLength={100} />
              </Form.Item>

              <Form.Item
                label='Category Name (Kh)'
                name='nameKh'
                style={{
                  marginBottom: 8,
                }}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: 'Category name KH is required!',
                  },
                ]}
              >
                <Input placeholder='Enter category name KH' maxLength={100} />
              </Form.Item>
            </Col>

            {/* ================================
                IS WEB VIEW
            ================================= */}
            <Col xs={24}>
              <Form.Item
                name='isWebView'
                valuePropName='checked'
                style={{
                  marginBottom: isWebView ? 0 : 2,
                }}
              >
                <Checkbox onChange={handleWebViewChange}>Is Web-view</Checkbox>
              </Form.Item>
            </Col>

            {/* ================================
                WEB VIEW URL
            ================================= */}
            {isWebView && (
              <Col xs={24}>
                <Form.Item
                  label={
                    <span>
                      Web View Link
                      <span
                        style={{
                          color: '#ff4d4f',
                          marginLeft: 4,
                        }}
                      >
                        *
                      </span>
                    </span>
                  }
                  name='webviewUrl'
                  required={false}
                  rules={[
                    {
                      required: true,
                      message: 'Web View Link is required!',
                    },
                    {
                      type: 'url',
                      message: 'Please enter a valid URL!',
                    },
                  ]}
                >
                  <Input placeholder='https://khreview.com/category' />
                </Form.Item>
              </Col>
            )}

            {/* ================================
                DESCRIPTION
            ================================= */}
            <Col xs={24}>
              <Form.Item label='Description' name='description'>
                <TextArea
                  rows={4}
                  placeholder='Enter description'
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default EditCategory
