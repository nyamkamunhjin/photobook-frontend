/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import { KhanbankResponse } from 'interfaces'

interface Props {
  transaction: KhanbankResponse
  close: Function
}

const Khanbank: React.FC<Props> = ({ transaction, close }) => {
  useEffect(() => {
    window.open(transaction.formUrl)
    close()
  }, [transaction.formUrl, close])
  return <div />
}

export default Khanbank
