import React from 'react'
import Spinner from 'components/spinner'
import { Collapse } from 'antd'
import { Image, ImageCategory } from 'interfaces'

interface Props {
  loading: boolean
  categories: ImageCategory[]
}
const { Panel } = Collapse

const Cliparts: React.FC<Props> = ({ loading, categories }) => {
  const dragStart = (e: any, tempUrl: any, imageUrl: any) => {
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
    e.dataTransfer.setData('naturalWidth', e.target.naturalWidth)
    e.dataTransfer.setData('naturalHeight', e.target.naturalHeight)
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
                {category.images.map((image: Image) => (
                  <div className="ImageContainer" key={`${image.imageUrl}`}>
                    <img
                      draggable
                      onDragStart={(e) => dragStart(e, image.tempUrl, image.imageUrl)}
                      alt={image.tempUrl}
                      src={image.tempUrl}
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

export default Cliparts
