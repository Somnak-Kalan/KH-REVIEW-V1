import React from 'react'
import { Col, Form, Row } from 'antd'
import ImageUpload from '../ImageUpload'

const BannerImageSection = ({
    activeTab,
    enImageSmall,
    setEnImageSmall,
    enImageLarge,
    setEnImageLarge,
    khImageSmall,
    setKhImageSmall,
    khImageLarge,
    setKhImageLarge,
    handleImageChange,
    handleRemoveImage,
}) => {
    return (
        <div className="">
            <div className="p-0 m-0">
                <div className="">
                    <h1 className="text-lg font-bold text-gray-800">
                        Poster Images (2 Languages x 2 Sizes)
                    </h1>
                </div>
            </div>

            <Row gutter={[8, 2]}>
                <Col xs={24} md={activeTab === 'bannerInMoment' ? 10 : 13}>
                    <Form.Item label="English Posters" labelCol={{ span: '24' }}>
                        <span className="my-2">
                            <ImageUpload
                                label="English Small"
                                image={enImageSmall}
                                setImage={setEnImageSmall}
                                handleImageChange={handleImageChange}
                                handleRemoveImage={handleRemoveImage}
                                langLabel="en"
                                size="Small"
                                activeTab={activeTab}
                            />
                        </span>

                        <span>
                            <ImageUpload
                                label="English Large"
                                image={enImageLarge}
                                setImage={setEnImageLarge}
                                handleImageChange={handleImageChange}
                                handleRemoveImage={handleRemoveImage}
                                langLabel="en"
                                size="Large"
                                activeTab={activeTab}
                            />
                        </span>
                    </Form.Item>
                </Col>

                <Col xs={24} md={9}>
                    <Form.Item label="Khmer Posters" labelCol={{ span: '24' }}>
                        <ImageUpload
                            label="Khmer Small"
                            image={khImageSmall}
                            setImage={setKhImageSmall}
                            handleImageChange={handleImageChange}
                            handleRemoveImage={handleRemoveImage}
                            langLabel="kh"
                            size="Small"
                            activeTab={activeTab}
                        />
                        <ImageUpload
                            label="Khmer Large"
                            image={khImageLarge}
                            setImage={setKhImageLarge}
                            handleImageChange={handleImageChange}
                            handleRemoveImage={handleRemoveImage}
                            langLabel="kh"
                            size="Large"
                            activeTab={activeTab}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    )
}

export default BannerImageSection
