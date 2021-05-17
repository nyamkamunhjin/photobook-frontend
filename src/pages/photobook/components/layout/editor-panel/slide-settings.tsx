/* eslint-disable @typescript-eslint/no-shadow */
import React, { useRef, useState } from 'react'
import { connect } from 'react-redux'
import { updateProject } from 'redux/actions/project'
import { Modal, Select, Form, Button } from 'antd'
import { ProjectInterface, StateInterface } from 'interfaces'

const { Option } = Select

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}

interface Props {
  setSettingsVisible: (value: boolean) => void
  settingsVisible: boolean
  updateProject: (projectId: number, props: { paperSize: string }) => void
  project: ProjectInterface
}

interface FormValues {
  paperSize: string
}

const SlideSettings: React.FC<Props> = ({
  setSettingsVisible,
  settingsVisible,
  updateProject,
  project: { currentProject },
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const submitRef = useRef<HTMLButtonElement>(null)

  const handleSettingsCancel = () => {
    setSettingsVisible(false)
  }

  const onFinish = (values: FormValues) => {
    if (currentProject.id) {
      updateProject(currentProject.id, { paperSize: values.paperSize })
    }
  }

  return (
    <Modal
      title="Slide Settings"
      visible={settingsVisible}
      footer={[
        <Button key="back" onClick={handleSettingsCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => {
            setLoading(true)
            setTimeout(() => {
              setLoading(false)
              setTimeout(() => {
                setSettingsVisible(false)
              }, 0)
            }, 500)
            if (submitRef.current) {
              submitRef.current.click()
            }
          }}
        >
          Save
        </Button>,
      ]}
    >
      <Form
        {...layout}
        name="basic"
        initialValues={{
          paperSize: currentProject.paperSize,
        }}
        onFinish={(values) => onFinish(values)}
      >
        <Form.Item name="paperSize" label="Paper size">
          <Select style={{ minWidth: 200 }}>
            <Option value="8x8">Small Square 8x8</Option>
            <Option value="8x6">Small Landscape 8x6</Option>
            <Option value="11x8.5">Medium Landscape 11x8.5</Option>
            <Option value="14x11">Large Landscape 14x11</Option>
            <Option value="30x30">Large Landscape 30x30</Option>
            <Option value="20x30">Large Landscape 20x30</Option>
            <Option value="20x20">Large Landscape 20x20</Option>
            <Option value="25x20">Large Landscape 25x20</Option>
            <Option value="35x25">Large Landscape 35x25</Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ display: 'none' }}>
          <Button ref={submitRef} type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const mapStateToProps = (state: StateInterface) => ({
  project: state.project,
})

export default connect(mapStateToProps, { updateProject })(SlideSettings)
