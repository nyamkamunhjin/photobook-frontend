import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { ShippingAddress } from 'interfaces'

interface ShippingAddressProps {
  shippingAddresses: ShippingAddress[]
  selected: SelectValue
  setSelected: React.Dispatch<React.SetStateAction<SelectValue>>
}

const CartAddress: React.FC<ShippingAddressProps> = ({ shippingAddresses, selected, setSelected }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <span className="text-sm font-semibold">
        <FormattedMessage id="delivery" />
      </span>
      <Select value={selected} onChange={setSelected}>
        {shippingAddresses?.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">{item.address}</span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="delivery_first_name" />: {item.firstName}
              </span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="delivery_last_name" />: {item.lastName}
              </span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="delivery_company_name" />: {item.companyName}
              </span>
              <span>{item.description}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default CartAddress
