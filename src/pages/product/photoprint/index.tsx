import React, { FC, useEffect } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { message, RadioChangeEvent } from 'antd'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import { useRequest } from 'ahooks'
import { listProductAd, listTemplate, listTemplateCategory } from 'api'
import { ProductWrapper, ProductCategories, ProductList } from 'components'
import { useQueryState } from 'react-router-use-location-state'

const ProductPhotoPrint: FC = () => {
  const [selectedCategory, setSelectedCategory] = useQueryState('category', 'all')
  const [rowSize, setRowSize] = useQueryState<3 | 4 | 6>('rowSize', 3)
  const [all, setAll] = useQueryState('all', true)
  const ad = useRequest(() => listProductAd('photoprint'))
  const categories = useRequest(
    () => listTemplateCategory({ current: 0, pageSize: 100 }, { templateType: 'photoprint' }),
    {
      onError: () => {
        message.error('error')
      },
    }
  )

  const templates = useRequest(
    ({ current, pageSize }) =>
      listTemplate(
        {
          current,
          pageSize,
        },
        {
          categories: all ? null : selectedCategory.toString(),
          templateType: 'photoprint',
        },
        (current - 1) * pageSize
      ),
    {
      onError: () => {
        message.error('error')
      },
      paginated: true,
    }
  )

  const onMenuClick: MenuClickEventHandler = (value) => {
    if (value.key === 'all') setAll(true)
    else setAll(false)
    setSelectedCategory(value.key.toString())
  }

  const onRadioChange = (e: RadioChangeEvent) => setRowSize(e.target.value)

  useEffect(() => {
    templates.refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  return (
    <ProductWrapper bannerImageUrl={ad.data?.find((each: any) => each.templateType === 'photoprint')?.imageUrl}>
      <WidthLimiter>
        <div className="flex min-h-screen">
          <div className="flex justify-center w-1/4 ">
            <ProductCategories categories={categories} selectedCategory={selectedCategory} onMenuClick={onMenuClick} />
          </div>
          <div className="w-3/4">
            <ProductList templates={templates} onRadioChange={onRadioChange} rowSize={rowSize} />
          </div>
        </div>
      </WidthLimiter>
    </ProductWrapper>
  )
}

export default ProductPhotoPrint
