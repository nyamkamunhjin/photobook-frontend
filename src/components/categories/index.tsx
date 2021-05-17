import { Menu } from 'antd'
import SubMenu from 'antd/lib/menu/SubMenu'
import React, { FC } from 'react'
import { Category } from 'interfaces'
import { Loading } from '..'

interface Props {
  onMenuClick: (value: any) => void
  categories: any
  selectedCategory: string
}

const recursiveMenuGenerator: (categories: Category[], subCategories?: number[]) => any = (
  categories,
  subCategories = []
) => {
  return categories.flatMap((category) => {
    if (category.categories && Array.isArray(category.categories) && category.categories?.length > 0) {
      if (!subCategories.includes(category.id)) {
        subCategories.push(category.id)
        return (
          <SubMenu key={category.id} title={category.name}>
            {recursiveMenuGenerator(category.categories, subCategories)}
          </SubMenu>
        )
      }
      return []
    }

    if (!subCategories.includes(category.id)) {
      subCategories.push(category.id)
      return <Menu.Item key={category.id}>{category.name}</Menu.Item>
    }
    return []
  })
}

const ProductCategories: FC<Props> = ({ onMenuClick, categories, selectedCategory }) => {
  return categories.loading ? (
    <Loading />
  ) : (
    <Menu
      mode="inline"
      defaultOpenKeys={['1']}
      defaultSelectedKeys={[selectedCategory.toString()]}
      onClick={onMenuClick}
    >
      <Menu.Item key="all">All categories</Menu.Item>
      {recursiveMenuGenerator(categories.data.list)}
    </Menu>
  )
}

export default ProductCategories
