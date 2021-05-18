import React from 'react'

interface Props {
  resize1: any
  resize2: any
  resize3: any
  resize4: any
  resize5: any
  resize6: any
  resize7: any
  resize8: any
}

const Resizers = React.forwardRef<HTMLButtonElement, Props>(
  ({ resize1, resize2, resize3, resize4, resize5, resize6, resize7, resize8 }) => {
    return (
      <div>
        <div ref={resize1} id="resize-1" hidden className="resize-top-left handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize2} id="resize-2" hidden className="resize-top-middle handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize3} id="resize-3" hidden className="resize-top-right handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize4} id="resize-4" hidden className="resize-middle-right handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize5} id="resize-5" hidden className="resize-bottom-right handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize6} id="resize-6" hidden className="resize-bottom-middle handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize7} id="resize-7" hidden className="resize-bottom-left handle">
          <div className="resize-icon"></div>
        </div>
        <div ref={resize8} id="resize-8" hidden className="resize-middle-left handle">
          <div className="resize-icon"></div>
        </div>
      </div>
    )
  }
)

export default Resizers
