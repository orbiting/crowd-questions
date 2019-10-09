import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

export const meQuery = gql`
query CrowdQuestionMe {
  me {
    id
    username
    name
    firstName
    lastName
    email
    initials
    roles
  }
}
`

export default graphql(meQuery, {
  props: ({ data }) => ({
    me: data.me
  })
})
