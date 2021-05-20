/* eslint @typescript-eslint/no-explicit-any: off */
import useRequest from '@ahooksjs/use-request'
import { Button, Checkbox, Grid, Modal, Radio, Select, Spin } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { getFacebookAlbums, getFacebookImages, getFacebookProfile, getGoogleProfile } from 'api'
import { FacebookAlbum, FacebookPicture, FacebookProfile, GoogleProfile } from 'interfaces'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

interface Props extends ModalProps {
  type?: 'wide' | 'default' | 'full' | 'fwide'
  name: 'facebook' | 'google'
  loading: boolean
  okDisable?: boolean
  cancelDisable?: boolean
  onUpload?: (changedFields: any, allFields: any) => void
}

const UploadModal: React.FC<Props> = ({
  name,
  children,
  loading,
  okText,
  cancelText,
  onCancel,
  type = 'default',
  okDisable = false,
  cancelDisable = false,
  ...props
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('')
  const profile = useRequest<FacebookProfile | GoogleProfile>((e) => e(), {
    manual: true,
  })
  const images = useRequest<FacebookPicture[]>(() => getFacebookImages(selectedAlbum), {
    manual: false,
    refreshDeps: [selectedAlbum],
  })

  const albums = useRequest<FacebookAlbum[]>(getFacebookAlbums, {
    onSuccess: (_albums) => {
      setSelectedAlbum(_albums[0].id)
    },
  })
  const intl = useIntl()
  const screens = Grid.useBreakpoint()
  const calcWidth = () => {
    switch (type) {
      case 'wide':
        if (screens.xl) {
          return '60%'
        }
        if (screens.md) {
          return '80%'
        }
        return '100%'
      case 'fwide':
        if (screens.xl) {
          return '85%'
        }
        if (screens.md) {
          return '90%'
        }
        return '100%'
      case 'full':
        return '100%'
      default:
        return undefined
    }
  }

  const removeFacebook = (_event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    localStorage.removeItem('facebookAccessToken')
    if (onCancel) {
      onCancel(_event)
    }
  }

  useEffect(() => {
    const getData = (storage: any) => {
      switch (name) {
        case 'facebook':
          if (storage?.getItem('facebookAccessToken')) {
            profile.run(getFacebookProfile)
          }
          break
        case 'google':
          if (storage?.getItem('googleAccessToken')) {
            profile.run(getGoogleProfile)
          }
          break
        default:
          break
      }
    }
    const storageListener = (event: StorageEvent) => {
      getData(event.storageArea)
    }
    getData(localStorage)
    window.addEventListener('storage', storageListener)
    return () => {
      window.removeEventListener('storage', storageListener)
    }
  }, [name])

  const facebookHeader = (_profile: FacebookProfile) => (
    <div className="w-full flex">
      <div className="w-full flex items-center justify-between">
        <div className="2xl:w-1/3 xl:w-1/2 lg:w-1/2 md:w-1/3 sm:w-1/2">
          <Select value={selectedAlbum} className="w-full" onChange={(e) => setSelectedAlbum(`${e}`)}>
            {albums.data?.map((album) => (
              <Select.Option key={album.id} value={album.id}>
                {album.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="2xl:w-1/3 xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-1/2 flex justify-around">
          <Button onClick={removeFacebook}>
            <FormattedMessage id="logout.facebook" />
          </Button>
          <div className="text-right">
            <FormattedMessage
              id="logged_as"
              values={{
                name: (
                  <>
                    <br />
                    <span>{`${_profile?.first_name} ${_profile?.last_name}`}</span>
                  </>
                ),
              }}
            />
          </div>
          <img src={_profile?.picture.data.url} alt="profile" width="40" className="rounded-full" />
        </div>
      </div>
    </div>
  )
  const googleHeader = (_profile: GoogleProfile) => (
    <div className="w-full flex">
      <div className="w-full flex items-center justify-between">
        <div className="2xl:w-1/3 xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-1/2 flex justify-around">
          <Button onClick={removeFacebook}>
            <FormattedMessage id="logout.facebook" />
          </Button>
          <div className="text-right">
            <FormattedMessage
              id="logged_as"
              values={{
                name: (
                  <>
                    <br />
                    <span>{`${_profile?.email}`}</span>
                  </>
                ),
              }}
            />
          </div>
          <img src={_profile?.picture} alt="profile" width="40" className="rounded-full" />
        </div>
      </div>
    </div>
  )

  const header = () => {
    if (profile.data) {
      switch (name) {
        case 'facebook':
          return facebookHeader(profile.data as FacebookProfile)
        case 'google':
          return googleHeader(profile.data as GoogleProfile)
        default:
          return <div />
      }
    }
    return <div />
  }
  console.log(name)
  return (
    <Modal
      {...props}
      style={{ top: '1rem' }}
      width={calcWidth()}
      closable={false}
      maskClosable={false}
      onCancel={onCancel}
      footer={[
        <Button key="submit" disabled={okDisable} type="primary" htmlType="submit" form={name} loading={loading}>
          {okText || intl.formatMessage({ id: 'save' })}
        </Button>,
        <Button key="close" disabled={cancelDisable} onClick={onCancel}>
          {cancelText || intl.formatMessage({ id: 'close' })}
        </Button>,
      ]}
    >
      {loading || profile.loading ? (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      ) : (
        <>
          <div>{header()}</div>
          <div>
            <Checkbox.Group>
              {images.data?.map((image) => (
                <Checkbox key={image.id} value={image.id} className="w-24 h-24">
                  <img src={image.picture} className="object-cover" alt={image.id} />
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>
        </>
      )}
    </Modal>
  )
}

export default UploadModal
