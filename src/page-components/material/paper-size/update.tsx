import { useBoolean, useDebounceFn, useRequest } from 'ahooks'
import { Col, Form, Input, InputNumber, message, Row } from 'antd'
import { getPaperSize, updatePaperSize } from 'api'
import { FormModal } from 'components'
import { BindingType, PaperSize } from 'interfaces'
import React from 'react'
import { useIntl } from 'react-intl'

interface Props {
  id: number
  onOk?: () => void
  onCancel?: () => void
}

const key = 'update_paper_size'

const Update: React.FC<Props> = ({ id, onOk, onCancel }) => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [visible, setVisible] = useBoolean(true)
  const close = useDebounceFn(
    (type: 'ok' | 'cancel') => {
      if (type === 'ok' && onOk) onOk()
      if (type === 'cancel' && onCancel) onCancel()
    },
    { wait: 500 }
  )
  const getAction = useRequest<PaperSize>(() => getPaperSize(id))

  const updateAction = useRequest(updatePaperSize, {
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
      loading={updateAction.loading}
      title={intl.formatMessage({ id: 'paper_size' })}
      onCancel={() => {
        setVisible.setFalse()
        close.run('cancel')
      }}
      onFinish={(values) => {
        message.loading({
          content: intl.formatMessage({ id: 'loading!' }),
          key,
        })
        updateAction.run(id, values)
      }}
      formLoading={getAction.loading}
      initialValues={getAction.data}
    >
      <Row>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="size" label={intl.formatMessage({ id: 'size' })} rules={[{ required: true }]} hasFeedback>
            <Input placeholder={intl.formatMessage({ id: 'size' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="description" label={intl.formatMessage({ id: 'description' })} hasFeedback>
            <Input.TextArea rows={3} placeholder={intl.formatMessage({ id: 'description' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="width" rules={[{ required: true }]} label={intl.formatMessage({ id: 'width' })} hasFeedback>
            <InputNumber placeholder={intl.formatMessage({ id: 'width' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item
            name="height"
            rules={[{ required: true }]}
            label={intl.formatMessage({ id: 'height' })}
            hasFeedback
          >
            <InputNumber placeholder={intl.formatMessage({ id: 'height' })} />
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  )
}

export default Update
