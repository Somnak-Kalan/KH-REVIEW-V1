// import React, { useState } from 'react'
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

//   reader.onload = () => {
//     callback(reader.result)
//   }
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

// const AddCategory = (props) => {
//   const { open, setOpen, access_token } = props

//   const createCategory = useCategoryStore((s) => s.createCategory)

//   const [form] = Form.useForm()

//   const [loading, setLoading] = useState(false)

//   const [imageUrl, setImageUrl] = useState(null)
//   const [imageUrl3D, setImageUrl3D] = useState(null)

//   const [iconLoading, setIconLoading] = useState(false)
//   const [icon3DLoading, setIcon3DLoading] = useState(false)

//   // Watch Is Web-view
//   const isWebView = Form.useWatch('isWebView', form)

//   // =========================
//   // RESET FORM
//   // =========================
//   const resetForm = () => {
//     form.resetFields()

//     setImageUrl(null)
//     setImageUrl3D(null)

//     setIconLoading(false)
//     setIcon3DLoading(false)
//   }

//   // =========================
//   // CLOSE MODAL
//   // =========================
//   const handleCancel = () => {
//     setOpen(false)
//     resetForm()
//   }

//   // =========================
//   // 2D ICON CHANGE
//   // =========================
//   const handleIconChange = (info) => {
//     const fileList = info.fileList.slice(-1)

//     const file = fileList?.[0]?.originFileObj || null

//     form.setFieldValue('icon2d', fileList)

//     if (!file) {
//       setImageUrl(null)
//       return
//     }

//     setIconLoading(true)

//     getBase64(file, (url) => {
//       setImageUrl(url)
//       setIconLoading(false)
//     })
//   }

//   // =========================
//   // 3D ICON CHANGE
//   // =========================
//   const handleIcon3DChange = (info) => {
//     const fileList = info.fileList.slice(-1)

//     const file = fileList?.[0]?.originFileObj || null

//     form.setFieldValue('icon3d', fileList)

//     if (!file) {
//       setImageUrl3D(null)
//       return
//     }

//     setIcon3DLoading(true)

//     getBase64(file, (url) => {
//       setImageUrl3D(url)
//       setIcon3DLoading(false)
//     })
//   }

//   // =========================
//   // WEB VIEW CHANGE
//   // =========================
//   const handleWebViewChange = (e) => {
//     const checked = e.target.checked

//     if (!checked) {
//       form.setFieldValue('webViewLink', '')

//       form.setFields([
//         {
//           name: 'webViewLink',
//           errors: [],
//         },
//       ])
//     }
//   }

//   // =========================
//   // SUBMIT
//   // =========================
//   const onFinish = async () => {
//     setLoading(true)

//     try {
//       const values = await form.validateFields()

//       const formData = new FormData()

//       formData.append('nameEn', values.nameEn?.trim() || '')

//       formData.append('nameKh', values.nameKh?.trim() || '')

//       formData.append('description', values.description?.trim() || '')

//       // Send boolean as string in FormData
//       formData.append('isWebView', values.isWebView ? 'true' : 'false')

//       formData.append(
//         'webViewLink',
//         values.isWebView ? values.webViewLink?.trim() || '' : ''
//       )

//       const iconFile = getUploadFile(values.icon2d)

//       const icon3DFile = getUploadFile(values.icon3d)

//       if (iconFile) {
//         formData.append('icon2d', iconFile)
//       }

//       if (icon3DFile) {
//         formData.append('icon3d', icon3DFile)
//       }

//       console.log('===== ADD CATEGORY =====')

//       for (const [key, value] of formData.entries()) {
//         console.log(key, value)
//       }

//       const res = await createCategory({
//         access_token,
//         doc: formData,
//       })

//       if (res) {
//         setOpen(false)

//         resetForm()

//         Swal.fire({
//           icon: 'success',
//           title: 'Upload Successful!',
//           text: 'The information has been added successfully.',
//           showConfirmButton: false,
//           timer: 1500,
//         })
//       }
//     } catch (error) {
//       console.log('Add category error:', error)

//       // Don't show API error popup
//       // when it is only AntD validation
//       if (error?.errorFields) {
//         return
//       }

//       Swal.fire({
//         icon: 'error',
//         title: 'Upload Failed!',
//         text:
//           error?.response?.data?.message ||
//           error?.response?.data?.msg ||
//           error?.message ||
//           'Something went wrong while adding.',
//         timer: 1500,
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Modal
//       title='Add Category'
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
//             Save
//           </Button>
//         </div>
//       }
//     >
//       <Card>
//         <Form
//           form={form}
//           layout='vertical'
//           name='add_category_form'
//           initialValues={{
//             isWebView: false,
//           }}
//         >
//           <Row gutter={[16, 8]}>
//             {/* =====================
//                 2D ICON
//             ====================== */}
//             <Col xs={24} sm={5} className='flex justify-center my-5'>
//               <Form.Item
//                 name='icon2d'
//                 valuePropName='fileList'
//                 getValueFromEvent={normFile}
//                 rules={[
//                   {
//                     required: true,
//                     message: '2D icon is required!',
//                   },
//                 ]}
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

