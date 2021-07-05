/* eslint-disable @typescript-eslint/no-shadow */
import React, { useRef, useState } from 'react'
import { connect } from 'react-redux'
import { updateProject } from 'redux/actions/project'
import { Modal, Select, Form, Button } from 'antd'
import { useRequest } from 'ahooks'
import { PaginatedResult, PaperSize, ProjectInterface, StateInterface } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { listPaperSize } from 'api'

const { Option } = Select

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}

interface Props {
  setSettingsVisible: (value: boolean) => void
  type: 'photobook' | 'canvas' | 'photo' | 'frame'
  settingsVisible: boolean
  updateProject: (projectId: number, props: { paperSizeId: number }) => void
  project: ProjectInterface
}

interface FormValues {
  paperSizeId: number
}

const SlideSettings: React.FC<Props> = ({
  setSettingsVisible,
  settingsVisible,
  updateProject,
  type,
  project: { currentProject },
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const { data } = useRequest<PaginatedResult<PaperSize>>(() =>
    listPaperSize({ current: 0, pageSize: 100 }, { templateType: type })
  )

  const handleSettingsCancel = () => {
    setSettingsVisible(false)
  }

  const onFinish = (values: FormValues) => {
    if (currentProject.id) {
      updateProject(currentProject.id, { paperSizeId: values.paperSizeId })
    }
  }

  return (
    <Modal
      title={<FormattedMessage id="slide_settings" />}
      visible={settingsVisible}
      footer={[
        <Button key="back" onClick={handleSettingsCancel}>
          <FormattedMessage id="cancel" />
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
          <FormattedMessage id="save" />
        </Button>,
      ]}
    >
      <Form
        {...layout}
        name="basic"
        initialValues={{
          paperSizeId: currentProject.paperSizeId,
        }}
        onFinish={(values) => onFinish(values)}
      >
        <Form.Item name="paperSizeId" label="Paper size">
          <Select style={{ minWidth: 200 }}>
            {data?.list?.map((paper) => (
              <Option key={`paper-${paper.id}`} value={paper.id}>
                {paper.size}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ display: 'none' }}>
          <Button ref={submitRef} type="primary" htmlType="submit">
            <FormattedMessage id="save" />
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
