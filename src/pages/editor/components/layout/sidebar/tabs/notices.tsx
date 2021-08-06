import React from 'react'

interface Props {
  notices: any[]
}

const EmptySlot: React.FC<{ data: any }> = ({ data: { onGoto, onHideAllSimilar, onHideThis, slide } }) => {
  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-md bg-yellow-500" />
        <h6 className="text-sm text-gray-500 font-normal">Empty photo slot</h6>
      </div>
      <p className="text-xs text-gray-400 font-normal">
        {`At least one of the photo slots on ${slide} is empty. Would you like to add some photos there?`}
      </p>
      <div className="flex gap-2">
        {/* <a className="flex-1 text-xs text-gray-500 font-normal underline" href="#" onClick={onGoto}>
          Go to
        </a> */}
        <a className="flex-1 text-xs text-gray-500 font-normal underline" href="#" onClick={onHideAllSimilar}>
          Hide all similar
        </a>
        <a className="text-xs text-gray-500 font-normal underline" href="#" onClick={onHideThis}>
          Hide this
        </a>
      </div>
    </div>
  )
}

const EmptyText: React.FC<{ data: any }> = ({ data: { onGoto, onHideAllSimilar, onHideThis, slide } }) => {
  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-md bg-yellow-500" />
        <h6 className="text-sm text-gray-500 font-normal">Empty text slot</h6>
      </div>
      <p className="text-xs text-gray-400 font-normal">
        {`At least one of the text slots on ${slide} is empty. Would you like to add some texts there?`}
      </p>
      <div className="flex gap-2">
        {/* <a className="flex-1 text-xs text-gray-500 font-normal underline" href="#" onClick={onGoto}>
          Go to
        </a> */}
        <a className="flex-1 text-xs text-gray-500 font-normal underline" href="#" onClick={onHideAllSimilar}>
          Hide all similar
        </a>
        <a className="text-xs text-gray-500 font-normal underline" href="#" onClick={onHideThis}>
          Hide this
        </a>
      </div>
    </div>
  )
}

const Notices: React.FC<Props> = ({ notices }) => {
  return (
    <>
      <h6 className="p-4 text-gray-500 text-sm font-normal leading-normal">
        There are <span className="text-yellow-500 font-semibold">{notices.length}</span> remarks worth of your
        attention:
      </h6>
      {notices.map(({ type, key, data }) => {
        switch (type) {
          case 'empty slot':
            return <EmptySlot data={data} key={key} />
          case 'empty text':
            return <EmptyText data={data} key={key} />
          default:
            return <div>123</div>
        }
      })}
    </>
  )
}

export default Notices
