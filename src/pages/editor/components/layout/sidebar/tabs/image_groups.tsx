/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import { Collapse, Tabs } from 'antd'
import Spinner from 'components/spinner'
import { listLayout } from 'api'
import { LayoutInterface, LayoutObject, LayoutResponse, LayoutsInterface } from 'interfaces'
import { useRequest } from 'ahooks'
import lodash from 'lodash'

const { Panel } = Collapse
const { TabPane } = Tabs

interface Props {
  loading: boolean
  setDragStart: any
  layoutGroups: any
}

const ImageGroups: React.FC<Props> = ({ loading, setDragStart, layoutGroups }) => {
  const [layouts, setLayouts] = useState<LayoutsInterface[]>([])
  useRequest<LayoutResponse>(listLayout, {
    onSuccess: ({ data }) => {
      const changes = lodash
        .chain(data)
        .groupBy('layoutCategories[0].name')
        .map<LayoutsInterface>((value, key) => {
          return { count: key, layouts: value }
        })
        .value()
      setLayouts(changes)
    },
  })
  const dragStart = (e: any, layout: any) => {
    setDragStart(true)
    e.dataTransfer.setData('layout', JSON.stringify(layout))
  }
  const onDragEnd = () => {
    setDragStart(false)
  }

  return loading ? (
    <div className="Layouts">
      <Spinner />
    </div>
  ) : (
    <div className="Images">
      <div className="Layouts">
        <Collapse defaultActiveKey={[4]} style={{ width: '100%' }}>
          {[...layoutGroups, ...layouts].map((group: LayoutsInterface, j) => (
            <Panel header={`${group.count} photos`} key={`parent-${j}`}>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {group.layouts.map((layout: LayoutInterface, k) => (
                  <div
                    key={`group${layout.count}${k}${j}`}
                    className="Layout"
                    draggable
                    onDragStart={(e) =>
                      dragStart(e, {
                        count: group.count,
                        index: layout.index,
                        objects: layout.objects,
                        types: layout.types,
                      })
                    }
                    onDragEnd={onDragEnd}
                  >
                    {layout.objects?.map((object: LayoutObject, i) => {
                      const { top, left, width, height } = object
                      return (
                        <div
                          className="LayoutObject"
                          key={`layout${layout.count}${k}${i}${j}`}
                          style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  )
}

export default ImageGroups
