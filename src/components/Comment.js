import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { css } from 'glamor'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import { colors, fontStyles, Label, renderCommentMdast } from '@project-r/styleguide'

import { upvoteCommentQuery, downvoteCommentQuery, unvoteCommentMutation } from '../lib/queries'

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  cursor: 'pointer'
}

const styles = {
  wrapper: css({
    ':after': {
      content: '""',
      clear: 'both',
      display: 'block',
      visibility: 'hidden',
      height: 0
    }
  }),
  rightActions: css({
    display: 'inline-block',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    marginTop: -1,
    float: 'right'
  }),
  iconButton: css({
    ...buttonStyle,
    fontSize: 26,
    lineHeight: 1,
    margin: 0,
    '& svg': {
      margin: '0 auto'
    }
  }),
  voteDivider: css({
    display: 'inline-block',
    color: colors.disabled,
    padding: '0 2px'
  })
}

const IconButton = ({ iconSize, onClick, disabled, title, children }) => (
  <button {...styles.iconButton}
    title={title}
    style={{
      cursor: onClick ? undefined : 'inherit',
      color: disabled ? colors.disabled : undefined
    }}
    onClick={onClick}>
    {children}
  </button>
)

const CrowdQuestionsComment = props => {
  const {
    discussion,
    comment,
    userCanComment,
    submitHandler,
    hideVotes = false
  } = props
  const {
    id: commentId,
    userVote,
    upVotes,
    downVotes,
    content
  } = comment

  const options = {
    variables: { commentId }
  }

  return (
    <div {...styles.wrapper}>
      {!hideVotes && <span {...styles.rightActions}>
        <Mutation mutation={unvoteCommentMutation}>
          {unvoteComment => (
            <>
              <Mutation mutation={upvoteCommentQuery}>
                {voteComment => (
                  <IconButton
                    disabled={!userCanComment || discussion.closed || userVote === 'UP'}
                    onClick={
                      userCanComment && !discussion.closed && (() => (
                        userVote !== 'UP'
                          ? voteComment(options)
                          : unvoteComment(options)
                      ))
                    }
                    title='+1'>
                    <MdKeyboardArrowUp />
                  </IconButton>
                )}
              </Mutation>
              <Label
                title={`${upVotes} stimmen dafür`}>{upVotes}</Label>
              <span {...styles.voteDivider}>/</span>
              <Label
                title={`${downVotes} stimmen dagegen`}>{downVotes}</Label>
              <Mutation mutation={downvoteCommentQuery}>
                {voteComment => (
                  <IconButton
                    disabled={!userCanComment || discussion.closed || userVote === 'DOWN'}
                    onClick={
                      userCanComment && !discussion.closed && (() => (
                        userVote !== 'DOWN'
                          ? voteComment(options)
                          : unvoteComment(options)
                      ))
                    }
                    title='-1'>
                    <MdKeyboardArrowDown />
                  </IconButton>
                )}
              </Mutation>
            </>
          )}
        </Mutation>
      </span>}

      {renderCommentMdast(content)}
    </div>
  )
}

export default CrowdQuestionsComment
