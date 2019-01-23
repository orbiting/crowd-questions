import React, { Component } from 'react';

import {Button, Dropdown, Field, Interaction} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'
import { css } from 'glamor'
import isEmail from 'validator/lib/isEmail'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const styles = {
 autoSize: css({
   minHeight: 40,
   paddingTop: '7px !important',
   paddingBottom: '6px !important',
   background: 'transparent'
 })
}

function validateTextfield(text) {
  if (text.length > 500) {
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
      text: "",
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
      {value: "I", text: "Immobilien"},
      {value: "B", text: "Bargeld, Einlagen, Schuldtitel"},
      {value: "A", text: "Aktien"},
      {value: "K", text: "Anteile an kollektiven Kapitaleinlagen"}
    ];

    const email = this.state.email
    const emailInValid = validateEmailAdress(email)
    const text = this.state.text
    const textInValid = validateTextfield(text)
    const textLength = 500-text.length

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
        error={text && textInValid}
        value={this.state.text}
        renderInput={(inputProps) => (
          <AutosizeInput
            {...styles.autoSize}
            {...inputProps}
          />
         )}
        onChange={(e) => {
          this.setState({text: e.target.value})
        }}
      />
      <div style={{display:"flex", justifyContent: "flex-end"}}>
        <Interaction.P style={{marginTop: -15}}>{textLength}</Interaction.P>
      </div>
      <div style={{marginTop:10, display:"flex", justifyContent: "flex-end"}}>
        <Button 
          disabled={emailInValid || !this.state.category || textInValid || this.state.text === ""}
          primary 
          onClick={() => this.props.onSubmit(this.state)}
        >
          Senden
        </Button>
      </div>
    </div>
  )};
 }

const query = gql`
  query myEmail {
    me {
      id
      email
    }
  }
`
const FormWithQuery = graphql(query)(Form)

class Success extends Component {
  render() {
    return  (
      <div style={{minHeight:300,display: "flex", alignItems: "center", justifyContent:"center"}}>
        <Interaction.H3>Success!</Interaction.H3>
      </div>
    )
  }
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
    };
  }

  render() {
    if (this.state.success == true){
      return <Success />
    } else {
      return <FormWithQuery 
        onSubmit={(e) => {
          this.setState({success : true})
          }
        } 
      />
    }

  }

}

export default App;