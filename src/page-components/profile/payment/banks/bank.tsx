/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

import React from 'react'
import { Alert, Button, Col, Modal, Row } from 'antd'
import { BankResponse, PaymentType } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { currencyFormat } from 'utils'
import styles from './styles.module.scss'

interface Props {
  transaction?: BankResponse
  accounts?: PaymentType[]
  close: Function
  visible: boolean
}

const Bank: React.FC<Props> = ({ transaction, accounts, close, visible }) => {
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
      <div className={styles.bank_accounts_container}>
        <h3 style={{ margin: 0, marginBottom: 20, textAlign: 'center' }}>
          <FormattedMessage id="billing.bank_help" />
        </h3>
        <Row gutter={16} className={styles.value_container} style={{ lineHeight: '26px' }}>
          {accounts?.map((acc) => {
            return (
              <React.Fragment key={`a${acc.id}`}>
                <Col span={12} className={styles.key}>
                  <FormattedMessage id={acc.name} />
                  <img
                    alt={acc.name}
                    style={{ width: '20px', marginLeft: '8px' }}
                    src={require(`assets/bank/${acc.name}.png`)}
                  />
                </Col>
                <Col span={12} className={styles.value}>
                  <strong style={{ fontSize: 16, display: 'inline-block' }}>{acc.account}</strong>
                </Col>
              </React.Fragment>
            )
          })}
        </Row>
        <Row gutter={16} className={styles.value_container}>
          <Col span={12} className={styles.key}>
            <FormattedMessage id="billing.payment_amount" />
          </Col>
          <Col span={12} className={styles.value}>
            <span className={styles.value_title}>
              {currencyFormat(transaction ? Math.ceil(transaction.paymentAmount - transaction.paidAmount) : 0)}
            </span>
          </Col>
          <Col span={12} className={styles.key}>
            <FormattedMessage id="billing.owner" />
          </Col>
          <Col span={12} className={styles.value}>
            <span className={styles.value_title}>itools</span>
          </Col>
          <Col span={12} className={styles.key}>
            <FormattedMessage id="billing.transcation_desc" />
          </Col>
          <Col span={12} className={styles.value}>
            <span style={{ color: 'red' }} className={styles.value_title}>
              {transaction && transaction.paymentCode}
            </span>
          </Col>
        </Row>
        <Alert style={{ marginTop: '20px' }} message={<FormattedMessage id="billing.payment_info" />} type="info" />
      </div>
    </Modal>
  )
}

export default Bank
