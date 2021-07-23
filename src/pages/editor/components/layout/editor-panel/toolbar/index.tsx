/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-access-key */
import React from 'react'
import { MdFlip, MdDelete } from 'react-icons/md'
import { AiOutlineRotateLeft, AiOutlineRotateRight } from 'react-icons/ai'
import { MoveResizerInterface, ObjectType, PObject } from 'interfaces'
import { ReactComponent as Down } from 'assets/icons/down.svg'
import { ReactComponent as Up } from 'assets/icons/up.svg'
import { Tooltip } from 'antd'
import { FormattedMessage } from 'react-intl'
import TextToolbar from './text-toolbar'
import ImageToolbar from './image-toolbar'
import ShapeToolbar from './shape-toolbar'

interface Props {
  objectType?: ObjectType
  object: HTMLDivElement
  zoom?: {
    state: number
    action: Function
  }
  objects: PObject[]
  index: number
  updateObject: (props: { object: PObject }) => void
  updateHistory: (historyType: string, props: any) => void
  removeImageFromObject?: () => void
  rotateLeftObject?: () => void
  rotateRightObject?: () => void
  flipObject?: () => void
  removeObject: () => void
  sendBackward: () => void
  sendForward: () => void
  moveResizers: (move: MoveResizerInterface) => void
  isLayout?: boolean
}
const Toolbar: React.FC<Props> = ({
  removeImageFromObject,
  rotateRightObject,
  rotateLeftObject,
  updateHistory,
  updateObject,
  moveResizers,
  removeObject,
  sendBackward,
  sendForward,
  flipObject,
  objectType,
  object,
  objects,
  index,
  zoom,
  isLayout = false,
}) => {
  return (
    <div className="toolbar">
      {objectType === 'text' && !isLayout && (
        <TextToolbar
          moveResizers={moveResizers}
          object={object}
          objectType={objectType}
          index={index}
          objects={objects}
          updateObject={updateObject}
          updateHistory={updateHistory}
        />
      )}
      {objectType === 'image' && !isLayout && (
        <ImageToolbar
          index={index}
          object={object}
          objects={objects}
          zoom={zoom}
          updateObject={updateObject}
          updateHistory={updateHistory}
          removeImageFromObject={removeImageFromObject}
        />
      )}
      {objectType === 'shape' && (
        <ShapeToolbar
          object={object}
          objectType={objectType}
          index={index}
          objects={objects}
          updateObject={updateObject}
          updateHistory={updateHistory}
        />
      )}
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
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.backward" />}>
        <span onClick={sendBackward} className="toolbar-icon">
          <Down width={17} />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.forward" />}>
        <span onClick={sendForward} className="toolbar-icon">
          <Up width={17} />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.delete" />}>
        <span onClick={removeObject} className="toolbar-icon">
          <MdDelete />
        </span>
      </Tooltip>
    </div>
  )
}

export default Toolbar
