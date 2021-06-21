/* eslint-disable  global-require */
import { Row, Col } from 'antd'
import cssClass from 'classnames'
import React, { ReactNode } from 'react'
import { Bank, VatType } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import styles from './styles.module.scss'

const banks = {
  social: require('assets/bank/social.png'),
  qpay: require('assets/bank/qpay.png'),
  organization: require('assets/bank/organization.svg'),
  personal: require('assets/bank/personal.svg'),
}

interface Props {
  className?: string
  title?: string
  description?: string | ReactNode
  text?: string
  right?: boolean
  icon?: ReactNode
  bank?: Bank | VatType
}

const IconText: React.FC<Props> = ({ title, text, children, className, right, icon, bank, description }) => (
  <>
    <Row className={cssClass(styles.row, className, 'c')}>
      {children}
      <Col span={4} className={right ? styles.right : styles.left}>
        {bank ? <img height={50} width={50} src={banks[bank]} alt={title || text} /> : icon}
      </Col>
      <Col span={18} className="c">
        <h4 className={styles.title}>{title ? <FormattedMessage id={title} /> : text}</h4>
      </Col>
    </Row>
    <Col className={styles.description}>
      <span>{description}</span>
    </Col>
  </>
)

export default IconText
