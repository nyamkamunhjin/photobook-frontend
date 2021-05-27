/* eslint @typescript-eslint/no-explicit-any: off */
import useRequest from '@ahooksjs/use-request'
import { Button, Checkbox, Select, Spin } from 'antd'
import { getFacebookAlbums, getFacebookImages, getFacebookProfile } from 'api'
import { FacebookAlbum, FacebookPicture, FacebookProfile, Image, UploadablePicture } from 'interfaces'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'

interface Props {
  name: 'facebook'
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void
  setSelectedImages: (images: UploadablePicture[]) => void
}

const Facebook: React.FC<Props> = ({ children, name, onCancel, setSelectedImages, ...props }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('')
  const profile = useRequest<FacebookProfile>((e) => e && e(), {
    manual: true,
  })
  const images = useRequest<FacebookPicture[]>((e, album) => e(album), {
    manual: true,
    refreshDeps: [selectedAlbum],
  })

  const albums = useRequest<FacebookAlbum[]>(getFacebookAlbums, {
    manual: true,
    onSuccess: (_albums) => {
      setSelectedAlbum(_albums[0].id)
      images.run(getFacebookImages, _albums[0].id)
    },
  })

  const removeFacebook = (_event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    localStorage.removeItem('facebookAccessToken')
    if (onCancel) {
      onCancel(_event)
    }
  }

  useEffect(() => {
    const getData = (storage: any) => {
      if (name === 'facebook') {
        if (storage?.getItem('facebookAccessToken')) {
          profile.run(getFacebookProfile)
          images.run(getFacebookImages, selectedAlbum)
          albums.run()
        }
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
          <Select
            value={selectedAlbum}
            className="w-full"
            onChange={(e) => {
              setSelectedAlbum(`${e}`)
              images.run(getFacebookImages, e)
            }}
          >
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

  const facebookBody = (_images: FacebookPicture[]) =>
    _images?.map((image) => (
      <Checkbox key={image.id} value={image.id} className="w-24 h-24">
        <img src={image.picture} className="object-cover" alt={image.id} />
      </Checkbox>
    ))
  return (
    <>
      {profile.loading || images.loading || !profile.data ? (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      ) : (
        <>
          <div>{facebookHeader(profile.data as FacebookProfile)}</div>
          <div>
            <Checkbox.Group
              onChange={(list) => {
                setSelectedImages(
                  (images.data as FacebookPicture[])
                    .filter((a) => list.includes(a.id))
                    .map<UploadablePicture>((each) => ({
                      url: each.images[0].source,
                      filename: each.id,
                      mimeType: 'JPG',
                    }))
                )
              }}
            >
              {facebookBody(images.data as FacebookPicture[])}
            </Checkbox.Group>
          </div>
        </>
      )}
    </>
  )
}

export default Facebook
