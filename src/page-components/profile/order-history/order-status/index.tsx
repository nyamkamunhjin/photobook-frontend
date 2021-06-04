import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

interface Props {
  status: 'unconfirmed' | 'confirmed' | 'created' | 'checked' | 'delivered' | 'expired'
}
const OrderStatus: FC<Props> = ({ status }) => {
  const getColor = (value: typeof status) => {
    switch (value) {
      case 'unconfirmed':
        return 'bg-gray-300'
      case 'confirmed':
        return 'bg-lightblue-300'
      case 'created':
        return 'bg-blue-300'
      case 'checked':
        return 'bg-yellow-300'
      case 'delivered':
        return 'bg-green-300'
      case 'expired':
        return 'bg-red-300'
      default:
        return 'bg-black'
    }
  }

  return (
    <span className={`text-xs font-semibold py-1 px-3 rounded-sm ${getColor(status)} text-white`}>
      <FormattedMessage id={status} />
    </span>
  )
}

export default OrderStatus
