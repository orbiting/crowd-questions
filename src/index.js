import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import CrowdQuestions from './components/CrowdQuestions'

const Wrapper = ({ discussionId }) => {
  return <CrowdQuestions discussionId={discussionId} />
}

export default Wrapper
