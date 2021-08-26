import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

interface Props {
  status: 'unconfirmed' | 'confirmed' | 'created' | 'checked' | 'delivered' | 'expired' | 'cancelled'
}
const OrderStatus: FC<Props> = ({ status }) => {
  const getColor = (value: typeof status) => {
    switch (value) {
      case 'unconfirmed':
        return 'bg-gray-500'
      case 'confirmed':
        return 'bg-indigo-500'
      case 'created':
        return 'bg-blue-500'
      case 'checked':
        return 'bg-yellow-500'
      case 'delivered':
        return 'bg-green-500'
      case 'expired':
        return 'bg-red-500'
      case 'cancelled':
        return 'bg-red-500'
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
