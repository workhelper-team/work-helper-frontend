import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

function Button({ children, ...rest }: ButtonProps) {
  return (
    <button className="btn" {...rest}>
      {children}
    </button>
  )
}

export default Button
