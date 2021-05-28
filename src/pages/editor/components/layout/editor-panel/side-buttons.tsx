/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState } from 'react'
import {
  BorderOutlined,
  FontColorsOutlined,
  LayoutOutlined,
  MinusOutlined,
  PictureOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { FormattedMessage } from 'react-intl'
import { Popover, Button } from 'antd'
import { LayoutsInterface } from 'interfaces'
import SlideSettings from './settings'

interface Props {
  createImage: (e: unknown) => void
  createText?: () => void
  createSquare?: () => void
  createEclipse?: () => void
  changeLayout?: (align: string, type: string) => void
  layout?: {
    left: {
      count: number
      index: number
    }
    right: {
      count: number
      index: number
    }
  }
  layouts?: LayoutsInterface[]
  settings?: boolean
}

const SideButtons: React.FC<Props> = ({
  createImage,
  createText,
  createSquare,
  createEclipse,
  changeLayout,
  layout,
  layouts,
  settings = true,
}) => {
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false)

  const layoutStyle = {
    margin: 5,
  }

  const layoutButtons = (align: string) => {
    if (changeLayout && layout && layouts)
      return (
        <div>
          <Button
            disabled={align === 'left' ? layout.left.count <= 1 : layout.right.count <= 1}
            icon={<MinusOutlined />}
            onClick={() => changeLayout(align, 'less')}
            style={layoutStyle}
          >
            <FormattedMessage id="less" />
          </Button>
          <Button
            disabled={align === 'left' ? layout.left.count === layouts.length : layout.right.count === layouts.length}
            icon={<PlusOutlined />}
            onClick={() => changeLayout(align, 'more')}
            style={layoutStyle}
          >
            <FormattedMessage id="more" />
          </Button>
          <Button
            disabled={align === 'left' ? layout.left.count < 1 : layout.right.count < 1}
            icon={<LayoutOutlined />}
            onClick={() => changeLayout(align, 'shuffle')}
            style={layoutStyle}
          >
            <FormattedMessage id="shuffle" />
          </Button>
        </div>
      )
    return <></>
  }

  const renderButtons = (align: string) => {
    return (
      <>
        {createText && (
          <div hidden={!createText} onClick={createText} className="item">
            <FontColorsOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="text" />
          </div>
        )}
        {createImage && (
          <div hidden={!createImage} onClick={createImage} className="item">
            <PictureOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="photo" />
          </div>
        )}
        {changeLayout && (
          <Popover content={layoutButtons(align)} className="item">
            <LayoutOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="layout" />
          </Popover>
        )}
        {createSquare && (
          <div hidden={!createSquare} onClick={createSquare} className="item">
            <BorderOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="square" />
          </div>
        )}
        {createEclipse && (
          <div hidden={!createEclipse} onClick={createEclipse} className="item">
            <BorderOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="eclipse" />
          </div>
        )}
        {settings && (
          <div onClick={() => setSettingsVisible(true)} className="item">
            <SettingOutlined style={{ fontSize: 24 }} />
            <FormattedMessage id="settings" />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="side-buttons">
      <div>{renderButtons('left')}</div>
      <div>{renderButtons('right')}</div>
      <SlideSettings setSettingsVisible={setSettingsVisible} settingsVisible={settingsVisible} />
    </div>
  )
}

export default SideButtons
