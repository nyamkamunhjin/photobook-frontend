import { Input, notification } from 'antd'
import { activateGiftCard, addGiftCardToShoppingCart } from 'api'
import { CustomButton } from 'components'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

interface Props {
  refresh?: () => void
}

const ActivateGiftCard: React.FC<Props> = ({ refresh }) => {
  const intl = useIntl()
  const [input, setInput] = useState<string>('')
  return (
    <div className="flex gap-2">
      <Input value={input} onChange={(e) => setInput(e.target.value)} />
      <CustomButton
        className="btn-primary"
        onClick={() => {
          addGiftCardToShoppingCart(input, 'attach').then((result) => {
            if (result) {
              notification.success({ message: intl.formatMessage({ id: 'added_gift_card' }) })
            } else {
              notification.warning({ message: intl.formatMessage({ id: 'wrong_gift_card_code' }) })
            }
            if (refresh) refresh()
          })
        }}
      >
        <FormattedMessage id="activate" />
      </CustomButton>
    </div>
  )
}

export default ActivateGiftCard
