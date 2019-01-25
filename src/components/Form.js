import React, { Component } from 'react';

import {Button, Dropdown, Field, Interaction, InlineSpinner} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'
import { css } from 'glamor'
import isEmail from 'validator/lib/isEmail'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

const styles = {
 autoSize: css({
   minHeight: 40,
   paddingTop: '7px !important',
   paddingBottom: '6px !important',
   background: 'transparent'
 })
}

function validateTextfield(content) {
  if (content.length > 500) {
    return 'Text zu lang'
  } else {
    return null
  }
  }

function validateEmailAdress(email){
 if (isEmail(email)) {
  return null
 } else {
  return 'Geben sie eine gültige E-Mail-Adresse an' 
 }
}

class Form extends Component {
    constructor(props) {
    super(props);
    this.state = {
      category: null,
      email: props.data.me
        ? props.data.me.email
        : '',
      validateEmail: false,
      content: "",
      submitted: false,
      loading: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.email) {
      return null
    }
    if (props.data.me) {
      return {
        email: props.data.me.email
      }
    }
    return null
  }

  render() {
    const dropdownItems = [
      {value: "REALESTATE", text: "Immobilien"},
      {value: "CASH", text: "Bargeld, Einlagen, Schuldtitel"},
      {value: "SHARES", text: "Aktien"},
      {value: "COLLECTIVE_INVESTMENTS", text: "Anteile an kollektiven Kapitaleinlagen"}
    ];

    const email = this.state.email
    const emailInValid = validateEmailAdress(email)
    const content = this.state.content
    const textInValid = validateTextfield(content)
    const textLength = 500-content.length

    if (this.state.submitted) {
      return <Success />
    }

   return (
    <div>
      <Field 
        label='E-Mail-Adresse'
        type= "email"
        value={email}
        error={this.state.validateEmail && emailInValid}
        onChange = {(e, value, isValidating) => {
          this.setState({email: value, validateEmail: isValidating})
        }}
      />
      <Dropdown
        label='Ihr Erbe'
        items={dropdownItems}
        value={this.state.category || ''}
        onChange={(event) => {
          this.setState({
            category: event.target
              ? event.target.value
              : event.value
          })
        }}
      />
      <Field 
        label='Ihre Geschichte' 
        error={content && textInValid}
        value={this.state.content}
        renderInput={(inputProps) => (
          <AutosizeInput
            {...styles.autoSize}
            {...inputProps}
          />
         )}
        onChange={(e) => {
          this.setState({content: e.target.value})
        }}
      />
      <div style={{display:"flex", justifyContent: "flex-end"}}>
        <Interaction.P style={{marginTop: -15}}>{textLength}</Interaction.P>
      </div>
      <div style={{marginTop:10, display:"flex", justifyContent: "flex-end"}}>
      {this.state.loading ? 
        <InlineSpinner size={26} /> 
        :<Button 
          disabled={emailInValid || !this.state.category || textInValid || this.state.content === ""}
          primary 
          onClick={() => {
            //loading-->
            this.setState({loading: true})
            //setTimeout(() => {
            this.props.onSubmit(this.state.email, this.state.content, this.state.category)
              .then(() => this.setState({ submitted: true }))
              .catch((err) => console.error(err))
            //}, 500)
          }}
        >
          Senden
        </Button>
        }
      </div>
    </div>
  ); //return end
 } //render end
} //form end

const query = gql`
  query myEmail {
    me {
      id
      email
    }
  }
`
const mutation = gql`
  mutation submitStory($email: String!, $content: String!, $category: InheritanceStoryCategory! ) {
  submitInheritanceStory(email: $email, content: $content, category: $category 
)
}`

const FormWithQuery = compose(
  graphql(query),
  graphql(mutation, {
    props: ({ mutate }) => ({
      onSubmit: (email, content, category) =>
        mutate({ variables: { email, content, category } })
    })
  })
)(Form)

class Success extends Component {
  render() {
    return  (
      <div style={{minHeight:300,display: "flex", alignItems: "center", justifyContent:"center"}}>
        <Interaction.H3>Vielen Dank für Ihre Teilnahme.</Interaction.H3>
      </div>
    )
  }
}

export default FormWithQuery;