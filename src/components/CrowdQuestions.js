import React, { Fragment, Component, useMemo, useEffect } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import {
  colors,
  fontStyles,
  Loader,
  Dropdown,
  mediaQueries,
  createFormatter,
  pxToRem
} from '@project-r/styleguide'
import Comment from './Comment'
import Composer from './Composer'

import { withComments } from '../lib/queries'
import withMe from '../lib/withMe'

const styles = {
  newQuestionDeactivated: css({
    ...fontStyles.sansSerifRegular,
    fontSize: pxToRem(16),
    lineHeight: pxToRem(25),
    border: 'none',
    padding: '0',
    display: 'block',
    marginBottom: 5
  }),
  newQuestion: css({
    ...fontStyles.sansSerifRegular,
    fontSize: pxToRem(16),
    lineHeight: pxToRem(25),
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
    paddingTop: 10,
    paddingRight: 75,
    paddingLeft: 10
  }),
  answerTitle: css({
    ...fontStyles.sansSerifMedium,
    fontSize: pxToRem(16),
    lineHeight: pxToRem(25)
  }),
  table: css({
    width: '100%',
    borderSpacing: '0',
    paddingLeft: 0,
    paddingRight: 0,
    overflow: 'hidden',
    tableLayout: 'fixed'
  }),
  tr: css({
    '& th, & td': {
      paddingTop: 10,
      paddingBottom: 10
    },
    '& td p': {
      wordWrap: 'break-word',
      ...fontStyles.sansSerif,
      fontSize: pxToRem(17),
      lineHeight: pxToRem(26),
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerif,
        fontSize: pxToRem(19),
        lineHeight: pxToRem(30),
      }
    },
    '& th': css({
      width: 20,
      verticalAlign: 'top',
      ...fontStyles.sansSerifMedium,
      fontSize: pxToRem(15),
      lineHeight: pxToRem(26),
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium,
        fontSize: pxToRem(17),
        lineHeight: pxToRem(29)
      },
      textAlign: 'right',
      paddingRight: 5,
      fontFeatureSettings: '"tnum" 1, "kern" 1'
    })
  })
}

const CrowdQuestions = (props) => {
  const t = useMemo(
    () => createFormatter([
      {key: 'discussion/closed', value: 'Es können keine neue Fragen mehr eingegeben werden.'},
      {key: 'discussion/notEligible', value: 'Wollen Sie teilnehmen? Werden Sie jetzt Verleger und Abonnentin.'},
      {key: 'discussion/notSignedIn', value: 'Sie müssen sich zuerst anmelden.'},
      ...props.translations || []
    ]),
    [props.translations]
  )

  const { answerTitle, discussionId, compose = true, vote = true, focusId = null, data, me } = props
  const { discussion } = data
  const comments = discussion && discussion.comments

  useEffect(
    () => {
      if (discussion && !discussion.closed) {
        data.startPolling(15000)
        return () => {
          data.stopPolling()
        }
      }
    },
    [discussion]
  )

  return (
    <div data-discussion-id={discussionId}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          return (
            <Fragment>
              <table {...styles.table}>
                <tbody>
                  {comments && comments.nodes
                    .filter(({ published, adminUnpublished }) => published && !adminUnpublished)
                    .map((comment, index) =>
                      <tr key={`comment-${comment.id}`} {...styles.tr}>
                        <th style={{ width: Math.ceil(String(index + 1).length * 10.6 + 11) }}>
                          {index + 1}.
                        </th>
                        <td>
                          <Comment
                            discussion={discussion}
                            comment={comment}
                            vote={vote}
                            userCanComment={discussion.userCanComment}
                          />
                          {comment.comments && comment.comments.nodes[0] &&
                            <div {...styles.answer}>
                              <div {...styles.answerTitle}>{answerTitle || 'Antwort'}</div>
                              <Comment
                                discussion={discussion}
                                comment={comment.comments.nodes[0]}
                                userCanComment={discussion.userCanComment}
                                hideVotes
                              />
                            </div>
                          }
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>

              {compose && (discussion.closed
                ? <p {...styles.newQuestionDeactivated}>
                  {t('discussion/closed')}
                </p>
                : me
                  ? discussion.userCanComment
                    ? <div style={{ marginTop: 30 }}>
                      <Composer discussion={discussion} refetch={data.refetch} t={t} />
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

export default compose(
  withMe,
  withComments({
    orderBy: 'VOTES',
    first: 500
  })
)(CrowdQuestions)
