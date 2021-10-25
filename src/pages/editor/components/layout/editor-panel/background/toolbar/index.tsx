/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-access-key */
import React from 'react'
import { MdFlip, MdDelete } from 'react-icons/md'
import { AiOutlineRotateLeft, AiOutlineRotateRight } from 'react-icons/ai'
import { BackgroundImage } from 'interfaces'
import { Tooltip } from 'antd'
import { FormattedMessage } from 'react-intl'
import { VscZoomIn, VscZoomOut } from 'react-icons/vsc'
import ShapeToolbar from './shape-toolbar'

interface Props {
  background: string
  backgrounds: BackgroundImage[]
  setBackgrounds: (backgrounds: BackgroundImage[]) => void
  rotateLeftObject?: () => void
  rotateRightObject?: () => void
  zoomIn?: () => void
  zoomOut?: () => void
  flipObject?: () => void
  removeObject: () => void
}
const Toolbar: React.FC<Props> = ({
  rotateRightObject,
  rotateLeftObject,
  removeObject,
  flipObject,
  zoomIn,
  zoomOut,
  setBackgrounds,
  background,
  backgrounds,
}) => {
  const bg = backgrounds.find((item) => item.className === background)
  const hasImage = bg && bg.src ? bg.src.length > 0 : false

  return (
    <div className="backgroundToolbar">
      <ShapeToolbar background={background} setBackgrounds={setBackgrounds} backgrounds={backgrounds} />
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.zoomIn" />}>
        <span onClick={zoomIn} className={`toolbar-icon ${!hasImage && 'inactive'}`}>
          <VscZoomIn />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.zoomOut" />}>
        <span onClick={zoomOut} className={`toolbar-icon ${!hasImage && 'inactive'}`}>
          <VscZoomOut />
        </span>
      </Tooltip>
      {rotateLeftObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.left" />}>
          <div onClick={rotateLeftObject} className="toolbar-icon">
            <AiOutlineRotateLeft />
          </div>
        </Tooltip>
      )}
      {rotateRightObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.left" />}>
          <span onClick={rotateRightObject} className="toolbar-icon">
            <AiOutlineRotateRight />
          </span>
        </Tooltip>
      )}
      {flipObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.flip" />}>
          <span onClick={flipObject} className="toolbar-icon">
            <MdFlip />
          </span>
        </Tooltip>
      )}
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.delete" />}>
        <span onClick={removeObject} className="toolbar-icon">
          <MdDelete />
        </span>
      </Tooltip>
    </div>
  )
}

export default Toolbar
