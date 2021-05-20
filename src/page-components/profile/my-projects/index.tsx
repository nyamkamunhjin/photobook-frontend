import { useRequest } from 'ahooks'
import { List } from 'antd'
import React, { FC, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { listProject } from 'api'
import { Project, RootInterface } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'

const MyProjects: FC = () => {
  const history = useHistory()
  const user = useSelector((state: RootInterface) => state.auth.user)
  const projects = useRequest(
    ({ current, pageSize }, { userId }, pageNumber) => listProject({ current, pageSize }, { userId }, pageNumber),
    {
      manual: true,
      paginated: true,
    }
  )

  useEffect(() => {
    if (user?.id) {
      projects.run(
        { current: projects.pagination.current, pageSize: projects.pagination.pageSize },
        { userId: user.id.toString() },
        (projects.pagination.current - 1) * projects.pagination.pageSize
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="my_projects" />
      </span>
      <div>
        <List
          itemLayout="horizontal"
          dataSource={projects.data?.list}
          loading={projects.loading}
          pagination={{
            ...projects.pagination,
            onChange: projects.pagination.changeCurrent,
          }}
          renderItem={(item: Project) => (
            <List.Item
              className="rounded p-2 hover:bg-gray-50"
              key={item.id}
              actions={[
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => history.push(`/editor?project=${item.uuid}`)}
                >
                  <FormattedMessage id="edit" />
                </button>,
              ]}
            >
              <List.Item.Meta
                avatar={<img className="w-28 h-28 rounded" src={item.imageUrl} alt="project" />}
                title={<span className="font-semibold text-lg">{item.name}</span>}
                description={<p>{item.description}</p>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default MyProjects
