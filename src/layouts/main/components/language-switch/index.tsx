import { Popover } from 'antd'
import { Locales, RootInterface } from 'interfaces'
import { useDispatch, useSelector } from 'react-redux'
import React, { ReactNode } from 'react'
import { ReactComponent as ENFlag } from 'assets/flags/en.svg'
import { ReactComponent as MNFlag } from 'assets/flags/mn.svg'
import { CustomButton } from '../../../../components'
// import { useIntl } from 'react-intl'

interface LangData {
  id: string
  locale: Locales
  name: string
  icon: ReactNode
}

const languageData: LangData[] = [
  {
    locale: 'en',
    name: 'English',
    id: 'en',
    icon: <ENFlag className="w-6" />,
  },
  {
    locale: 'mn',
    name: 'Монгол',
    id: 'mn',
    icon: <MNFlag className="w-6" />,
  },
]

const LanguageSwitch: React.FC<unknown> = () => {
  const dispatch = useDispatch()
  const lang = useSelector((state: RootInterface) => state.settings.locale)
  // const intl = useIntl()

  return (
    <Popover
      overlayClassName="popover-horizantal"
      placement="bottomRight"
      content={
        <div className="popover-lang-scroll">
          <ul className="sub-popover">
            {languageData.map((language) => (
              <li key={language.id}>
                <CustomButton
                  className="btn grid place-items-center w-full"
                  onClick={() => {
                    dispatch({ type: 'LOCALE', locale: language.id })
                  }}
                >
                  <div className="flex flex-col justify-center items-center w-full">
                    {language.icon}
                    <span className="text-center">{language.name}</span>
                  </div>
                </CustomButton>
              </li>
            ))}
          </ul>
        </div>
      }
      trigger="click"
    >
      <span className="pointer flex-row align-items-center">
        {lang === 'en' ? <ENFlag className="w-6" /> : <MNFlag className="w-6" />}
      </span>
    </Popover>
  )
}

export default LanguageSwitch
