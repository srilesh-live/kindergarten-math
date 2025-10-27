# Kindergarten Math - Static Version

A modern, accessible web application for kindergarten students to practice basic arithmetic operations.

## 🎯 Features

- **Four Math Operations**: Addition, subtraction, multiplication, and division
- **Customizable Settings**: Configure number ranges and operations
- **Smart Validation**: Prevents premature error feedback on multi-digit answers
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation, screen reader friendly, high contrast support
- **Audio Feedback**: Sound notification for incorrect answers
- **No Dependencies**: Pure HTML, CSS, and JavaScript

## 🚀 Quick Start

1. **Clone or download** the repository
2. **Open `index.html`** in a web browser
3. **Start practicing** math problems immediately!

For deployment:
1. Upload all files and directories to your web server
2. Maintain the directory structure with `assets/` folder
3. Access via your domain

## 📁 File Structure

```
kindergarten-math/
├── index.html                      # Landing page
├── assets/
│   ├── css/
│   │   └── main.css               # All styling and themes
│   └── js/
│       ├── script.js              # Main application logic
│       ├── auth.js                # Authentication management
│       ├── config.js              # Configuration settings
│       └── user-data.js           # User data management
├── pages/
│   ├── arithmetic.html            # Math practice application
│   └── number-sequences.html      # Number sequences (coming soon)
├── docs/                          # Documentation files
└── README.md                      # This file
```

## 🎨 Customization

### Adding New Themes

In `assets/css/main.css`, add new theme variables:

```css
[data-theme="custom"] {
    --primary-color: #your-color;
    --bg-color: #your-bg;
    /* ... other variables */
}
```

### Adding New Operations

In `assets/js/script.js`, extend the `generateNewProblem()` method:

```javascript
case 'your-operation':
    // Your logic here
    answer = /* calculation */;
    symbol = '※';
    break;
```

### Modifying Number Ranges

Update the default configuration in `assets/js/script.js`:

```javascript
this.config = {
    operations: ['addition'],
    minNumber: 1,        // Change this
    maxNumber: 10        // And this
};
```

## 🔧 Configuration Options

### Available Operations
- `addition` - Basic addition problems
- `subtraction` - Subtraction (no negative results)
- `multiplication` - Basic multiplication
- `division` - Division (no remainders)

### Number Range
- **Minimum**: 0-99
- **Maximum**: 1-100
- **Validation**: Automatic range checking

### Theme Options
- **Light Theme**: Default professional appearance
- **Dark Theme**: Easy on the eyes for low-light environments
- **Auto-save**: Theme preference persists across sessions

## 🎮 Usage

### Basic Operation
1. **View Problem**: Math problem displays in center
2. **Enter Answer**: Type numbers in the input field
3. **Get Feedback**: Immediate validation and progression
4. **Settings**: Click ⚙ icon to configure options

### Keyboard Shortcuts
- **Escape**: Close settings panel
- **Ctrl/Cmd + ,**: Open settings panel
- **Numbers**: Enter answers
- **Tab**: Navigate through settings

### Smart Features
- **Multi-digit Support**: No false errors while typing longer answers
- **Auto-progression**: Automatic new problem after correct answer
- **Audio Feedback**: Gentle beep sound for incorrect answers
- **Focus Management**: Automatic focus on answer input

## 🌐 Browser Compatibility

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅  
- **Safari** 12+ ✅
- **Edge** 79+ ✅
- **Mobile Browsers** ✅

### Required Features
- ES6+ JavaScript support
- CSS Custom Properties (CSS Variables)
- LocalStorage API
- Web Audio API (optional, for sound)

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (optimized spacing)
- **Mobile**: 320px-767px (compact layout)

### Mobile Optimizations
- Touch-friendly button sizes
- Simplified navigation
- Optimized font sizes
- Reduced spacing

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full app usable without mouse
- **Screen Reader**: ARIA labels and announcements
- **High Contrast**: Supports system high contrast mode
- **Reduced Motion**: Respects user motion preferences
- **Focus Indicators**: Clear focus states for all interactive elements

## 🔒 Privacy & Data

- **No External Requests**: Fully offline-capable
- **Local Storage Only**: Settings saved locally in browser
- **No Analytics**: No tracking or data collection
- **Child-Safe**: No external links or inappropriate content

## 🚀 Deployment Options

### GitHub Pages
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Select source branch
4. Access via `username.github.io/repo-name`

### Netlify
1. Drag folder to netlify.com/drop
2. Get instant deployment
3. Optional custom domain

### Traditional Hosting
1. Upload files via FTP/SFTP
2. Ensure proper file permissions
3. Test all functionality

### CDN Optimization
For better performance:
- Minify CSS and JavaScript
- Optimize images (if added)
- Enable gzip compression
- Set proper cache headers

## 🛠 Development

### Code Quality
- **ESLint**: Follows modern JavaScript standards
- **CSS**: BEM-inspired naming conventions
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for fast loading

### Testing Checklist
- [ ] All math operations work correctly
- [ ] Settings save and load properly
- [ ] Theme switching functions
- [ ] Responsive design on all screen sizes
- [ ] Keyboard navigation works
- [ ] Error handling for edge cases

### Performance Features
- **Efficient DOM Updates**: Minimal reflows and repaints
- **Event Delegation**: Optimized event handling
- **Debounced Input**: Prevents excessive validation calls
- **CSS Animations**: Hardware-accelerated transitions
- **Lazy Loading**: Settings panel loads on demand

## 🐛 Troubleshooting

### Common Issues

**Problem**: Settings don't save
**Solution**: Check localStorage permissions in browser

**Problem**: Audio doesn't work
**Solution**: Modern browsers require user interaction before audio

**Problem**: Theme doesn't persist
**Solution**: Ensure localStorage is enabled

**Problem**: Layout breaks on mobile
**Solution**: Check viewport meta tag is present

### Browser Developer Tools
Access debugging information:
```javascript
// In browser console
console.log(window.mathGame.getState());
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution
- Additional math operations
- New themes
- Accessibility improvements
- Performance optimizations
- Internationalization
- Additional sound effects

## 📞 Support

For issues or questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions
- Review this README for common problems

---

**Made with ❤️ for young learners**