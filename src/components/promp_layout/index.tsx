/* eslint @typescript-eslint/no-explicit-any: off */
import { Button, Grid, Modal, Spin } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'
import { useIntl } from 'react-intl'

interface Props extends ModalProps {
  type?: 'wide' | 'default' | 'full' | 'fwide'
  name: string
  loading: boolean
  onFinish?: (values: any) => void
  initialValues?: any
  form: FormInstance<any>
  formLoading?: boolean
  formLayout?: any
  preserve?: boolean
  okDisable?: boolean
  cancelDisable?: boolean
  onValuesChange?: (changedValues: any, values: any) => void
  onFieldsChange?: (changedFields: any, allFields: any) => void
}

const FormModal: React.FC<Props> = ({
  name,
  children,
  loading,
  okText,
  cancelText,
  onCancel,
  type = 'default',
  formLoading,
  okDisable = false,
  cancelDisable = false,
  ...props
}) => {
  const intl = useIntl()
  const screens = Grid.useBreakpoint()

  const calcWidth = () => {
    switch (type) {
      case 'wide':
        if (screens.xl) {
          return '60%'
        }
        if (screens.md) {
          return '80%'
        }
        return '100%'
      case 'fwide':
        if (screens.xl) {
          return '85%'
        }
        if (screens.md) {
          return '90%'
        }
        return '100%'
      case 'full':
        return '100%'
      default:
        return undefined
    }
  }

  return (
    <Modal
      {...props}
      style={{ top: '1rem' }}
      width={calcWidth()}
      closable={false}
      maskClosable={false}
      onCancel={onCancel}
      footer={[
        <Button key="submit" disabled={okDisable} type="primary" htmlType="submit" form={name} loading={loading}>
          {okText || intl.formatMessage({ id: 'save' })}
        </Button>,
        <Button key="close" disabled={cancelDisable} onClick={onCancel}>
          {cancelText || intl.formatMessage({ id: 'close' })}
        </Button>,
      ]}
    >
      {!formLoading ? (
        { children }
      ) : (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      )}
    </Modal>
  )
}

export default FormModal
