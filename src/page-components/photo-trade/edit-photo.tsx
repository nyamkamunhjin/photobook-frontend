import { Modal, Form, Input, notification, Select, ConfigProvider } from 'antd'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomButton } from 'components'
import { editPhoto, getTradePhoto, listTradePhotoCategory } from 'api'
import { TradePhoto, TradePhotoCategory } from 'interfaces'
import { useRequest } from 'ahooks'

interface Props {
  id: string
  refreshCallback?: () => void
}

const EditPhoto: React.FC<Props> = ({ id, refreshCallback }) => {
  const [visible, setVisible] = useState(false)
  const intl = useIntl()
  const [loading, setLoading] = useState(false)

  const request = useRequest(editPhoto, {
    manual: true,
  })
  const tradePhotoCategories = useRequest(listTradePhotoCategory)
  const tradePhoto = useRequest(() => getTradePhoto(id), {
    manual: false,
  })

  const onFinish = (values: Partial<TradePhoto>) => {
    setLoading(true)
    request.run(id, values).then((res) => {
      if (res) {
        notification.success({ message: intl.formatMessage({ id: 'success!' }) })
        setVisible(false)
        if (refreshCallback) refreshCallback()
      }
    })
  }

  return (
    <div>
      <CustomButton className="btn-warning" onClick={() => setVisible((prev) => !prev)}>
        <FormattedMessage id="edit" />
      </CustomButton>
      <Modal
        title={<FormattedMessage id="edit" />}
        className="w-full max-w-3xl"
        centered
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={<div />}
      >
        <ConfigProvider renderEmpty={() => <FormattedMessage id="empty" />}>
          <div className="flex items-start p-2 gap-2">
            {tradePhoto.data && (
              <Form
                className="w-full"
                name="basic"
                size="large"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                  ...tradePhoto.data,
                  categories: tradePhoto.data.categories.map((each: TradePhotoCategory) => each.id),
                }}
              >
                <Form.Item
                  label={<FormattedMessage id="photo_name" />}
                  name="photoName"
                  rules={[{ required: false, message: intl.formatMessage({ id: 'required' }) }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label={<FormattedMessage id="description" />}
                  name="description"
                  rules={[{ required: false, message: intl.formatMessage({ id: 'required' }) }]}
                >
                  <Input.TextArea rows={5} />
                </Form.Item>

                <Form.Item
                  label={<FormattedMessage id="categories" />}
                  name="categories"
                  rules={[{ required: false, message: intl.formatMessage({ id: 'required' }) }]}
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
                  rules={[{ required: false, message: intl.formatMessage({ id: 'required' }) }]}
                >
                  <Select mode="tags" />
                </Form.Item>

                <Form.Item>
                  <CustomButton className="btn-accept" type="submit">
                    <FormattedMessage id="upload" />
                  </CustomButton>
                </Form.Item>
              </Form>
            )}
          </div>
        </ConfigProvider>
      </Modal>
    </div>
  )
}

export default EditPhoto
