import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const getComments = gql`
query getComments(
  $first: Int!,
  $after: String,
  $orderBy: DiscussionOrder,
  $discussionId: ID,
  $lastId: ID
) {
  comments(
    first: $first,
    after: $after,
    orderBy: $orderBy,
    discussionId: $discussionId,
    lastId: $lastId,
    orderDirection: DESC
  ) {
      id
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        text
        content
        published
        adminUnpublished
        downVotes
        upVotes
        userVote
        score
        userCanEdit
        preview(length:240) {
          string
          more
        }
        displayAuthor {
          id
          name
          username
          credential {
            description
            verified
          }
          profilePicture
        }
        updatedAt
        createdAt
        parentIds
        tags
        discussion {
          id
          title
          path
          document {
            id
            meta {
              title
              path
              credits
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
        }
      }
    }
}
`



export const withComments = (defaultProps = {}) => graphql(getComments, {
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

export const fragments = {
  comment: gql`
    fragment CrowdQuestionComment on Comment {
      id
      text
      content
      published
      adminUnpublished
      downVotes
      upVotes
      userVote
      userCanEdit
      displayAuthor {
        id
        name
        username
        credential {
          description
          verified
        }
        profilePicture
      }
      updatedAt
      createdAt
      parentIds
      tags
    }
  `
}


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

