import { Button, Popover } from 'antd'
import { Locales } from 'interfaces'
import { useDispatch } from 'react-redux'
import React, { ReactNode } from 'react'
import { ReactComponent as ENFlag } from 'assets/flags/en.svg'
import { ReactComponent as MNFlag } from 'assets/flags/mn.svg'
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
    id: 'us',
    icon: <ENFlag />,
  },
  {
    locale: 'mn',
    name: 'Монгол',
    id: 'mn',
    icon: <MNFlag />,
  },
]

const LanguageSwitch: React.FC<unknown> = () => {
  const dispatch = useDispatch()
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
                <Button
                  block
                  type="link"
                  className="media flex-row"
                  icon={language.icon}
                  onClick={() => {
                    dispatch({ type: 'lang' })
                  }}
                >
                  <span className="language-text">{language.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      }
      trigger="click"
    >
      <span className="pointer flex-row align-items-center">
        <img height="24px" src="/flags/mn.svg" alt="mn-flag" />
      </span>
    </Popover>
  )
}

export default LanguageSwitch
