import React from 'react'
import { Form, Card, Row, Col } from 'antd'
import UploadImage from './PlaceImgVideo/UploadThumbnail'
import UploadVideo from './PlaceImgVideo/UploadVideo'

export default function PlaceImageAndVideo({
  keyCat,
  setKeyCat,
  form,
}) {
  return (
    <div className='p-4 space-y-4'>
      <Form form={form} layout='vertical'>
        {/* ❶  hidden dummy so "gallery" is known to the form */}
        <Form.Item name='gallery' noStyle>
          <input type='hidden' />
        </Form.Item>

        <Card>
          <h2 className='text-lg font-semibold'>
            Upload Thumbnail &amp; Video

          </h2>
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <UploadImage form={form} />
              </Col>
              <Col xs={24}>
                <UploadVideo form={form} />
              </Col>
            </Row>
          </div>
        </Card>
      </Form>

    </div>
  )
}
