/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import { Alert, Button, Row, Modal } from 'antd'
import { SocialPayResponse } from 'interfaces'
import { FormattedMessage } from 'react-intl'

interface Props {
  transaction: SocialPayResponse
  close: Function
  visible: boolean
}

const url = process.env.REACT_APP_GOLOMT

const SocialPay: React.FC<Props> = ({ transaction, close, visible }) => {
  // useEffect(() => {
  //   window.open(`${url}`)
  //   close()
  // }, [transaction, close])
  const redirect = (type: string) => {
    window.open(`${url}${type}/mn/${transaction.invoice}`)
  }
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
          <FormattedMessage id="billing.golomt" />
        </h4>
        <Row className="m-t-20">
          <Button className="" onClick={() => redirect('payment')}>
            <FormattedMessage id="billing.golomt_payment" />
          </Button>
          <Button className="" onClick={() => redirect('socialpay')}>
            <FormattedMessage id="billing.golomt_socialpay" />
          </Button>
        </Row>
      </div>
    </Modal>
  )
}

export default SocialPay
