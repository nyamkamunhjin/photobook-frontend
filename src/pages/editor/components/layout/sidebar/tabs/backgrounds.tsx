import React from 'react'
import Spinner from 'components/spinner'
import { Button, Collapse } from 'antd'
import { Image, ImageCategory } from 'interfaces'
import { FormattedMessage } from 'react-intl'

interface Props {
  loading: boolean
  categories: ImageCategory[]
  backgroundEdit: boolean
  setDragStart: (dragStart: boolean) => void
  setBackgroundEdit: (backgroundEdit: boolean) => void
}

const { Panel } = Collapse

const Backgrounds: React.FC<Props> = ({ loading, categories, backgroundEdit, setDragStart, setBackgroundEdit }) => {
  const onDragStart = (e: any, tempUrl: string, imageUrl: string) => {
    setDragStart(true)
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
  }

  const onDragEnd = () => {
    setDragStart(false)
  }
  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="ImportedPhotos" style={{ marginBottom: 45 }}>
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
                      onDragStart={(e) => onDragStart(e, image.tempUrl, image.imageUrl)}
                      onDragEnd={onDragEnd}
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
      {backgroundEdit ? (
        <Button
          type="primary"
          onClick={() => setBackgroundEdit(false)}
          style={{ margin: 5, position: 'absolute', bottom: 0, width: 280 }}
        >
          <FormattedMessage id="done" />
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => setBackgroundEdit(true)}
          style={{ margin: 5, position: 'absolute', bottom: 0, width: 280 }}
        >
          <FormattedMessage id="edit_background" />
        </Button>
      )}
    </div>
  )
}

export default Backgrounds
