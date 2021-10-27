/* eslint-disable use-isnan */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useRef, useState } from 'react'
import { MdFlip, MdDelete } from 'react-icons/md'
import { AiOutlineColumnHeight, AiOutlineColumnWidth, AiOutlineRotateLeft, AiOutlineRotateRight } from 'react-icons/ai'
import { GiResize } from 'react-icons/gi'
import { MoveResizerInterface, ObjectType, PObject } from 'interfaces'
import { ReactComponent as Down } from 'assets/icons/down.svg'
import { ReactComponent as Up } from 'assets/icons/up.svg'
import { InputNumber, Tooltip } from 'antd'
import { FormattedMessage } from 'react-intl'
import { useDebounceFn } from 'ahooks'
import Button from 'components/button'
import { UPDATE_OBJECT } from 'redux/actions/types'
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
  groupObjects?: PObject[]
  index: number
  updateObject: (props: { object: PObject }) => void
  updateHistory: (historyType: string, props: any) => void
  removeImageFromObject?: () => void
  removeFrameFromObject?: () => void
  removeFrameMaskFromObject?: () => void
  removeMaskFromObject?: () => void
  rotateLeftObject?: () => void
  rotateRightObject?: () => void
  flipObject?: () => void
  removeObject?: () => void
  sendBackward?: () => void
  sendForward?: () => void
  moveResizers?: (move: MoveResizerInterface) => void
  isLayout?: boolean
  imageFit?: (borderWidth: number, o: PObject) => void
  getImagePosition: (o: PObject) => void
}
const Toolbar: React.FC<Props> = ({
  removeImageFromObject,
  removeFrameFromObject,
  removeFrameMaskFromObject,
  removeMaskFromObject,
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
  groupObjects,
  index,
  zoom,
  isLayout = false,
  imageFit,
  getImagePosition,
}) => {
  const widthRef = useRef<HTMLInputElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const [showSize, setShowSize] = useState(false)

  const changeSize = useDebounceFn(
    () => {
      if (!groupObjects || Object.keys(groupObjects).length === 0 || !widthRef.current || !heightRef.current) return
      const _width = parseFloat(widthRef.current.value)
      const _height = parseFloat(heightRef.current.value)

      if ((_width === 100 && _height === 100) || _width === NaN || _height === NaN) return
      const _widthRatio = _width / 100
      const _heightRatio = _height / 100

      Object.values(groupObjects)
        .map((item) => objects.find((o) => o.id === item.id))
        .forEach((_object: PObject | undefined) => {
          if (!_object || !_object.props.className.includes('image-placeholder')) return
          updateObject({
            object: {
              ..._object,
              style: {
                ..._object.style,
                width: parseFloat(_object.style.width + '') * _widthRatio + 'px',
                height: parseFloat(_object.style.height + '') * _heightRatio + 'px',
              },
            },
          })
          updateHistory(UPDATE_OBJECT, { object: getImagePosition(_object) })

          if (!imageFit) return
          imageFit(parseFloat(_object.props.frameStyle?.borderWidth || '0'), _object)
        })
      widthRef.current.value = '100%'
      heightRef.current.value = '100%'
    },
    { wait: 1000 }
  )

  return (
    <div className="toolbar">
      {!groupObjects || Object.keys(groupObjects).length === 0 ? (
        <>
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
              removeFrameFromObject={removeFrameFromObject}
              removeFrameMaskFromObject={removeFrameMaskFromObject}
              removeMaskFromObject={removeMaskFromObject}
              imageFit={imageFit}
              getImagePosition={getImagePosition}
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
          {sendBackward && (
            <Tooltip placement="top" title={<FormattedMessage id="toolbox.backward" />}>
              <span onClick={sendBackward} className="toolbar-icon">
                <Down width={17} />
              </span>
            </Tooltip>
          )}
          {sendForward && (
            <Tooltip placement="top" title={<FormattedMessage id="toolbox.forward" />}>
              <span onClick={sendForward} className="toolbar-icon">
                <Up width={17} />
              </span>
            </Tooltip>
          )}
          {removeObject && (
            <Tooltip placement="top" title={<FormattedMessage id="toolbox.delete" />}>
              <span onClick={removeObject} className="toolbar-icon">
                <MdDelete />
              </span>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          <Tooltip placement="top" title={<FormattedMessage id="toolbox.size" />}>
            <span
              onClick={() => {
                setShowSize(!showSize)
              }}
              className="toolbar-icon"
            >
              <GiResize />
            </span>
          </Tooltip>
          <div style={{ display: showSize ? 'flex' : 'none' }}>
            <span className="toolbar-icon">
              <AiOutlineColumnWidth style={{ fontSize: 18, marginRight: 4 }} />
              <InputNumber
                formatter={(value) => `${value}%`}
                // parser={(value) => Number(value?.replaceAll('%', ''))}
                step={1}
                ref={widthRef}
                defaultValue={100}
                min={50}
                width={30}
                max={200}
                size="small"
              />
            </span>
            <span className="toolbar-icon">
              <AiOutlineColumnHeight style={{ fontSize: 18, marginRight: 4 }} />
              <InputNumber
                formatter={(value) => `${value}%`}
                // parser={(value) => Number(value?.replaceAll('%', ''))}
                step={1}
                min={50}
                ref={heightRef}
                defaultValue={100}
                width={30}
                max={200}
                size="small"
              />
            </span>
            <Button onClick={changeSize.run}>
              <FormattedMessage id="change.size" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Toolbar
