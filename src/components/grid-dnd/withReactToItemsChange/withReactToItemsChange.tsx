/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/destructuring-assignment */
import React from 'react'

const hash = require('object-hash')

export interface Props {
  items: any[]
}

export const withReactToItemsChange =
  <P extends Props>(Component: React.ComponentType<P>): React.ComponentType<P> =>
  (props: P) =>
    <Component key={hash(props.items)} {...props} />
