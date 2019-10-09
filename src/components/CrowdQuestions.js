import React, { Fragment, Component } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import {
  colors,
  fontStyles,
  Loader,
  Dropdown,
  createFormatter
} from '@project-r/styleguide'
import Comment from './Comment'
import Composer from './Composer'
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
    paddingTop: 20,
    paddingRight: 60,
    paddingBottom: 20,
    paddingLeft: 40,
  }),
  answerTitle: css({
    ...fontStyles.sansSerifMedium16,
  }),
}

class CrowdQuestions extends Component {
  constructor (props) {
    super(props)

    this.t = createFormatter([
      {key: 'discussion/closed', value: 'Es können keine neue Fragen mehr eingegeben werden.'},
      {key: 'discussion/notEligible', value: 'Wollen Sie teilnehmen? Werden Sie jetzt Verleger und Abonnentin.'},
      {key: 'discussion/notSignedIn', value: 'Sie müssen sich zuerst anmelden.'},
      ...props.translations || []
    ])
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
    const { t } = this
    const { answerTitle, discussionId, compose = true, focusId = null, data, me, isMember } = this.props
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
                          userCanComment={discussion.userCanComment}
                          submitHandler={this.submitHandler}
                        />
                        {comment.comments && comment.comments.nodes[0] &&
                          <div {...styles.answer}>
                            <div {...styles.answerTitle}>{answerTitle}</div>
                            <Comment
                              discussion={discussion}
                              comment={comment.comments.nodes[0]}
                              userCanComment={discussion.userCanComment}
                              submitHandler={this.submitHandler}
                              hideVotes={true}
                            />
                          </div>
                        }
                      </Fragment>
                  )
                }

                {compose && (discussion.closed
                    ? <p {...styles.newQuestionDeactivated}>
                      {t('discussion/closed')}
                    </p>
                    : me
                      ? discussion.userCanComment
                        ? <div style={{ marginTop: 10 }}>
                          <Composer discussion={discussion} t={t} />
                        </div>
                        : <p>{t('discussion/notEligible')}</p>
                      : <p>{t('discussion/notSignedIn')}</p>
                )}
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
