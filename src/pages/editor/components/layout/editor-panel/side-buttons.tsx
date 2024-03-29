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
import { FaPortrait, FaRegCircle } from 'react-icons/fa'
import { Popover, Button } from 'antd'
import { LayoutsInterface, Project } from 'interfaces'
import { useRequest } from 'ahooks'
import { listPaperSize } from 'api'
import SlideSettings from './settings'

interface Props {
  type: 'photobook' | 'canvas' | 'photo' | 'frame'
  createImage?: (e: unknown) => void
  createText?: (e: unknown) => void
  createSquare?: (e: unknown) => void
  createEclipse?: (e: unknown) => void
  createMontagePortrait?: (e: unknown) => void
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
  currentProject?: Project
  slideIndex?: number
  paperSizes?: any
}

const SideButtons: React.FC<Props> = ({
  createImage,
  createText,
  createSquare,
  createEclipse,
  createMontagePortrait,
  changeLayout,
  type = 'photobook',
  layout,
  layouts,
  settings = true,
  currentProject,
  slideIndex,
  paperSizes,
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
            <FaRegCircle style={{ fontSize: 24 }} />
            <FormattedMessage id="eclipse" />
          </div>
        )}
        {createMontagePortrait && (
          <div hidden={!createMontagePortrait} onClick={createMontagePortrait} className="item">
            <FaPortrait style={{ fontSize: 24 }} />
            <FormattedMessage id="montage" />
          </div>
        )}
        {settings && paperSizes && !paperSizes.loading && (
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
      <div
        className={
          currentProject &&
          ['photobook', 'montage'].includes(currentProject.templateType?.name + '') &&
          ((slideIndex === 0 && !currentProject.coverEditable) || slideIndex === 1)
            ? 'invisible left-sidebuttons'
            : 'left-sidebuttons'
        }
      >
        {renderButtons('left')}
      </div>
      <div
        className={
          currentProject &&
          ['photobook', 'montage'].includes(currentProject.templateType?.name + '') &&
          ((slideIndex === 0 && !currentProject.coverEditable) || slideIndex === currentProject.slides.length - 1)
            ? 'invisible right-sidebuttons'
            : 'right-sidebuttons'
        }
      >
        {renderButtons('right')}
      </div>
      {paperSizes && slideIndex && currentProject && !paperSizes.loading && (
        <SlideSettings
          setSettingsVisible={setSettingsVisible}
          settingsVisible={settingsVisible}
          paperSizes={paperSizes.data.list}
          slideIndex={slideIndex}
          currentProject={currentProject}
        />
      )}
    </div>
  )
}

export default SideButtons
