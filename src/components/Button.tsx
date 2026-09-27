import { cn } from '../lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20': variant === 'primary',
            'bg-slate-800 hover:bg-slate-700 text-slate-100': variant === 'secondary',
            'bg-red-600 hover:bg-red-500 text-white': variant === 'danger',
            'bg-transparent hover:bg-slate-800 text-slate-300': variant === 'ghost'
          },
          {
            'px-3 py-2 text-sm min-h-[40px]': size === 'sm',
            'px-4 py-3 text-sm min-h-[48px]': size === 'md',
            'px-6 py-4 text-base min-h-[52px]': size === 'lg'
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export default Button