//             {/* =====================
//                 3D ICON
//             ====================== */}
//             <Col xs={24} sm={5} className='flex justify-center my-5'>
//               <Form.Item
//                 name='icon3d'
//                 valuePropName='fileList'
//                 getValueFromEvent={normFile}
//                 rules={[
//                   {
//                     required: true,
//                     message: '3D icon is required!',
//                   },
//                 ]}
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

//             {/* =====================
//                 CATEGORY NAMES
//             ====================== */}
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

//             {/* =====================
//                 WEB VIEW
//             ====================== */}
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

//             {/* =====================
//                 WEB VIEW LINK
//             ====================== */}
//             {isWebView && (
//               <Col xs={24}>
//                 <Form.Item
//                   label={
//                     <span>
//                       Web View Link
//                       <span style={{ color: '#ff4d4f', marginRight: 4 }}>
//                         *
//                       </span>
//                     </span>
//                   }
//                   name='webViewLink'
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

//             {/* =====================
//                 DESCRIPTION
//             ====================== */}
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

// export default AddCategory
import React, { useState } from 'react'
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

const AddCategory = (props) => {
  const { open, setOpen, access_token } = props

  const createCategory = useCategoryStore((s) => s.createCategory)

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const [imageUrl, setImageUrl] = useState(null)
  const [imageUrl3D, setImageUrl3D] = useState(null)

  const [iconLoading, setIconLoading] = useState(false)
  const [icon3DLoading, setIcon3DLoading] = useState(false)

  // Frontend-only field.
  // API does not receive isWebView.
  const isWebView = Form.useWatch('isWebView', form)

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    form.resetFields()

    setImageUrl(null)
    setImageUrl3D(null)

    setIconLoading(false)
    setIcon3DLoading(false)
  }

  // ============================================
  // CLOSE MODAL
  // ============================================
  const handleCancel = () => {
    setOpen(false)
    resetForm()
  }

  // ============================================
  // 2D ICON
  // ============================================
  const handleIconChange = (info) => {
    const fileList = info.fileList.slice(-1)

    const file = fileList?.[0]?.originFileObj || null

    form.setFieldValue('icon2d', fileList)

    if (!file) {
      setImageUrl(null)
      return
    }

    setIconLoading(true)

    getBase64(file, (url) => {
      setImageUrl(url)
      setIconLoading(false)
    })
  }

  // ============================================
  // 3D ICON
  // ============================================
  const handleIcon3DChange = (info) => {
    const fileList = info.fileList.slice(-1)

    const file = fileList?.[0]?.originFileObj || null

    form.setFieldValue('icon3d', fileList)

    if (!file) {
      setImageUrl3D(null)
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
  // CREATE CATEGORY
  // ============================================
  const onFinish = async () => {
    setLoading(true)

    try {
      const values = await form.validateFields()

      const formData = new FormData()

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
      // ICON FILES
      // ==========================================
      const iconFile = getUploadFile(values.icon2d)

      const icon3DFile = getUploadFile(values.icon3d)

      if (iconFile) {
        formData.append('icon2d', iconFile)
      }

      if (icon3DFile) {
        formData.append('icon3d', icon3DFile)
      }

      // Debug payload
      console.log('===== ADD CATEGORY =====')

      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const res = await createCategory({
        access_token,
        doc: formData,
      })

      if (res) {
        setOpen(false)

        resetForm()

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been added successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.log('Add category error:', error)

      // Ant Design validation error
      if (error?.errorFields) {
        return
      }

      Swal.fire({
        icon: 'error',
        title: 'Upload Failed!',
        text:
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          'Something went wrong while adding.',
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Add Category'
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
            Save
          </Button>
        </div>
      }
    >
      <Card>
        <Form
          form={form}
          layout='vertical'
          name='add_category_form'
          initialValues={{
            isWebView: false,
            webviewUrl: '',
          }}
        >
          <Row gutter={[16, 8]}>
            {/* ================================
                2D ICON
            ================================= */}
            <Col xs={24} sm={5} className='flex justify-center my-5'>
              <Form.Item
                name='icon2d'
                valuePropName='fileList'
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: '2D icon is required!',
                  },
                ]}
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
            <Col xs={24} sm={5} className='flex justify-center my-5'>
              <Form.Item
                name='icon3d'
                valuePropName='fileList'
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: '3D icon is required!',
                  },
                ]}
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

export default AddCategory
