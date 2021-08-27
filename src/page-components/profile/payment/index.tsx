/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import { Col, Row, Radio, Button, Form, message, Input } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import {
  OrganizationCode,
  Bank,
  SocialPayResponse,
  QPayResponse,
  PaymentCondition,
  PaymentType,
  BankResponse,
} from 'interfaces'
import { paymentCheckOrganization, paymentSocialPay, paymentQPay, paymentBank } from 'api'
import { FormattedMessage, useIntl } from 'react-intl'
import { useBoolean, useRequest } from 'ahooks'
import { Store } from 'antd/es/form/interface'
import { FormModal, IconText } from 'components'
import { HalfLayout, VerticalLayout } from 'configs'
import RenderBank from './banks'

interface Props {
  payment: {
    types: PaymentType[]
    accounts: PaymentType[]
  }
  close: () => void
  visible: boolean
  loading: boolean
  id: number
}

const PaymentTypes: React.FC<Props> = ({ payment, close, id, loading, visible }) => {
  const [, refresh] = useBoolean(false)
  const intl = useIntl()
  const [form] = Form.useForm()
  const [condition, setCondition] = useState<PaymentCondition>()

  const bank = useRequest<BankResponse>(paymentBank, {
    manual: true,
    onSuccess: (response) => {
      setCondition({ bank: 'bank', response, visible: true })
    },
  })
  const socialpay = useRequest<SocialPayResponse>(paymentSocialPay, {
    manual: true,
    onSuccess: (response) => {
      setCondition({ bank: 'socialpay', response, visible: true })
    },
  })
  const qpay = useRequest<QPayResponse>(paymentQPay, {
    manual: true,
    onSuccess: (response) => {
      setCondition({ bank: 'qpay', response, visible: true })
    },
  })

  const organization = useRequest<OrganizationCode>(paymentCheckOrganization, {
    manual: true,
    onSuccess: (value) => {
      if (!value.found) {
        message.error(intl.formatMessage({ id: 'billing.organization_not_found' }))
      }
    },
  })

  const handleFinish = async (values: Store) => {
    const request = {
      invoiceUid: id,
      organizationCode: '',
    }
    if (values.ebarimt_type === 'organization') {
      if (organization && organization.data?.found) {
        request.organizationCode = values.organization_code
      } else {
        return null
      }
    }
    switch (values.payment_type) {
      case 'qpay':
        qpay.run({ data: request })
        break
      case 'socialpay':
        socialpay.run({ data: request })
        break
      case 'bank':
        bank.run({ data: request })
        break
      default:
        break
    }
    return null
  }
  return (
    <FormModal
      form={form}
      formLayout={VerticalLayout}
      type="wide"
      visible={visible}
      name="payment_form"
      loading={loading}
      title={intl.formatMessage({ id: 'paper_size' })}
      onCancel={close}
      onFinish={handleFinish}
    >
      <Form.Item required name="ebarimt_type" label={<FormattedMessage id="billing.ebarimt_type" />}>
        <Radio.Group className="w-fill" onChange={() => refresh.toggle()}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Radio.Button value="personal" className="m-5 p-5  w-10/12 border-r-4 drop-shadow-md h-auto">
                <IconText
                  bank="personal"
                  title="billing.personal"
                  description={<FormattedMessage id="billing.personal_desc" />}
                />
              </Radio.Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Radio.Button value="organization" className="m-5 p-5 w-10/12 border-r-4 drop-shadow-md h-auto">
                <IconText
                  bank="organization"
                  title="billing.organization"
                  description={<FormattedMessage id="billing.organization_desc" />}
                />
              </Radio.Button>
            </Col>
          </Row>
        </Radio.Group>
      </Form.Item>
      {form.getFieldValue('ebarimt_type') === 'organization' && (
        <Form.Item
          required
          validateStatus={
            organization.loading ? (organization.data && organization.data.found ? 'success' : 'error') : 'validating'
          }
          className="w-11/12"
          rules={[{ pattern: /^[0-9]{7}$/g, message: <FormattedMessage id="valid.organization_code" /> }]}
          name="organization_code"
          label={<FormattedMessage id="billing.organization_code" />}
        >
          <Input
            suffix={
              organization.loading ? (
                <LoadingOutlined />
              ) : organization.data?.found ? (
                organization.data?.name
              ) : (
                <FormattedMessage id="valid.organization_code" />
              )
            }
            onChange={(event) => {
              event.persist()
              if (/^[0-9]{7}$/g.test(event.target.value)) {
                organization.run(event.target.value).then(() => event.target.focus())
              }
            }}
          />
        </Form.Item>
      )}

      <Form.Item required name="payment_type" label={<FormattedMessage id="billing.payment_type" />}>
        <Radio.Group className="w-fill">
          <Row>
            {payment.types?.map((type) => (
              <Col key={type.id} xs={24} sm={24} md={24} lg={12}>
                <Radio.Button value={type.name} className="m-5 p-5 bg-red-500 w-10/12 border-r-4 drop-shadow-md">
                  <IconText bank={type.name as Bank} title={type.name} description={type.description} />
                </Radio.Button>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>
      <Row justify="end">
        <Col span={6} xs={11} sm={11} md={6}>
          <Button block form="pay" type="primary" htmlType="submit">
            <FormattedMessage id="billing.pay" />
          </Button>
        </Col>
      </Row>
      {condition?.visible && (
        <RenderBank
          accounts={payment.accounts}
          condition={condition}
          close={() => setCondition(undefined)}
          visible={!!condition}
        />
      )}
    </FormModal>
  )
}

export default PaymentTypes
