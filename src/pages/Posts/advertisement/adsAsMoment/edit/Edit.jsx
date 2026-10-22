import React, { useEffect, useContext, useRef, useState } from 'react';
import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Button,
  Select,
  Spin,
  Steps,
  Tabs
} from 'antd';
import { AuthContext } from '../../../../../contexts/AuthContext';
import BannerTypeSelection from './BannerTypeSelection';
import CustomAction from './CustomAction';
import Schedule from './Schedule';
import ReactQuill from './ReactQuill';
import ListUser from './ListUser';
import ImageUpload from './ImageUpload';

const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps
const AddBanner = ({ open, setOpen, getBannerList, activeTab }) => {
  const [form] = Form.useForm();
  const [enImageLarge, setEnImageLarge] = useState(null);
  const [enImageSmall, setEnImageSmall] = useState(null);
  const [khImageLarge, setKhImageLarge] = useState(null);
  const [khImageSmall, setKhImageSmall] = useState(null);

  const { access_token } = useContext(AuthContext);

  const [provinces, setProvinces] = useState([]);
  const [businessProperty, setBusinessProperty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinceSelectionType, setProvinceSelectionType] = useState('all');
  const [previewData, setPreviewData] = useState({});

  const [fileENLarge, setFileENLarge] = useState();
  const [fileENSmall, setFileENSmall] = useState();
  const [fileKHLarge, setFileKHLarge] = useState();
  const [fileKHSmall, setFileKHSmall] = useState();
  //

  //
  const [khChildImage, setKhChildImage] = useState(null);
  const [enChildImage, setEnChildImage] = useState(null);
  const khChildFileInputRef = useRef(null);
  const enChildFileInputRef = useRef(null);
  const [khChildLink, setKhChildLink] = useState('');
  const [enChildLink, setEnChildLink] = useState('');
  const [linkSelectionType, setLinkSelectionType] = useState('none');

  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false);
  const [customLinkName, setCustomLinkName] = useState('');
  const [appLinkName, setAppLinkName] = useState('View on App');
  const [websiteLinkName, setWebsiteLinkName] = useState('Visit Website');
  const [currentLinkType, setCurrentLinkType] = useState('');

  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionKh, setDescriptionKh] = useState('');

  const [bannerType, setBannerType] = useState('information_only');
  const [language, setLanguage] = useState('en');
  // Changed state to store a single selected business place ID
  const [selectedChatBusiness, setSelectedChatBusiness] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // New state variables for Custom Action button c9-8-2025-Momentonfiguration
  const [buttonTitle, setButtonTitle] = useState('');
  const [actionType, setActionType] = useState('Navigate to App Screen');
  const [targetAppScreen, setTargetAppScreen] = useState('Explore');
  const [targetWebsite, setTargetWebsite] = useState('');
  const handleCustomizeOk = () => {
    if (currentLinkType === 'app') setAppLinkName(customLinkName)
    else setWebsiteLinkName(customLinkName)
    setIsCustomizeModalVisible(false)
  };
  const [spinning, setSpinning] = useState(false)
  const handleCancel = () => {
    setOpen(false);
    setStep(0)
    form.resetFields();
    setKhImageLarge(null);
    setKhImageSmall(null);
    setEnImageLarge(null);
    setEnImageSmall(null);
    setEnChildImage(null);
    setKhChildImage(null);
    setDescriptionEn('');
    setDescriptionKh('');
    setProvinceSelectionType('all');
    setSelectedChatBusiness(null);
    setButtonTitle('');
    setActionType('Navigate to App Screen');
    setTargetAppScreen('Explore');
    setTargetWebsite('');
  };
  const handleImageChange = (e, setImageState, fileInputRef, langLabel, size) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageState(reader.result);
        if (size === 'Large' && langLabel.includes('en')) setFileENLarge({ file: reader.result })
        if (size === 'Large' && langLabel.includes('kh')) setFileKHLarge({ file: reader.result })
        if (size === 'Small' && langLabel.includes('en')) setFileENSmall({ file: reader.result })
        if (size === 'Small' && langLabel.includes('kh')) setFileKHSmall({ file: reader.result })
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  };

  const handleRemoveImage = (setImageState, fileInputRef) => {
    setImageState(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  };

  const getProvinceOptions = async () => {
    // fetch provinces
  };

  const getBusinessPropertyOptions = async () => {
    // fetch business properties
  };

  useEffect(() => {
    getProvinceOptions()
    getBusinessPropertyOptions()
  }, []);

  const renderContentImage = () => (
    <>
      <Row gutter={[8, 2]} justify={'center'}>
        <Col xs={24} md={11}>
          <Form.Item label='English Posters(Large)' labelCol={{ span: 24 }}>
            <ImageUpload
              label="English Small"
              image={enImageSmall}
              setImage={setEnImageSmall}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
              langLabel="en"
              size="Small"
            />
            <ImageUpload
              label="English Large"
              image={enImageLarge}
              setImage={setEnImageLarge}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
              langLabel="en"
              size="Large"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={11}>
          <Form.Item label='Khmer Posters(Small)' labelCol={{ span: 24 }}>
            <ImageUpload
              label="Khmer Small"
              image={khImageSmall}
              setImage={setKhImageSmall}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
              langLabel="kh"
              size="Small"
            />
            <ImageUpload
              label="Khmer Large"
              image={khImageLarge}
              setImage={setKhImageLarge}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
              langLabel="kh"
              size="Large"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
  const renderContent = () => (
    <>
      <Schedule />
      <Row gutter={16} className=''>
        <Col span={24}>
          <div className='flex justify-center  rounded-md bg-gray-100' style={{ border: '1px solid #E2EFFF' }}>
            <Button
              type={language === 'en' ? 'default' : 'white'}
              style={language === 'en' ? { border: '1px solid #E2EFFF' } : {}}
              // size="small"/
              onClick={() => setLanguage('en')}
              className=' w-full my-1 mx-1 rounded-lg flex items-center justify-center gap-2'
            >

              🇺🇸  English
            </Button>
            <Button
              type={language === 'kh' ? 'default' : 'white'}
              // size="small"
              style={language === 'kh' ? { border: '1px solid #E2EFFF' } : {}}

              onClick={() => setLanguage('kh')}
              className='w-full my-1 mx-1 rounded-lg flex items-center justify-center gap-2'
            >
              🇰🇭
              ខ្មែរ (Khmer)
            </Button>
          </div>
        </Col>
      </Row>
      <div className='my-4'>
        {language === 'en' ? (
          <>
            <Form.Item
              label='Title (English)'
              style={{ marginBottom: "0px" }}
              name='titleEn'
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: 'Please enter the English title!' }]}
            >
              <Input placeholder='Enter banner title in English' />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              label='Description (English)'
              style={{ marginBottom: "0px" }}
              name='descriptionEn'
              rules={[{ required: true, message: 'Please enter the English description!' }]}
              valuePropName="value"
              getValueFromEvent={(content) => content}
            >
              <ReactQuill language={language} setDescriptionEn={setDescriptionEn} descriptionEn={descriptionEn} placeholder='Enter banner description...' />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label='Title (Khmer)'
              name='titleKh'
              labelCol={{ span: 24 }}
              style={{ marginBottom: "0px" }}
              rules={[{ required: true, message: 'Please enter the Khmer title!' }]}
            >
              <Input placeholder='Enter banner title in Khmer' />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label='Description (Khmer)'
              name='descriptionKh'
              rules={[{ required: true, message: 'Please enter the Khmer description!' }]}
              valuePropName="value"
              getValueFromEvent={(content) => content}
            >
              <ReactQuill language={language} setDescriptionKh={setDescriptionKh} descriptionKh={descriptionKh} placeholder='Enter banner description...' />
            </Form.Item>
          </>
        )}
        <BannerTypeSelection bannerType={bannerType} setBannerType={setBannerType} selectedChatBusiness={selectedChatBusiness} />
        {
          bannerType === 'custom_action' &&
          <CustomAction buttonTitle={buttonTitle}
            setButtonTitle={setButtonTitle}
            actionType={actionType}
            setActionType={setActionType}
            targetAppScreen={targetAppScreen}
            setTargetAppScreen={setTargetAppScreen}
            targetWebsite={targetWebsite}
            setTargetWebsite={setTargetWebsite} />
        }
      </div>

    </>
  );

  const getTitle = () => {
    switch (activeTab) {
      case 'homeTop': return 'Home Top';
      case 'bannerInMoment': return 'Home In Moment';
      case 'category': return 'Banner In Category';
      default: return '';
    }
  };
  const onChange = (key) => {
    console.log(key);
  };
  const [step, setStep] = useState(1)  // Track current step

  const handleNext = () => {
    setSpinning(true)
    setTimeout(() => {
      setStep(step + 1)
      setSpinning(false)
    }, 800)
  }
  const handlePrev = () => setStep(step - 1)

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log("Form Submitted:", values)
      // call API here
    })
  }


  return (
    <>
      <Modal
        title={`Update Advertisement`}
        open={open}
        width={1000}
        centered
        onCancel={handleCancel}
        footer={
          <>
            {step > 0 && (
              <Button onClick={handlePrev}>
                Back
              </Button>
            )}
            {step < 1 ? (
              <Button type='primary' onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type='primary' loading={loading} onClick={handleSave}>
                Save
              </Button>
            )}
          </>
        }
      >
        {/* Steps header */}
        <Steps current={step} size="small" className="mb-6">
          <Step title="Upload Image" />
          <Step title="Advertisement Details" />
        </Steps>

        {/* Step content */}
        <Form form={form} layout='vertical' name='add_advertisement'>
          {step === 0 && (
            <Spin spinning={spinning}>

              <div style={{ flex: 1 }}>{renderContentImage()}</div>

            </Spin>
          )}

          {step === 1 && (
            <Spin spinning={spinning}>
              <div>

                {renderContent()}
              </div>
            </Spin>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default AddBanner;
