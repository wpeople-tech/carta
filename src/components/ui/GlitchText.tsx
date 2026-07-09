import './GlitchText.css'

interface GlitchTextProps {
  children: string
  speed?: number
  enableShadows?: boolean
  enableOnHover?: boolean
  className?: string
}

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = '',
}: GlitchTextProps) {
  return (
    <div
      className={`glitch ${enableOnHover ? 'enable-on-hover' : ''} ${className}`}
      data-text={children}
      style={{
        '--after-duration': `${speed * 3}s`,
        '--before-duration': `${speed * 2}s`,
        '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
        '--before-shadow': enableShadows ? '5px 0 cyan' : 'none',
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
