import { EmailTemplate } from './EmailTemplate'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

export async function renderEmail(props: {
  companyName: string
  jobTitle: string
  note: string
  customBody?: string
}) {
  // Create the element and render it to string
  const element = createElement(EmailTemplate, props)
  return renderToString(element)
} 