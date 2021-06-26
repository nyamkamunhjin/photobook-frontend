/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

import React from 'react'
import { Alert, Button, Modal, Result } from 'antd'
import { QPayResponse } from 'interfaces'
import { FormattedMessage, useIntl } from 'react-intl'
import { useBoolean, useRequest } from 'ahooks'
import { checkPaymentQPay } from 'api'

interface Props {
  transaction: QPayResponse
  close: Function
  visible: boolean
}

const QPay: React.FC<Props> = ({ transaction, close, visible }) => {
  const [isSuccess, setSuccess] = useBoolean(false)
  const intl = useIntl()
  const { cancel } = useRequest(() => checkPaymentQPay(`invoiceId=${transaction.customer_id}`), {
    onSuccess: ({ success }) => {
      if (success) {
        cancel()
        setSuccess.setTrue()
      }
    },
    pollingInterval: 2000,
    pollingWhenHidden: false,
  })
  return (
    <Modal
      closable={false}
      maskClosable={false}
      visible={visible}
      footer={[
        <Button
          type="primary"
          key="done_button"
          onClick={() => {
            close()
          }}
        >
          <FormattedMessage id="Done" />
        </Button>,
      ]}
    >
      <div className="align_center">
        <h4 style={{ margin: 0 }}>
          <FormattedMessage id="billing.bank_help" />
        </h4>
        <img src={`data:image/png;base64, ${transaction?.qPay_QRimage}`} alt="" />
        <Alert
          style={{ marginTop: '20px' }}
          message={<FormattedMessage id="billing.payment_qpay_info" />}
          type="info"
        />
        {isSuccess && <Result status="success" title={intl.formatMessage({ id: 'billing.success' })} />}
      </div>
    </Modal>
  )
}

export default QPay
