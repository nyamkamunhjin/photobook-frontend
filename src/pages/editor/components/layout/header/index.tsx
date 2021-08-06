import {
  ArrowLeftOutlined,
  EyeFilled,
  RedoOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { useHotkeys } from 'react-hotkeys-hook'
import { Button, Row } from 'antd'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { undo as _undo, redo as _redo } from 'redux/actions/project'
import { IconButton } from 'components'
import { logout as _logout } from 'redux/actions/auth'
import { ProjectInterface, RootInterface } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import IconInput from 'components/input'
import { useBoolean } from 'ahooks'

interface HeaderProps {
  saveObjects: () => Promise<void>
  setIsOrder?: (param: any) => void
  saveName?: (name: string) => void
  onPreview?: () => void
  deSelectObject: () => void
  saveTextBeforeUndo: () => void
  undo: () => void
  redo: () => void
  logout: any
  project: ProjectInterface
}

const Header: React.FC<HeaderProps> = ({
  saveObjects,
  setIsOrder,
  saveName,
  onPreview,
  deSelectObject,
  saveTextBeforeUndo,
  undo,
  redo,
  project: {
    undoHistory,
    redoHistory,
    currentProject: { name },
  },
}) => {
  const history = useHistory()
  const [saving, setSaving] = useState<boolean>(false)
  const [editing, setEditing] = useBoolean(false)
  const [_name, _setName] = useState<string>(name || '')

  useHotkeys('ctrl+z', () => onUndo(), [undoHistory])
  useHotkeys('ctrl+shift+z', () => onRedo(), [redoHistory])

  const onUndo = () => {
    if (undoHistory.length === 0) return
    saveTextBeforeUndo()
    deSelectObject()
    setTimeout(() => {
      undo()
    }, 0)
  }

  const onRedo = () => {
    if (redoHistory.length === 0) return
    deSelectObject()
    redo()
  }

  const onSave = () => {
    setSaving(true)
    saveObjects().then(() => {
      setTimeout(() => {
        setSaving(false)
      }, 500)
    })
  }

  const onSaveName = () => {
    setSaving(true)
    if (saveName) {
      saveName(_name)
    }
    setTimeout(() => {
      setSaving(false)
      setEditing.setFalse()
    }, 500)
  }

  const onCancel = () => {
    _setName(name || '')
    setEditing.setFalse()
  }

  return (
    <div className="HeaderView">
      <Row style={{ flex: 5, justifyContent: 'flex-start', alignItems: 'center' }}>
        <IconButton
          onClick={() => history.goBack()}
          icon={<ArrowLeftOutlined className="icon text-gray-700" style={{ fontSize: 16 }} />}
        >
          <FormattedMessage id="back" />
        </IconButton>
        <div className="EditorLogo">
          <FormattedMessage id="photobook" />
        </div>
        <IconButton
          style={{ marginLeft: 20 }}
          onClick={onUndo}
          icon={<UndoOutlined className="icon text-gray-700" style={{ fontSize: 16 }} />}
          disabled={undoHistory.length === 0}
        >
          <FormattedMessage id="undo" />
        </IconButton>
        <IconButton
          className="icon-button"
          onClick={onRedo}
          icon={<RedoOutlined className="icon text-gray-700" style={{ fontSize: 16 }} />}
          disabled={redoHistory.length === 0}
        >
          <FormattedMessage id="redo" />
        </IconButton>
      </Row>
      <Row hidden={!saveName} style={{ flex: 1.5, justifyContent: 'center' }}>
        <IconInput
          onChange={(e) => _setName(e.currentTarget.value)}
          value={_name}
          isActive={editing}
          onFocus={() => setEditing.setTrue()}
          onSave={onSaveName}
          onCancel={onCancel}
        />
      </Row>
      <Row style={{ flex: 5, justifyContent: 'flex-end' }}>
        <IconButton
          className="icon-button"
          loading={saving}
          onClick={onSave}
          icon={<SaveOutlined className="icon text-gray-700" style={{ fontSize: 16 }} />}
        >
          <FormattedMessage id="save" />
        </IconButton>
        <IconButton
          hidden={!onPreview}
          className="icon-button"
          disabled={saving}
          onClick={onPreview}
          icon={<EyeFilled className="icon text-gray-700" style={{ fontSize: 16 }} />}
        >
          <FormattedMessage id="preview" />
        </IconButton>
        {setIsOrder && (
          <Button
            className="ml-2 flex gap-2 items-center text-sm"
            size="large"
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => setIsOrder(true)}
          >
            <FormattedMessage id="order" />
          </Button>
        )}
      </Row>
      <div className="AdvancedHeaderToolbar" />
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
})

export default connect(mapStateToProps, { undo: _undo, redo: _redo, logout: _logout })(Header)
