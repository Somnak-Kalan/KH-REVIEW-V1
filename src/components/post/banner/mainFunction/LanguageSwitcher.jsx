import React from 'react'
import { Button, Col, Row } from 'antd'

const LanguageSwitcher = ({ language, setLanguage }) => {
    return (
        <Row gutter={16} className="">
            <Col span={24}>
                <div
                    className="flex justify-center rounded-md bg-gray-100"
                    style={{ border: '1px solid #E2EFFF' }}
                >
                    <Button
                        type={language === 'en' ? 'default' : 'white'}
                        style={language === 'en' ? { border: '1px solid #E2EFFF' } : {}}
                        onClick={() => setLanguage('en')}
                        className="w-full my-1 mx-1 rounded-lg flex itemsCenter justify-center gap-2"
                    >
                        🇺🇸 English
                    </Button>

                    <Button
                        type={language === 'kh' ? 'default' : 'white'}
                        style={language === 'kh' ? { border: '1px solid #E2EFFF' } : {}}
                        onClick={() => setLanguage('kh')}
                        className="w-full my-1 mx-1 rounded-lg flex items-center justify-center gap-2"
                    >
                        🇰🇭 ខ្មែរ (Khmer)
                    </Button>
                </div>
            </Col>
        </Row>
    )
}

export default LanguageSwitcher
