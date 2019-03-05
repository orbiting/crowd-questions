import React, { Fragment, Component } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import { colors, fontStyles, Loader } from '@project-r/styleguide'
import Comment from './Comment'
import { withMembership } from './Auth/checkRoles'

import { withComments } from '../lib/queries'

const styles = {
  newQuestionDeactivated: css({
    ...fontStyles.sansSerifRegular16,
    border: 'none',
    padding: '0',
    display: 'block',
    marginBottom: 5
  }),
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
  }),
  answer: css({
    paddingLeft: 40,
    paddingBottom: 20
  }),
  answerTitle: css({
    ...fontStyles.sansSerifMedium16,
  }),
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
    const { discussion } = data
    const comments = discussion && discussion.comments

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
      <div data-discussion-id={discussionId}>
        <Loader
          loading={data.loading}
          error={data.error}
          render={() => {
            discussion.closed = true
            return (
              <Fragment>
                {comments && comments.nodes
                  .filter( ({ published, adminUnpublished }) => published && !adminUnpublished )
                  .map(
                    (comment, index) =>
                      <Fragment key={`comment-${comment.id}`}>
                        <Comment
                          discussion={discussion}
                          comment={comment}
                          index={index}
                          isMember={isMember}
                          submitHandler={this.submitHandler}
                        />
                        {comment.comments && comment.comments.nodes[0] &&
                          <div {...styles.answer}>
                            <p {...styles.answerTitle}>Antwort der Post:</p>
                            <Comment
                              discussion={discussion}
                              comment={comment.comments.nodes[0]}
                              isMember={isMember}
                              submitHandler={this.submitHandler}
                            />
                          </div>
                        }
                      </Fragment>
                  )
                }

                {discussion.closed &&
                  <p {...styles.newQuestionDeactivated}>Es können keine neue Fragen mehr eingegeben werden.</p>
                }

                {!discussion.closed && !isMember &&
                    <p>Sie müssen sich zuerst anmelden</p>
                }

                {!discussion.closed && isMember &&
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
              </Fragment>
            )
          }}
        />
      </div>
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
