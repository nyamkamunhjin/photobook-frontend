import { ArrowLeftOutlined, RedoOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { useHotkeys } from 'react-hotkeys-hook'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { undo as _undo, redo as _redo } from 'redux/actions/project'
import { logout as _logout } from 'redux/actions/auth'
import { RootInterface } from 'interfaces'
import { FormattedMessage } from 'react-intl'

interface HeaderProps {
  saveObjects: () => void
  deselectObject: () => void
  saveTextBeforeUndo: () => void
  undo: () => void
  redo: () => void
  logout: any
  project: any
}

const Header: React.FC<HeaderProps> = ({
  saveObjects,
  deselectObject,
  saveTextBeforeUndo,
  undo,
  redo,
  logout,
  project: { undoHistory, redoHistory },
}) => {
  const history = useHistory()
  const [saving, setSaving] = useState<boolean>(false)

  useHotkeys('ctrl+z', () => onUndo(), [undoHistory])
  useHotkeys('ctrl+shift+z', () => onRedo(), [redoHistory])

  const onUndo = () => {
    if (undoHistory.length === 0) return
    saveTextBeforeUndo()
    deselectObject()
    setTimeout(() => {
      undo()
    }, 0)
  }

  const onRedo = () => {
    if (redoHistory.length === 0) return
    deselectObject()
    redo()
  }

  const onSave = () => {
    setSaving(true)
    saveObjects()
    setTimeout(() => {
      setSaving(false)
    }, 500)
  }

  return (
    <div className="HeaderView">
      <Button
        onClick={() => history.goBack()}
        className="icon-button"
        type="primary"
        icon={<ArrowLeftOutlined className="icon" />}
      >
        <FormattedMessage id="back" />
      </Button>
      <Button
        className="icon-button"
        type="primary"
        loading={saving}
        onClick={onSave}
        icon={<SaveOutlined className="icon" />}
      >
        <FormattedMessage id="save" />
      </Button>
      <Button
        style={{ marginLeft: 20 }}
        className="icon-button"
        type="dashed"
        onClick={onUndo}
        icon={<UndoOutlined className="icon" />}
        disabled={undoHistory.length === 0}
      >
        <FormattedMessage id="undo" />
      </Button>
      <Button
        className="icon-button"
        type="dashed"
        onClick={onRedo}
        icon={<RedoOutlined className="icon" />}
        disabled={redoHistory.length === 0}
      >
        <FormattedMessage id="redo" />
      </Button>
      <div className="EditorLogo">
        <FormattedMessage id="photobook" />
      </div>
      <Button style={{ marginLeft: 20 }} className="icon-button" type="dashed" onClick={() => logout(useHistory)}>
        <FormattedMessage id="logout" />
      </Button>
      <div className="AdvancedHeaderToolbar" />
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
})

export default connect(mapStateToProps, { undo: _undo, redo: _redo, logout: _logout })(Header)
