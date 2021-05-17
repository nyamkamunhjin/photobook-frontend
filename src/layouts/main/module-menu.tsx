import { MailOutlined } from '@ant-design/icons'
import { Layout, Menu, Row } from 'antd'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { RootInterface } from 'interfaces'

const { SubMenu } = Menu

const ModuleMenu: React.FC<unknown> = () => {
  const router = useHistory()
  const dispatch = useDispatch()
  const { collapse } = useSelector((state: RootInterface) => state.settings)
  return (
    <Layout.Sider
      breakpoint="xl"
      collapsedWidth="0"
      theme="light"
      collapsed={collapse}
      trigger={null}
      onCollapse={(value) => {
        dispatch({ type: 'COLLAPSE', collapse: value })
      }}
    >
      <Row justify="center" className="my-3">
        <img src="/logo.svg" alt="logo" draggable={false} />
      </Row>
      <Menu mode="inline" style={{ borderRightWidth: 0 }}>
        <>
          <SubMenu key="categories" icon={<MailOutlined />} title={<FormattedMessage id="categories" />}>
            <Menu.Item
              key="layout"
              onClick={() => {
                router.push('/category/layout')
              }}
            >
              <FormattedMessage id="layouts" />
            </Menu.Item>
            <Menu.Item
              key="template"
              onClick={() => {
                router.push('/category/template')
              }}
            >
              <FormattedMessage id="template" />
            </Menu.Item>
            <Menu.Item
              key="frame"
              onClick={() => {
                router.push('/category/frame')
              }}
            >
              <FormattedMessage id="frame" />
            </Menu.Item>
            <Menu.Item
              key="mask"
              onClick={() => {
                router.push('/category/mask')
              }}
            >
              <FormattedMessage id="mask" />
            </Menu.Item>
            <Menu.Item
              key="clipart"
              onClick={() => {
                router.push('/category/clipart')
              }}
            >
              <FormattedMessage id="clipart" />
            </Menu.Item>
            <Menu.Item
              key="background"
              onClick={() => {
                router.push('/category/background')
              }}
            >
              <FormattedMessage id="background" />
            </Menu.Item>
          </SubMenu>
          <SubMenu key="material" icon={<MailOutlined />} title={<FormattedMessage id="material" />}>
            <Menu.Item
              key="material_binding_type"
              onClick={() => {
                router.push('/material/binding-type')
              }}
            >
              <FormattedMessage id="binding_type" />
            </Menu.Item>
            <Menu.Item
              key="material_paper_size"
              onClick={() => {
                router.push('/material/paper-size')
              }}
            >
              <FormattedMessage id="paper_size" />
            </Menu.Item>
            <Menu.Item
              key="material_paper_material"
              onClick={() => {
                router.push('/material/paper-material')
              }}
            >
              <FormattedMessage id="paper_material" />
            </Menu.Item>
            <Menu.Item
              key="material_cover_material"
              onClick={() => {
                router.push('/material/cover-material')
              }}
            >
              <FormattedMessage id="cover_material" />
            </Menu.Item>
            <Menu.Item
              key="material_cover_type"
              onClick={() => {
                router.push('/material/cover-type')
              }}
            >
              <FormattedMessage id="cover_type" />
            </Menu.Item>
            <Menu.Item
              key="material_frame_material"
              onClick={() => {
                router.push('/material/frame-material')
              }}
            >
              <FormattedMessage id="frame_material" />
            </Menu.Item>
            <Menu.Item
              key="material_cover_material_color"
              onClick={() => {
                router.push('/material/cover-material-color')
              }}
            >
              <FormattedMessage id="cover_material_color" />
            </Menu.Item>
          </SubMenu>
          <SubMenu key="files" icon={<MailOutlined />} title={<FormattedMessage id="files" />}>
            <Menu.Item
              key="files_layout"
              onClick={() => {
                router.push('/files/layout')
              }}
            >
              <FormattedMessage id="layouts" />
            </Menu.Item>
            <Menu.Item
              key="files_frame"
              onClick={() => {
                router.push('/files/frame')
              }}
            >
              <FormattedMessage id="frame" />
            </Menu.Item>
            <Menu.Item
              key="files_mask"
              onClick={() => {
                router.push('/files/mask')
              }}
            >
              <FormattedMessage id="mask" />
            </Menu.Item>
            <Menu.Item
              key="files_clipart"
              onClick={() => {
                router.push('/files/clipart')
              }}
            >
              <FormattedMessage id="clipart" />
            </Menu.Item>
            <Menu.Item
              key="files_background"
              onClick={() => {
                router.push('/files/background')
              }}
            >
              <FormattedMessage id="background" />
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            icon={<MailOutlined />}
            key="templates"
            onClick={() => {
              router.push('/templates')
            }}
          >
            <FormattedMessage id="templates" />
          </Menu.Item>
          <Menu.Item
            icon={<MailOutlined />}
            key="editor"
            onClick={() => {
              router.push('/photobook')
            }}
          >
            <FormattedMessage id="editor" />
          </Menu.Item>
        </>
      </Menu>
    </Layout.Sider>
  )
}

export default ModuleMenu
