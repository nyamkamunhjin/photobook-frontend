import React from 'react'
import Spinner from 'components/spinner'
import { Collapse } from 'antd'
import { FrameMask, ImageCategory } from 'interfaces'
import { url } from 'inspector'

interface Props {
  loading: boolean
  categories: ImageCategory[]
}

const { Panel } = Collapse

const FrameMasks: React.FC<Props> = ({ loading, categories }) => {
  const dragStart = (e: any, tempFrameUrl: any, frameUrl: any, tempMaskUrl: any, maskUrl: any) => {
    e.dataTransfer.setData('tempFrameUrl', tempFrameUrl)
    e.dataTransfer.setData('frameUrl', frameUrl)
    e.dataTransfer.setData('tempMaskUrl', tempMaskUrl)
    e.dataTransfer.setData('maskUrl', maskUrl)
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="ImportedPhotos">
        <Collapse defaultActiveKey={[4]} style={{ width: '100%' }}>
          {categories.map((category: ImageCategory) => (
            <Panel header={category.name} key={`cparent-${category.id}`}>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {category.frameMasks?.map((frameMask: FrameMask) => (
                  <div
                    className="ImageContainer bg-cover bg-no-repeat bg-center"
                    key={`frameUrl${frameMask.frameUrl}+maskUrl${frameMask.maskUrl}`}
                    style={{ backgroundImage: `url('${frameMask.tempMaskUrl}')` }}
                  >
                    <img
                      draggable
                      onDragStart={(e) =>
                        dragStart(
                          e,
                          frameMask.tempFrameUrl,
                          frameMask.frameUrl,
                          frameMask.tempMaskUrl,
                          frameMask.maskUrl
                        )
                      }
                      alt={frameMask.tempFrameUrl}
                      src={frameMask.tempFrameUrl}
                      className="w-full h-full"
                    />
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

export default FrameMasks
