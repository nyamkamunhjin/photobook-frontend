import { useRequest } from 'ahooks'
import { List, Popconfirm, InputNumber } from 'antd'
import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { deleteCartItem, listShoppingCart, updateCartItem } from 'api'
import { CartItem, RootInterface } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'

const MyCart: React.FC = () => {
  const history = useHistory()
  const user = useSelector((state: RootInterface) => state.auth.user)
  const shoppingCart = useRequest(listShoppingCart, {
    manual: true,
  })

  useEffect(() => {
    if (user?.id) {
      shoppingCart.run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="my_cart" />
      </span>
      <div>
        <List
          itemLayout="horizontal"
          dataSource={shoppingCart.data?.cartItems}
          loading={shoppingCart.loading}
          renderItem={(item: CartItem) => (
            <List.Item
              className="flex flex-wrap gap-4 rounded p-2 hover:bg-gray-50"
              key={item.id}
              actions={[
                <InputNumber
                  defaultValue={item.quantity}
                  min={1}
                  style={{ width: '4rem' }}
                  onChange={(value) => {
                    updateCartItem(item.id, {
                      quantity: value,
                    }).then(() => {
                      shoppingCart.refresh()
                    })
                  }}
                />,
                <Popconfirm
                  title={<FormattedMessage id="delete-confirm-text" />}
                  onConfirm={() => {
                    deleteCartItem({
                      ids: [item.id],
                    }).then(() => {
                      shoppingCart.refresh()
                    })
                  }}
                  okText={<FormattedMessage id="yes" />}
                  cancelText={<FormattedMessage id="no" />}
                >
                  <CustomButton className="btn-cancel" type="button">
                    <FormattedMessage id="delete" />
                  </CustomButton>
                </Popconfirm>,
              ]}
            >
              <div className="flex">
                <img
                  className="w-28 h-28 rounded"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.project.imageUrl}`}
                  alt="project"
                />
                <span className="font-semibold text-base">
                  {item.project.name}{' '}
                  <span className="font-light text-sm text-gray-500">({item.project.templateType?.name})</span>
                </span>
              </div>
              <div className="flex flex-col">
                {/* <span className="text-gray-500">{item.project.paperMaterial?.name}</span>
                <span className="text-gray-500">{item.project.paperSize?.size}</span>
                <span className="text-gray-500">{item.project.bindingType?.name}</span>
                <span className="text-gray-500">{item.project.coverType?.name}</span>
                <span className="text-gray-500">{item.project.frameMaterial?.name}</span> */}
                <span className="text-gray-500">Photo printing</span>
                <span className="text-gray-500">20x30 large</span>
                <span className="text-gray-500">Premium Layflat Binding</span>
                <span className="text-gray-500">Deluxe Hardcover</span>
                <span className="text-gray-500">Glass Frame</span>
                <span className="text-sm text-gray-700">95,999 ₮</span>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default MyCart
