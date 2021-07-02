import { Modal, Form, Input, notification, InputNumber, Upload, Select } from 'antd'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomButton } from 'components'
import { listTradePhotoCategory, uploadPhoto } from 'api'
import { UploadOutlined } from '@ant-design/icons'
import { TradePhoto, TradePhotoCategory } from 'interfaces'
import { s3Upload } from 'utils/aws-lib'
import { useRequest } from 'ahooks'
import { currencyFormat } from '../../utils'

interface Props {
  refreshCallback?: () => void
}

const UploadPhoto: React.FC<Props> = ({ refreshCallback }) => {
  const [visible, setVisible] = useState(false)
  const [file, setFile] = useState<File>()
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const request = useRequest(uploadPhoto, {
    manual: true,
  })

  const tradePhotoCategories = useRequest(listTradePhotoCategory)

  const onFinish = (values: Partial<TradePhoto>) => {
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

              if (refreshCallback) refreshCallback()
            }
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
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
        className="w-full max-w-3xl"
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
              <InputNumber formatter={(value) => `${currencyFormat(value as number)} ₮`} />
            </Form.Item>

            <Form.Item
              label={<FormattedMessage id="categories" />}
              name="categories"
              rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
            >
              <Select mode="multiple" optionFilterProp="children">
                {tradePhotoCategories.data?.map((each: TradePhotoCategory) => (
                  <Select.Option key={each.id} value={each.id}>
                    {each.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<FormattedMessage id="tag" />}
              name="tag"
              rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
            >
              <Select mode="tags" />
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
