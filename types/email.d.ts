declare module '@react-email/components' {
  import { ReactNode } from 'react'

  interface BaseProps {
    children?: ReactNode
    style?: React.CSSProperties
  }

  export function Html(props: BaseProps): JSX.Element
  export function Body(props: BaseProps): JSX.Element
  export function Container(props: BaseProps): JSX.Element
  export function Text(props: BaseProps): JSX.Element
  export function Link(props: BaseProps & { href: string }): JSX.Element
  export function Preview(props: BaseProps): JSX.Element
  export function Section(props: BaseProps): JSX.Element
  export function Heading(props: BaseProps): JSX.Element
} 