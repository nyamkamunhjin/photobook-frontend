/* eslint @typescript-eslint/no-explicit-any: off */
import useRequest from '@ahooksjs/use-request'
import { Button, Checkbox, Spin } from 'antd'
import { getGoogleImages, getGoogleProfile } from 'api'
import { GooglePicture, GoogleProfile, UploadablePicture } from 'interfaces'
import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

interface Props {
  name: 'google'
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void
  setSelectedImages: (images: UploadablePicture[]) => void
}

const Google: React.FC<Props> = ({ children, name, onCancel, setSelectedImages, ...props }) => {
  const profile = useRequest<GoogleProfile>((e) => e && e(), {
    manual: true,
  })
  const images = useRequest<GooglePicture[]>((e, album) => e(album), {
    manual: true,
  })

  const removeGoogle = (_event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    localStorage.removeItem('googleAccessToken')
    if (onCancel) {
      onCancel(_event)
    }
  }
  useEffect(() => {
    const getData = (storage: any) => {
      if (name === 'google') {
        if (storage?.getItem('googleAccessToken')) {
          profile.run(getGoogleProfile)
          images.run(getGoogleImages, '')
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

  const googleHeader = (_profile: GoogleProfile) => (
    <div className="w-full flex">
      <div className="w-full flex items-center justify-end">
        <div className="2xl:w-1/3 xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-1/2 flex justify-around">
          <Button onClick={removeGoogle}>
            <FormattedMessage id="logout.google" />
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

  const googleBody = (_images: GooglePicture[]) =>
    _images?.map((image) => (
      <Checkbox key={image.id} value={image.id} className="w-24 h-24">
        <img src={image.baseUrl} className="object-cover" alt={image.id} />
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
          <div>{googleHeader(profile.data as GoogleProfile)}</div>
          <div>
            <Checkbox.Group
              onChange={(list) => {
                setSelectedImages(
                  (images.data as GooglePicture[])
                    .filter((a) => list.includes(a.id))
                    .map<UploadablePicture>((each) => ({
                      url: each.baseUrl,
                      filename: each.filename,
                      mimeType: each.mimeType,
                    }))
                )
              }}
            >
              {googleBody(images.data as GooglePicture[])}
            </Checkbox.Group>
          </div>
        </>
      )}
    </>
  )
}

export default Google