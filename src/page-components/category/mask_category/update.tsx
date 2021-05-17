import { useBoolean, useDebounceFn, useRequest } from 'ahooks'
import { Col, Form, Input, message, Row, Select } from 'antd'
import { getImageCategory, listImageCategory, updateImageCategory } from 'api'
import { FormModal } from 'components'
import { ImageCategory } from 'interfaces'
import React from 'react'
import { useIntl } from 'react-intl'

interface Props {
  id: number
  onOk?: () => void
  onCancel?: () => void
}

const key = 'update_category'

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
  const getAction = useRequest<ImageCategory>(() => getImageCategory(id))
  const categories = useRequest<ImageCategory[]>(() => listImageCategory('masks'))
  const updateAction = useRequest(updateImageCategory, {
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
      title={intl.formatMessage({ id: 'category' })}
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
          <Form.Item name="name" label={intl.formatMessage({ id: 'name' })} rules={[{ required: true }]} hasFeedback>
            <Input placeholder={intl.formatMessage({ id: 'name' })} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} xl={24}>
          <Form.Item name="parentId" label={intl.formatMessage({ id: 'parent' })} hasFeedback>
            <Select loading={categories.loading}>
              {categories?.data
                ?.filter((c) => c.id !== id)
                ?.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  )
}

export default Update
