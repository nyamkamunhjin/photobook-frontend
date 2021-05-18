/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement } from 'react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'

const hash = require('object-hash')

export interface ListManagerItemProps {
  item: any
  index: number
  secondaryIndex: number
  render(item: any, index: number): ReactElement<{}>
}

export const ListManagerItem: React.StatelessComponent<ListManagerItemProps> = ({
  item,
  index,
  secondaryIndex,
  render,
}: ListManagerItemProps) => (
  <Draggable draggableId={hash(item)} index={index}>
    {(provided: DraggableProvided, _: DraggableStateSnapshot) => (
      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        {render(item, secondaryIndex)}
      </div>
    )}
  </Draggable>
)
