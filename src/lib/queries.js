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
  props: ({ data, ownProps, refetch }) => ({
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

        return mutate({
          variables: { discussionId: discussion.id, content, tags }
        }).catch(e => Promise.reject(errorToString(e)))
      }
    })
  })

export const errorToString = error => error.graphQLErrors && error.graphQLErrors.length
  ? error.graphQLErrors.map(e => e.message).join(', ')
  : error.toString()
