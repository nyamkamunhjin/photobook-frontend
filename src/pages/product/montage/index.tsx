import React, { FC, useEffect } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { Checkbox, message, RadioChangeEvent } from 'antd'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import { useRequest } from 'ahooks'
import { listProductAd, listTemplate, listTemplateCategory } from 'api'
import { ProductWrapper, ProductCategories, ProductList } from 'components'
import { useQueryState } from 'react-router-use-location-state'
import { FormattedMessage } from 'react-intl'
import { MontageFormat } from 'configs'

const templateType = 'montage'

const ProductMontage: FC = () => {
  const [selectedCategory, setSelectedCategory] = useQueryState('category', 'all')
  const [selectedFormat, setSelectedFormat] = useQueryState('format', MontageFormat.join(','))
  const [rowSize, setRowSize] = useQueryState<3 | 4 | 6>('rowSize', 3)
  const [all, setAll] = useQueryState('all', true)
  const ad = useRequest(() => listProductAd(templateType))
  const categories = useRequest(() => listTemplateCategory({ current: 0, pageSize: 100 }, { templateType }), {
    onError: () => {
      message.error('error')
    },
  })

  const templates = useRequest(
    ({ current, pageSize }) =>
      listTemplate(
        {
          current,
          pageSize,
        },
        {
          categories: all ? null : selectedCategory.toString(),
          montageType: selectedFormat.includes('all') ? null : selectedFormat.toString(),
          templateType,
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
    templates.pagination.changeCurrent(1)
    templates.refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedFormat])

  return (
    <ProductWrapper bannerImageUrl={ad.data?.find((each: any) => each.templateType === templateType)?.imageUrl}>
      <WidthLimiter>
        <div className="flex min-h-screen">
          <div className="flex items-center w-1/4 flex-col gap-8">
            <ProductCategories categories={categories} selectedCategory={selectedCategory} onMenuClick={onMenuClick} />
            <div>
              <h2 className="text-2xl font-bold">
                <FormattedMessage id="format" />
              </h2>
              <Checkbox.Group
                options={MontageFormat}
                value={selectedFormat ? selectedFormat.split(',') : []}
                onChange={(list) => (list.length ? setSelectedFormat(list.join(',')) : setSelectedFormat('all'))}
                className="flex flex-col"
              />
            </div>
          </div>
          <div className="w-3/4">
            <ProductList templates={templates} onRadioChange={onRadioChange} rowSize={rowSize} />
          </div>
        </div>
      </WidthLimiter>
    </ProductWrapper>
  )
}

export default ProductMontage
