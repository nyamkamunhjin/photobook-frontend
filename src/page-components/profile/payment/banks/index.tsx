/* eslint-disable camelcase */
import React from 'react'
import { SocialPayResponse, PaymentType, PaymentCondition, QPayResponse, BankResponse } from 'interfaces'
import Bank from './bank'
import Golomt from './golomt'
import QPay from './qpay'

interface Props {
  condition: PaymentCondition
  close: Function
  visible: boolean
  accounts: PaymentType[]
}

const RenderBank: React.FC<Props> = ({ condition, close, visible, accounts }) => {
  switch (condition.bank) {
    case 'bank':
      return (
        <Bank transaction={condition.response as BankResponse} accounts={accounts} close={close} visible={visible} />
      )
    case 'socialpay':
      return <Golomt transaction={condition.response as SocialPayResponse} close={close} visible={visible} />
    case 'qpay':
      return <QPay transaction={condition.response as QPayResponse} close={close} visible={visible} />
    default:
      return <div />
  }
}

export default RenderBank
