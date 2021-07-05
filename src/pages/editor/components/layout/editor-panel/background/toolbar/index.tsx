/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-access-key */
import React from 'react'
import { MdFlip, MdDelete } from 'react-icons/md'
import { AiOutlineRotateLeft, AiOutlineRotateRight } from 'react-icons/ai'
import { BackgroundImage, HistoryProps, ObjectType, PObject } from 'interfaces'
import { Tooltip } from 'antd'
import { FormattedMessage } from 'react-intl'
import ShapeToolbar from './shape-toolbar'

interface Props {
  background: string
  backgrounds: BackgroundImage[]
  setBackgrounds: (backgrounds: BackgroundImage[]) => void
  rotateLeftObject?: () => void
  rotateRightObject?: () => void
  flipObject?: () => void
  removeObject: () => void
}
const Toolbar: React.FC<Props> = ({
  rotateRightObject,
  rotateLeftObject,
  removeObject,
  flipObject,
  setBackgrounds,
  background,
  backgrounds,
}) => {
  return (
    <div className="backgroundToolbar">
      <ShapeToolbar background={background} setBackgrounds={setBackgrounds} backgrounds={backgrounds} />
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
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.flit" />}>
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
