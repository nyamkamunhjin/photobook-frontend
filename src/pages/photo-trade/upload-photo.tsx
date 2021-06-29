import { Modal, Form, Input, notification, InputNumber, Upload } from 'antd'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomButton } from 'components'
import { uploadPhoto } from 'api'
import { UploadOutlined } from '@ant-design/icons'
import { TradePhoto } from 'interfaces'
import { s3Upload } from 'utils/aws-lib'
import { useRequest } from 'ahooks'

const UploadPhoto: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [file, setFile] = useState<File>()
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const request = useRequest(uploadPhoto, {
    manual: true,
  })

  const onFinish = (values: Partial<TradePhoto>) => {
    // console.log(values)
    setLoading(true)
    if (!file) {
      notification.error({ message: intl.formatMessage({ id: 'image.validation' }) })
    } else {
      s3Upload(file)
        .then((imageUrl) => {
          request.run({ ...values, imageUrl }).then((res) => {
            if (res) {
              notification.success({ message: intl.formatMessage({ id: 'success!' }) })
              setVisible(false)
            }
          })
          // alert(imageUrl)
        })
        .finally(() => {
          setLoading(false)
        })
    }

    // uploadPhoto(values).then((res) => {
    //   if (res) {
    //     notification.success({ message: intl.formatMessage({ id: 'success!' }) })
    //   }
    // })
  }

  const onHandleFile = (f: File) => {
    setFile(f)
    return false
  }

  return (
    <div>
      <CustomButton className="btn-primary" onClick={() => setVisible((prev) => !prev)}>
        <FormattedMessage id="sell_photo" />
      </CustomButton>
      <Modal
        title={<FormattedMessage id="sell_photo" />}
        className="w-full max-w-6xl"
        centered
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={<div />}
      >
        <div className="flex items-start p-2 gap-2">
          <Form className="w-full" name="basic" size="large" onFinish={onFinish} layout="vertical">
            <Form.Item
              label={<FormattedMessage id="photo_name" />}
              name="photoName"
              rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={<FormattedMessage id="description" />}
              name="description"
              rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item
              label={<FormattedMessage id="price" />}
              name="price"
              rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
            >
              <InputNumber />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              rules={[{ required: true }]}
              label={intl.formatMessage({ id: 'image' })}
              hasFeedback
            >
              <Upload
                listType="picture-card"
                onRemove={() => setFile(undefined)}
                beforeUpload={onHandleFile}
                className="text-left"
              >
                {!file && (
                  <CustomButton className="btn-primary" icon={<UploadOutlined />}>
                    <FormattedMessage id="upload" />
                  </CustomButton>
                )}
              </Upload>
              {/* <Input /> */}
            </Form.Item>

            <Form.Item>
              <CustomButton className="btn-accept" type="submit" loading={loading}>
                <FormattedMessage id="upload" />
              </CustomButton>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default UploadPhoto
