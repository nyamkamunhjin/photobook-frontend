/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable func-names */

import React, { ReactElement } from 'react'
import { DragDropContext, Droppable, DroppableProvided, DroppableStateSnapshot, DropResult } from 'react-beautiful-dnd'
import { ListManagerItem } from './ListManagerItem'

const hash = require('object-hash')

interface Location {
  id: string
  index: number
}

export interface DragAndDropResult {
  source: Location
  destination: Location
}

export interface Chunk {
  id: string
  items: any[]
}

export interface Props {
  chunks: Chunk[]
  direction: 'horizontal' | 'vertical'
  render(item: any, index: number): ReactElement<{}>
  maxItems?: number
  onDragEnd(result: DragAndDropResult): void
}

const horizontalStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
}

export const DragAndDropWrapper: React.StatelessComponent<Props> = ({
  onDragEnd,
  chunks,
  direction,
  maxItems,
  render,
}: Props) => {
  const max = maxItems ? maxItems : 0
  return (
    <DragDropContext onDragEnd={mapAndInvoke(onDragEnd)}>
      {chunks.map(({ id: droppableId, items }: Chunk, i) => (
        <Droppable key={droppableId} droppableId={droppableId} direction={direction}>
          {(provided: DroppableProvided, _: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              style={direction === 'horizontal' ? horizontalStyle : undefined}
              {...provided.droppableProps}
            >
              {items.map((item: any, index: number) => (
                <ListManagerItem
                  key={hash(item)}
                  item={item}
                  index={index}
                  secondaryIndex={index + i * max}
                  render={render}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  )
}

function mapAndInvoke(onDragEnd: (result: DragAndDropResult) => void) {
  return function ({ source, destination }: DropResult): void {
    if (destination !== undefined && destination !== null) {
      const result: DragAndDropResult = {
        source: {
          id: source.droppableId,
          index: source.index,
        },
        destination: {
          id: destination.droppableId,
          index: destination.index,
        },
      }
      onDragEnd(result)
    }
  }
}
