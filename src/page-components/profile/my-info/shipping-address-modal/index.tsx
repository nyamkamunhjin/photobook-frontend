import { Modal, Input, Form } from 'antd'
import React, { FC, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { CustomButton, Loading } from 'components'
import { createShippingAddress, getShippingAddress, updateShippingAddress } from 'api'
import { useRequest } from 'ahooks'

interface Props {
  id?: number | undefined
  setId: React.Dispatch<React.SetStateAction<number | undefined>>
  type?: 'edit' | 'add'
  setType: React.Dispatch<React.SetStateAction<'edit' | 'add' | undefined>>
}

const ShippingAddressModal: FC<Props> = ({ id, setId, type, setType }) => {
  const shippingAddress = useRequest(getShippingAddress, {
    manual: true,
    onSuccess: () => {
      // notification.success({ message: JSON.stringify(res) })
    },
  })

  useEffect(() => {
    if (typeof id === 'number') {
      shippingAddress.run(id)
    }
  }, [id, type])

  const onCancel = () => {
    setId(undefined)
    setType(undefined)
  }

  const onFinish = (values: any) => {
    if (type === 'edit') {
      updateShippingAddress(id as number, values)
        .then(() => {
          // notification.success({ message: intl.formatMessage({ id: 'success' }) })
          onCancel()
        })
        .catch(() => {
          // notification.error({ message: intl.formatMessage({ id: 'error' }) })
          onCancel()
        })
    }

    if (type === 'add') {
      createShippingAddress(values)
        .then(() => {
          // notification.success({ message: intl.formatMessage({ id: 'success' }) })
          onCancel()
        })
        .catch(() => {
          // notification.error({ message: intl.formatMessage({ id: 'error' }) })
          onCancel()
        })
    }
  }

  return (
    <Modal
      visible={!!id || !!type}
      closable={false}
      onCancel={onCancel}
      onOk={onFinish}
      footer={[
        <div className="flex gap-2 justify-end">
          <CustomButton className="btn-cancel" onClick={onCancel}>
            <FormattedMessage id="cancel" />
          </CustomButton>
          <CustomButton className="btn-accept" type="submit" form="shippingForm">
            <FormattedMessage id={type || ''} />
          </CustomButton>
        </div>,
      ]}
    >
      {shippingAddress.data || type === 'add' ? (
        <Form
          className="w-full"
          id="shippingForm"
          size="large"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            firstName: shippingAddress.data?.firstName,
            lastName: shippingAddress.data?.lastName,
            companyName: shippingAddress.data?.companyName,
            address: shippingAddress.data?.address,
            description: shippingAddress.data?.description,
          }}
        >
          <div className="flex gap-4">
            <Form.Item
              className="flex-1"
              name="firstName"
              label={<FormattedMessage id="delivery_first_name" />}
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_delivery_first_name" />,
                },
                {
                  required: true,
                  message: <FormattedMessage id="please_input_first_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name="lastName"
              label={<FormattedMessage id="delivery_last_name" />}
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_delivery_last_name" />,
                },
                {
                  required: true,
                  message: <FormattedMessage id="please_input_last_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item className="flex-1" name="companyName" label={<FormattedMessage id="company_name" />}>
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label={<FormattedMessage id="address" />}
            rules={[
              {
                type: 'string',
                message: <FormattedMessage id="wrong_address" />,
              },
              {
                required: true,
                message: <FormattedMessage id="please_input_address" />,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={<FormattedMessage id="additional_description" />}
            rules={[
              {
                type: 'string',
                message: <FormattedMessage id="wrong_additional_description" />,
              },
              {
                required: true,
                message: <FormattedMessage id="please_input_additional_description" />,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      ) : (
        <Loading fill={false} />
      )}
    </Modal>
  )
}

export default ShippingAddressModal
