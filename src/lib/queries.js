import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

export const fragments = {
  comment: gql`
    fragment CrowdQuestionComment on Comment {
      id
      content
      published
      adminUnpublished
      downVotes
      upVotes
      userVote
      userCanEdit
    }
  `,
  discussion: gql`
    fragment CrowdQuestionDiscussion on Discussion {
      id
      closed
      title
      path
      userPreference {
        anonymity
        credential {
          description
          verified
        }
        notifications
      }
      rules {
        maxLength
        minInterval
        anonymity
        disableTopLevelComments
      }
      userWaitUntil
      userCanComment
      displayAuthor {
        id
        name
        slug
        credential {
          description
          verified
        }
        profilePicture
      }
      document {
        id
        meta {
          path
          template
          ownDiscussion {
            id
            closed
          }
          linkedDiscussion {
            id
            path
            closed
          }
        }
      }
      collapsable
      tagRequired
      tags
    }
  `
}

const getDiscussion = gql`
query getCrowdDiscussion($first: Int!, $after: String, $orderBy: DiscussionOrder, $discussionId: ID!) {
  discussion(id: $discussionId) {
    ...CrowdQuestionDiscussion
    comments(first: $first, after: $after, orderBy: $orderBy, orderDirection: DESC) {
      id
      totalCount
      nodes {
        ...CrowdQuestionComment
        comments {
          nodes {
            ...CrowdQuestionComment
          }
        }
      }
    }
  }
}
${fragments.discussion}
${fragments.comment}
`

export const withComments = (defaultProps = {}) => graphql(getDiscussion, {
  options: ({ discussionId, orderBy, first }) => {
    return {
      variables: {
        discussionId,
        orderBy: defaultProps.orderBy || 'DATE',
        first: defaultProps.first || 10
      }
    }
  },
  props: ({ data, ownProps }) => ({
    data,
    fetchMore: ({ after }) =>
      data.fetchMore({
        variables: {
          after
        },
        updateQuery: (previousResult, { fetchMoreResult, queryVariables }) => {
          const nodes = [
            ...previousResult.comments.nodes,
            ...fetchMoreResult.comments.nodes
          ]
          return {
            ...previousResult,
            totalCount: fetchMoreResult.comments.pageInfo.hasNextPage
              ? fetchMoreResult.comments.totalCount
              : nodes.length,
            comments: {
              ...previousResult.comments,
              ...fetchMoreResult.comments,
              nodes
            }
          }
        }
      })
  })
})


export const upvoteCommentQuery = gql`
mutation discussionUpvoteComment($commentId: ID!) {
  upvoteComment(id: $commentId) {
    ...CrowdQuestionComment
  }
}
${fragments.comment}
`

export const downvoteCommentQuery = gql`
mutation discussionDownvoteComment($commentId: ID!) {
  downvoteComment(id: $commentId) {
    ...CrowdQuestionComment
  }
}
${fragments.comment}
`

export const unvoteCommentMutation = gql`
mutation unvoteComment($commentId: ID!) {
  unvoteComment(id: $commentId) {
    ...CrowdQuestionComment
  }
}
${fragments.comment}
`

export const submitCommentMutation = gql`
mutation submitComment($discussionId: ID!, $content: String!, $tags: [String!]!) {
  submitComment(discussionId: $discussionId, content: $content, tags: $tags) {
    ...CrowdQuestionComment
    discussion {
      id
      userPreference {
        notifications
      }
      userWaitUntil
    }
  }
}
${fragments.comment}
`

export const withSubmitComment = 
  graphql(submitCommentMutation, {
    props: ({ mutate, ownProps }) => ({
      submitComment: (content, tags = []) => {
        console.log({ ownProps })

        const {
          discussion,
          t,
          discussionId,
          parentId: ownParentId,
          orderBy,
          depth,
          focusId,
          discussionDisplayAuthor: displayAuthor
        } = ownProps

        /*
         * Generate a new UUID for the comment. We do this client-side so that we can
         * properly handle subscription notifications.
         */
        /* const id = uuid()
        submittedComments.add(id)

        const { parentId, parentIds } = parent
          ? { parentId: parent.id, parentIds: parent.parentIds.concat(parent.id) }
          : { parentId: null, parentIds: [] } */

        return mutate({
          variables: { discussionId: discussion.id, content, tags }
          /*
          optimisticResponse: {
            __typename: 'Mutation',
            submitComment: {
              __typename: 'Comment',
              id,
              ...optimisticContent(content),
              published: true,
              adminUnpublished: false,
              userCanEdit: true,
              downVotes: 0,
              upVotes: 0,
              userVote: null,
              displayAuthor,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentIds,
              tags
            }
          }, 
          update: (proxy, { data: { submitComment: comment } }) => {
            debug('submitComment', comment)
            const variables = {
              discussionId,
              parentId: ownParentId,
              after: null,
              orderBy,
              depth,
              focusId
            }

            proxy.writeQuery({
              query: discussionQuery,
              variables,
              data: produce(
                proxy.readQuery({ query: discussionQuery, variables }),
                mergeComment({ displayAuthor, comment })
              )
            })
          } */
        }).catch(e => Promise.reject(errorToString(e.message)))
      }
    })
  })

export const errorToString = error => error.graphQLErrors && error.graphQLErrors.length
  ? error.graphQLErrors.map(e => e.message).join(', ')
  : error.toString()
