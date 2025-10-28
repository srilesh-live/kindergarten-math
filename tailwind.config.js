/**
 * Tailwind CSS Configuration for Kindergarten Math Adventure
 * Custom dark Material Design theme with accessibility focus
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom color palette
      colors: {
        // Base Material Dark colors
        'material': {
          'primary': '#1a1a2e',
          'secondary': '#16213e',
          'surface': '#1e1e30',
          'background': '#0f0f23',
          'variant': '#252542'
        },
        
        // Accent colors (soft pastels for kids)
        'accent': {
          'purple': '#9d4edd',
          'blue': '#5e60ce', 
          'teal': '#4cc9f0',
          'pink': '#f72585',
          'orange': '#fb8500',
          'green': '#06ffa5'
        },
        
        // Pastel variants for UI elements
        'pastel': {
          'purple': '#c77dff',
          'blue': '#7b68ee',
          'cyan': '#6dd5ed',
          'pink': '#ff9a9e', 
          'orange': '#feca57',
          'green': '#5fa8d3'
        },
        
        // Text colors optimized for readability
        'text': {
          'primary': '#e8eaed',
          'secondary': '#bdc1c6',
          'muted': '#9aa0a6',
          'accent': '#c77dff'
        },
        
        // Game-specific colors
        'game': {
          'number': '#9d4edd',
          'time': '#5e60ce',
          'pattern': '#4cc9f0', 
          'shape': '#06ffa5'
        }
      },
      
      // Typography system
      fontFamily: {
        'primary': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'Menlo', 'Monaco', 'monospace']
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      
      // Spacing scale for consistent layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '96': '24rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem'
      },
      
      // Border radius for Material Design
      borderRadius: {
        'material-sm': '8px',
        'material': '16px', 
        'material-lg': '24px',
        'material-xl': '32px'
      },
      
      // Box shadows for depth
      boxShadow: {
        'material-sm': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'material': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'material-lg': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'material-xl': '0 16px 64px rgba(0, 0, 0, 0.3)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.3)',
        'glow-blue': '0 0 20px rgba(94, 96, 206, 0.3)',
        'glow-teal': '0 0 20px rgba(76, 201, 240, 0.3)',
        'glow-pink': '0 0 20px rgba(247, 37, 133, 0.3)'
      },
      
      // Animation and transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms'
      },
      
      transitionTimingFunction: {
        'material': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      
      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(157, 78, 221, 0.5)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out', 
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite'
      },
      
      // Grid system
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(240px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(320px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(400px, 1fr))'
      },
      
      // Touch target sizes for accessibility
      minHeight: {
        'touch': '44px'
      },
      
      minWidth: {
        'touch': '44px'
      }
    }
  },
  
  plugins: [
    // Custom component classes
    function({ addComponents, theme }) {
      addComponents({
        // Button components
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.material'),
          fontSize: theme('fontSize.base[0]'),
          fontWeight: theme('fontWeight.semibold'),
          minHeight: theme('minHeight.touch'),
          minWidth: theme('minWidth.touch'),
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          
          '&:focus-visible': {
            outline: `3px solid ${theme('colors.accent.purple')}`,
            outlineOffset: '2px'
          }
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.accent.purple'),
          color: 'white',
          
          '&:hover': {
            backgroundColor: theme('colors.pastel.purple'),
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.material')
          },
          
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: theme('boxShadow.material-sm')
          }
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.material.surface'),
          color: theme('colors.text.primary'),
          border: `2px solid ${theme('colors.material.variant')}`,
          
          '&:hover': {
            backgroundColor: theme('colors.material.variant'),
            borderColor: theme('colors.accent.purple'),
            transform: 'translateY(-2px)'
          }
        },
        
        // Card components
        '.card': {
          backgroundColor: theme('colors.material.surface'),
          borderRadius: theme('borderRadius.material'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.material-sm'),
          border: '1px solid rgba(255, 255, 255, 0.1)',
          
          '&:hover': {
            boxShadow: theme('boxShadow.material'),
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out'
          }
        },
        
        '.card-interactive': {
          cursor: 'pointer',
          
          '&:hover': {
            boxShadow: theme('boxShadow.material-lg'),
            transform: 'translateY(-4px) scale(1.02)'
          },
          
          '&:active': {
            transform: 'translateY(-2px) scale(1.01)'
          }
        },
        
        // Game specific components
        '.game-card': {
          background: `linear-gradient(145deg, ${theme('colors.material.surface')}, ${theme('colors.material.variant')})`,
          borderRadius: theme('borderRadius.material-lg'),
          padding: theme('spacing.8'),
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          border: '2px solid transparent',
          position: 'relative',
          overflow: 'hidden',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: `linear-gradient(135deg, ${theme('colors.accent.purple')}, ${theme('colors.accent.blue')})`,
            opacity: '0',
            transition: 'opacity 0.3s ease',
            zIndex: '-1'
          },
          
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme('boxShadow.material-xl'),
            borderColor: theme('colors.accent.purple'),
            
            '&::before': {
              opacity: '0.1'
            }
          },
          
          '&:focus-visible': {
            outline: `3px solid ${theme('colors.accent.purple')}`,
            outlineOffset: '2px'
          }
        },
        
        // Loading and animation components
        '.loading-spinner': {
          width: '60px',
          height: '60px',
          border: `3px solid ${theme('colors.material.variant')}`,
          borderTop: `3px solid ${theme('colors.accent.purple')}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        },
        
        // Progress indicators
        '.progress-ring': {
          transform: 'rotate(-90deg)',
          
          'circle': {
            fill: 'none',
            strokeLinecap: 'round',
            strokeWidth: '3',
            transition: 'stroke-dashoffset 0.5s ease'
          }
        },
        
        // Touch optimizations
        '.touch-target': {
          minHeight: theme('minHeight.touch'),
          minWidth: theme('minWidth.touch'),
          padding: theme('spacing.3'),
          
          '@media (pointer: coarse)': {
            minHeight: '48px',
            minWidth: '48px',
            padding: theme('spacing.4')
          }
        }
      })
    }
  ]
};