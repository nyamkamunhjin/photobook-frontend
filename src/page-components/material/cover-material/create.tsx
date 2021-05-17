import { UploadOutlined } from '@ant-design/icons'
import { useBoolean, useDebounceFn, useRequest } from 'ahooks'
import { Button, Col, Form, Input, InputNumber, message, Row, Select, Switch, Upload } from 'antd'
import { createCoverMaterial, listCoverMaterialColors } from 'api'
import { FormModal } from 'components'
import { SketchPicker } from 'react-color'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { s3Upload } from 'utils/aws-lib'
import { CoverMaterialColor, TemplateType } from '../../../interfaces'

interface Props {
  onOk?: () => void
  onCancel?: () => void
}

const key = 'create_cover_material'

const Create: React.FC<Props> = ({ onOk, onCancel }) => {
  const intl = useIntl()
  const [form] = Form.useForm()
  // const [color, setColor] = useState<string>('#000')
  // const [isColor, setIsColor] = useBoolean(false)
  const [file, setFile] = useState<File>()
  const [visible, setVisible] = useBoolean(true)
  const coverMaterialColors = useRequest<CoverMaterialColor[]>(listCoverMaterialColors)

  const close = useDebounceFn(
    (type: 'ok' | 'cancel') => {
      if (type === 'ok' && onOk) onOk()
      if (type === 'cancel' && onCancel) onCancel()
    },
    { wait: 500 }
  )

  const createAction = useRequest(createCoverMaterial, {
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

  const onHandleFile = (f: File) => {
    setFile(f)
    return false
  }
  // const onChange = (_color: any) => {
  //   const { hex } = _color
  //   setColor(hex)
  // }
  // const onChangeComplete = (_color: any) => {
  //   setIsColor.setFalse()
  // }

  return (
    <FormModal
      form={form}
      type="default"
      visible={visible}
      name={`${key}_form`}
      loading={createAction.loading}
      title={intl.formatMessage({ id: 'cover_material' })}
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
          createAction.run({ ...values, imageUrl })
        })
      }}
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
          <Form.Item
            name="coverLamination"
            rules={[{ required: true }]}
            label={intl.formatMessage({ id: 'cover_lamination' })}
            hasFeedback
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item
            name="coverMaterialColors"
            label={intl.formatMessage({ id: 'cover_material_colors' })}
            rules={[{ required: true }]}
            hasFeedback
          >
            <Select mode="multiple" loading={coverMaterialColors.loading}>
              {coverMaterialColors?.data?.map((each) => (
                <Select.Option key={each.id} value={each.id}>
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>{' '}
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

export default Create
