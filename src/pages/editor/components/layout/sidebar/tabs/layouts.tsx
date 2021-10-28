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

const Layouts: React.FC<Props> = ({ loading, setDragStart, layoutGroups }) => {
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
            // <Panel header={`${group.count} photos`} key={`parent-${j}`}>
            //   <Tabs defaultActiveKey="0">
            //     <div
            //       style={{
            //         display: 'flex',
            //         flexFlow: 'wrap',
            //         justifyContent: 'space-between',
            //       }}
            //     >
            //       {group.layouts
            //         .reduce(
            //           (acc, layout: LayoutInterface, k) => {
            //             if (layout.types.length === 2) {
            //               acc[2].layouts.push(layout)
            //             } else {
            //               acc.find((item) => item.type === layout.types[0])?.layouts.push(layout)
            //             }
            //             return acc
            //           },
            //           [
            //             { type: 'whole-page', layouts: [] },
            //             { type: 'single-page', layouts: [] },
            //             { type: 'both', layouts: [] },
            //           ] as any[]
            //         )
            //         .reduce((acc, item) => {
            //           if (item.layouts.length > 0) acc.push(item)
            //           return acc
            //         }, [] as any[])
            //         .map(({ type, layouts: _layouts }: any, index: number) => (
            //           <TabPane tab={type} tabKey={`${index}`} key={`${index}`}>
            //             {_layouts.map((layout: LayoutInterface, k: number) => (
            //               <div
            //                 className="Layout"
            //                 draggable
            //                 onDragStart={(e) =>
            //                   dragStart(e, {
            //                     count: group.count,
            //                     index: layout.index,
            //                     objects: layout.objects,
            //                   })
            //                 }
            //                 onDragEnd={onDragEnd}
            //                 key={`group${layout.count}${k}${j}`}
            //               >
            //                 {layout.objects?.map((object: LayoutObject, i) => {
            //                   const { top, left, width, height } = object
            //                   return (
            //                     <div
            //                       className="LayoutObject"
            //                       key={`layout${layout.count}${k}${i}${j}`}
            //                       style={{
            //                         top: `${top}%`,
            //                         left: `${left}%`,
            //                         width: `${width}%`,
            //                         height: `${height}%`,
            //                       }}
            //                     />
            //                   )
            //                 })}
            //               </div>
            //             ))}
            //           </TabPane>
            //         ))}
            //     </div>
            //   </Tabs>
            // </Panel>
            <Panel header={`${group.count} photos`} key={`parent-${j}`}>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {group.layouts.map((layout: LayoutInterface, k) => (
                  <div className="flex flex-col" key={`group${layout.count}${k}${j}`}>
                    <div
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
                    <span className="flex gap-1 justify-center text-xs font-light">{layout.types.join(' / ')}</span>
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

export default Layouts
