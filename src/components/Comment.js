import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { css } from 'glamor'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import { colors, fontStyles, Label, mediaQueries, renderCommentMdast } from '@project-r/styleguide'

import { upvoteCommentQuery, downvoteCommentQuery, unvoteCommentMutation } from '../lib/queries'

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  display: 'block',
  cursor: 'pointer'
}

const styles = {
  wrapper: css({
    width: '100%',
    display: 'flex',
    alignItems: 'baseline',
    [mediaQueries.onlyS]: {
      flexDirection: 'column',
      marginTop: 15
    }
  }),
  question: css({
    '& p': {
      ...fontStyles.serifRegular19,
      [mediaQueries.onlyS]: {
        ...fontStyles.serifRegular17
      }
    }
  }),
  questionRank: css({
    ...fontStyles.sansSerifMedium14,
    textAlign: 'right',
    paddingRight: 10
  }),
  rightActions: css({
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    lineHeight: '1',
    marginLeft: 'auto'
  }),
  iconButton: css({
    ...buttonStyle,
    margin: '0 4px',
    '& svg': {
      margin: '0 auto'
    }
  }),
  rightButton: css({
    display: 'flex',
    justifyContent: 'center',
    height: `26px`,
    width: '24px',
    fontSize: `26px`,
    lineHeight: `26px`,
    margin: 0,
    '& > svg': {
      flexShrink: 0
    }
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  voteDivider: css({
    color: colors.disabled,
    padding: '0 2px'
  })
}

// Use the 'iconSize' to adjust the visual weight of the icon. For example
// the 'MdShareIcon' looks much larger next to 'MdKeyboardArrowUp' if both
// have the same dimensions.
//
// The outer dimensions of the action button element is always the same:
// square and as tall as the 'CommentAction' component.
const IconButton = ({ iconSize, type = 'right', onClick, disabled, title, children }) => (
  <button {...styles.iconButton} {...styles[`${type}Button`]}
    title={title}
    style={{
      cursor: onClick ? undefined : 'inherit',
      color: disabled ? colors.disabled : undefined
    }}
    onClick={onClick}>
    {children}
  </button>
)

class CrowdQuestionsComment extends Component {

  render () {
    const {
      discussion,
      comment,
      index,
      userCanComment,
      submitHandler,
      hideVotes = false
    } = this.props
    const {
      id,
      userVote,
      upVotes,
      downVotes,
      content
    } = comment

    return (
      <div {...styles.wrapper} key={`comment-${id}`}>
        {index !== undefined &&
          <div {...styles.questionRank}>{index + 1}.</div>
        }
        <div {...styles.question} >{renderCommentMdast(content)}</div>

        {!hideVotes &&
          <div {...styles.rightActions}>
            <div {...styles.votes}>
              <Mutation mutation={unvoteCommentMutation}>
                {(unvoteComment) => (
                  <>
                    <Mutation mutation={upvoteCommentQuery}>
                      {(mutateComment) => (
                        <div {...styles.vote}>
                          <IconButton
                            disabled={!userCanComment || discussion.closed || userVote === 'UP'}
                            onClick={
                              userCanComment && !discussion.closed && (
                                submitHandler(
                                  userVote !== 'UP' ? mutateComment : unvoteComment,
                                  { commentId: id }
                                )
                              )
                            }
                            title="+1">
                            <MdKeyboardArrowUp />
                          </IconButton>
                          <Label
                            title={`${upVotes} stimmen dafür`}>{upVotes}</Label>
                        </div>
                      )}
                    </Mutation>
                    <div {...styles.voteDivider}>/</div>
                    <Mutation mutation={downvoteCommentQuery}>
                      {(mutateComment) => (
                        <div {...styles.vote}>
                          <Label
                            title={`${downVotes} stimmen dagegen`}>{downVotes}</Label>
                          <IconButton
                            disabled={!userCanComment || discussion.closed || userVote === 'DOWN'}
                            onClick={
                              userCanComment && !discussion.closed && (
                                submitHandler(
                                  userVote !== 'DOWN' ? mutateComment : unvoteComment,
                                  { commentId: id }
                                )
                              )
                            }
                            title='-1'>
                            <MdKeyboardArrowDown />
                          </IconButton>
                        </div>
                      )}
                    </Mutation>
                  </>
                )}
              </Mutation>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default CrowdQuestionsComment
