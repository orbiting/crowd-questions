import React from 'react'
import { compose } from 'react-apollo'

import {
  DiscussionContext,
  CommentComposer,
  CommentComposerPlaceholder
} from '@project-r/styleguide'


import { withSubmitComment } from '../lib/queries'

const Composer = props => {
  const { discussion, t } = props

  /*
   * isActive: true if we show the CommentComposer, false if we show the CommentComposerPlaceholder.
   * showPreferences: …
   */
  const [isActive, setActive] = React.useState(false)

  const submitComment = ({ text, tags }) =>
    props.submitComment(text, tags).then(
      () => {
        setActive(false)
        return { ok: true }
      },
      error => ({ error: `${error}` })
    )

  if (isActive) {
    /*
     * We don't fully initialize the DiscussionContext value. We only set fields which are
     * required by the CommentComposer.
     */
    const discussionContextValue = {
      discussion: { ...discussion },
  
      actions: {
        /* openDiscussionPreferences: () => {
          setShowPreferences(true)
        } */
      }
    }

    return (
      <DiscussionContext.Provider value={discussionContextValue}>
        <CommentComposer
          t={t}
          isRoot
          hideHeader
          onClose={() => { setActive(false) }}
          onSubmit={submitComment}
          onSubmitLabel={t('styleguide/CommentComposer/answer')} />
      </DiscussionContext.Provider>
    )
  } else {
    return (
      <CommentComposerPlaceholder
        t={t}
        displayAuthor={{} /* impersonal format */ }
        onClick={() => { setActive(true) }}
      />
    )
  }
}

export default withSubmitComment(Composer)
