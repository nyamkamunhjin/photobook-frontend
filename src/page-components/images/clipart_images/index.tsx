import { UploadOutlined } from '@ant-design/icons'
import { useBoolean, useDebounceFn, useRequest } from 'ahooks'
import { Button, Col, Form, message, Row, Select, Upload } from 'antd'
import { createImage, listImageCategory } from 'api'
import { FormModal } from 'components'
import { ImageCategory } from 'interfaces'
import React, { useState } from 'react'
import { s3Upload } from 'utils/aws-lib'
import { FormattedMessage, useIntl } from 'react-intl'

interface Props {
  onOk?: () => void
  onCancel?: () => void
}

const key = 'create_file'

const Create: React.FC<Props> = ({ onOk, onCancel }) => {
  const intl = useIntl()
  const [file, setFile] = useState<File>()
  const categories = useRequest<ImageCategory[]>(() => listImageCategory('cliparts'))
  const [form] = Form.useForm()
  const [visible, setVisible] = useBoolean(true)
  const close = useDebounceFn(
    (type: 'ok' | 'cancel') => {
      if (type === 'ok' && onOk) onOk()
      if (type === 'cancel' && onCancel) onCancel()
    },
    { wait: 500 }
  )
  const onHandleFile = (f: File) => {
    setFile(f)
    return false
  }

  const createAction = useRequest(createImage, {
    manual: true,
    onSuccess: () => {
      message.success({ content: intl.formatMessage({ id: 'success!' }), key })
      setVisible.setFalse()
      close.run('ok')
    },
    onError: () => {
      message.error({ content: intl.formatMessage({ id: 'error!' }), key })
    },
  })
  return (
    <FormModal
      form={form}
      type="default"
      visible={visible}
      name={`${key}_form`}
      loading={createAction.loading}
      title={intl.formatMessage({ id: 'clipart' })}
      onCancel={() => {
        setVisible.setFalse()
        close.run('cancel')
      }}
      onFinish={(values) => {
        message.loading({
          content: intl.formatMessage({ id: 'loading!' }),
          key,
        })
        s3Upload(file).then((imageUrl) => {
          createAction.run({ ...values, type: 'cliparts', imageUrl })
        })
      }}
    >
      <Row>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item
            name="imageCategories"
            label={intl.formatMessage({ id: 'category' })}
            rules={[{ required: true }]}
            hasFeedback
          >
            <Select mode="multiple" loading={categories.loading}>
              {categories?.data?.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Upload
            listType="picture-card"
            onRemove={() => setFile(undefined)}
            beforeUpload={onHandleFile}
            className="text-left"
          >
            {!file && (
              <Button icon={<UploadOutlined />}>
                <FormattedMessage id="upload" />
              </Button>
            )}
          </Upload>
        </Col>
      </Row>
    </FormModal>
  )
}

export default Create
