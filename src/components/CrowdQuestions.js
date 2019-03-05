import React, { Fragment, Component } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import { colors, fontStyles, Loader } from '@project-r/styleguide'
import Comment from './Comment'
import { withMembership } from './Auth/checkRoles'

import { withComments } from '../lib/queries'

const styles = {
  newQuestion: css({
    ...fontStyles.sansSerifRegular16,
    outline: 'none',
    color: colors.primary,
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    display: 'block',
    marginBottom: 5
  })
}


class CrowdQuestions extends Component {
  constructor (props) {
    super(props)

    this.state = {
      orderBy: 'VOTES', // DiscussionOrder
      now: Date.now(),
      isComposing: false
    }
  }

  componentDidMount () {
    this.intervalId = setInterval(() => {
      this.setState({ now: Date.now() })
    }, 10 * 1000)
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    const { t, discussionId, focusId = null, data, isMember } = this.props
    const { orderBy, now, isComposing } = this.state
    const { comments } = data

    this.submitHandler = (mutation, variables) => () => {
      this.setState({ loading: true })

      return mutation({
        variables
      })
        .then(() => {
          this.setState(() => ({ loading: false }))
        })
        .catch((err) => {
          console.error(err)
          this.setState({
            loading: false
            // error: err.graphQLErrors[0].message
          })
        })
    }

    return (
      <Fragment>
        <div data-discussion-id={discussionId}>
          <Loader
            loading={data.loading}
            error={data.error}
            render={() => {
              return (
                <div>
                  {comments && comments.nodes
                    .map(
                      (node, index) =>
                        <Comment
                          comment={node}
                          index={index}
                          isMember={isMember}
                          key={`comment-${node.id}`}
                          submitHandler={this.submitHandler}
                        />
                    )
                  }
                </div>
              )
            }}
          />

          {isMember &&
          <div style={{ marginTop: 10 }}>
            {isComposing &&
            <Fragment>
              <button {...styles.newQuestion} onClick={() => {
                this.setState({ isComposing: false })
              }}>
                schliessen
              </button>
              {
                // TODO implement composer
                //<DiscussionCommentComposer
                //  discussionId={discussionId}
                //  orderBy={orderBy}
                //  focusId={focusId}
                //  depth={1}
                //  parentId={null}
                //  now={now}
                //  afterCancel={() => this.setState({ isComposing: false })}
                //  afterSubmit={(res) => {
                //    const lastId = (res && res.data && res.data.submitComment.id) || null
                //    this.setState({ isComposing: false, lastId })
                //    data.refetch({ lastId })
                //  }}
                //  state='focused'
                ///>
              }
            </Fragment>
            }
            {!isComposing &&
            <div>
              <button {...styles.newQuestion} onClick={() => {
                this.setState({ isComposing: true })
              }}>
                neue Frage stellen
              </button>
            </div>
            }
          </div>
          }
        </div>
      </Fragment>
    )
  }
}

export default compose(
  withMembership,
  withComments({
    orderBy: 'VOTES',
    first: 100
  })
)(CrowdQuestions)
