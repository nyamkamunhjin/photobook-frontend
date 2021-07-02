import React from 'react'
import { TradePhotoApproveType } from 'interfaces'
import { FormattedMessage } from 'react-intl'

interface Props {
  status: TradePhotoApproveType
  className: string
}

const PhotoTradeStatus: React.FC<Props> = ({ status, className }) => {
  const getColor = (value: typeof status) => {
    switch (value) {
      case 'approved':
        return 'bg-green-400'
      case 'pending':
        return 'bg-yellow-400'
      case 'declined':
        return 'bg-red-400'
      default:
        return 'bg-white'
    }
  }
  return (
    <span className={`text-xs font-medium py-1 px-3 rounded-sm ${getColor(status)} text-white ${className}`}>
      <FormattedMessage id={status} />
    </span>
  )
}

export default PhotoTradeStatus
