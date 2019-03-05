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
  `
}

const getDiscussion = gql`
query getCrowdDiscussion($first: Int!, $after: String, $orderBy: DiscussionOrder, $discussionId: ID!) {
  discussion(id: $discussionId) {
    title
    closed
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

