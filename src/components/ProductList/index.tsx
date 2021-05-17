import React, { FC } from 'react'
import { Pagination, Radio, RadioChangeEvent } from 'antd'
import { TemplateCard, Loading } from 'components'
import { Template } from 'interfaces'

interface Props {
  templates: any
  onRadioChange: (e: RadioChangeEvent) => void
  rowSize: 3 | 4 | 6
}

const ProductList: FC<Props> = ({ templates, onRadioChange, rowSize }) => {
  const renderTemplates = (list: Template[]) => {
    return list.length === 0 ? (
      <div className="flex justify-center items-center h-screen w-screen">
        <span>Empty</span>
      </div>
    ) : (
      list.map((each: Template) => <TemplateCard key={each.id} template={each} rowSize={rowSize} />)
    )
  }

  return (
    <>
      <div className="flex p-2">
        <Pagination
          {...(templates.pagination as any)}
          showSizeChanger
          onShowSizeChange={templates.pagination.onChange}
        />
        <Radio.Group onChange={onRadioChange} className="ml-auto space-x-2" defaultValue={rowSize} buttonStyle="solid">
          <Radio.Button className="rounded-sm" value={3}>
            3
          </Radio.Button>
          <Radio.Button className="rounded-sm" value={4}>
            4
          </Radio.Button>
          <Radio.Button className="rounded-sm" value={6}>
            6
          </Radio.Button>
        </Radio.Group>
      </div>
      <div className="flex flex-wrap gap-2 p-1 mx-auto ">
        {templates.loading ? <Loading /> : renderTemplates(templates.data.list)}
      </div>
    </>
  )
}

export default ProductList
