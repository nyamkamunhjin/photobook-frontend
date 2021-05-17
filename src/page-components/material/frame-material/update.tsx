import { UploadOutlined } from '@ant-design/icons'
import { useBoolean, useDebounceFn, useRequest } from 'ahooks'
import { Button, Col, Form, Input, InputNumber, message, Row, Upload } from 'antd'
import { getFrameMaterial, listTemplateType, updateFrameMaterial } from 'api'
import { FormModal } from 'components'
import { FrameMaterial, TemplateType } from 'interfaces'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { s3Upload } from 'utils/aws-lib'

interface Props {
  id: number
  onOk?: () => void
  onCancel?: () => void
}

const key = 'update_frame_material'

const Update: React.FC<Props> = ({ id, onOk, onCancel }) => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [file, setFile] = useState<any>()
  const [visible, setVisible] = useBoolean(true)
  const types = useRequest<TemplateType[]>(listTemplateType)
  const close = useDebounceFn(
    (type: 'ok' | 'cancel') => {
      if (type === 'ok' && onOk) onOk()
      if (type === 'cancel' && onCancel) onCancel()
    },
    { wait: 500 }
  )
  const getAction = useRequest<FrameMaterial>(() => getFrameMaterial(id), {
    onSuccess: (data) => {
      if (data.imageUrl) {
        setFile({
          uid: -1,
          url: data.tempUrl,
        })
      }
    },
  })

  const updateAction = useRequest(updateFrameMaterial, {
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

  const onHandleFile = (f: any) => {
    setFile(f)
    return false
  }

  return (
    <FormModal
      form={form}
      type="default"
      visible={visible}
      name={`${key}_form`}
      loading={updateAction.loading}
      title={intl.formatMessage({ id: 'frame_material' })}
      onCancel={() => {
        setVisible.setFalse()
        close.run('cancel')
      }}
      onFinish={(values) => {
        message.loading({
          content: intl.formatMessage({ id: 'loading!' }),
          key,
        })
        if (file && file?.uid !== -1) {
          s3Upload(file).then((imageUrl) => {
            updateAction.run(id, { ...values, imageUrl })
          })
        } else {
          updateAction.run(id, values)
        }
      }}
      formLoading={getAction.loading}
      initialValues={getAction.data}
    >
      <Row>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="name" label={intl.formatMessage({ id: 'name' })} rules={[{ required: true }]} hasFeedback>
            <Input placeholder={intl.formatMessage({ id: 'name' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="description" label={intl.formatMessage({ id: 'description' })} hasFeedback>
            <Input.TextArea rows={3} placeholder={intl.formatMessage({ id: 'description' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="price" rules={[{ required: true }]} label={intl.formatMessage({ id: 'price' })} hasFeedback>
            <InputNumber placeholder={intl.formatMessage({ id: 'price' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item
            name="quantity"
            rules={[{ required: true }]}
            label={intl.formatMessage({ id: 'quantity' })}
            hasFeedback
          >
            <InputNumber placeholder={intl.formatMessage({ id: 'quantity' })} />
          </Form.Item>
        </Col>
        <Upload
          fileList={file ? [file] : []}
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
      </Row>
    </FormModal>
  )
}

export default Update
