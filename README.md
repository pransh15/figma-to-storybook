# Figma to Storybook Plugin

A Figma plugin that automatically generates React components and Storybook stories from your Figma designs.

## Features

- 🎨 **Direct Figma Integration**: Export components directly from Figma
- ⚛️ **React Components**: Generates modern React components with hooks
- 📚 **Storybook Stories**: Creates comprehensive Storybook stories
- 🎛️ **Custom Props**: Add and configure component properties
- 💅 **CSS Modules**: Generates styled CSS modules based on Figma design
- 📦 **Multiple Download Options**: ZIP archive, individual files, or clipboard copy
- 🔧 **PropTypes Support**: Automatic PropTypes generation for type safety
- 📱 **Responsive Design**: Generated CSS includes responsive and accessibility features

## Installation

1. **Development Setup**:
   ```bash
   git clone https://github.com/your-username/figma-to-storybook-plugin
   cd figma-to-storybook-plugin
   ```

2. **Install in Figma**:
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest`
   - Select the `manifest.json` file from this project

## Usage

### Basic Export Process

1. **Select a Component**: Choose any component, frame, or group in Figma
2. **Open Plugin**: `Plugins` → `Development` → `Figma to Storybook.js`
3. **Configure Settings**:
   - Enter component name (must start with capital letter)
   - Choose Storybook category (Atoms, Molecules, Organisms, Templates, Pages)
   - Add optional props with types and default values
4. **Generate Files**: Click "Generate" button
5. **Download**: Choose from multiple download options

### Download Options

The plugin offers three ways to get your generated files:

#### 📦 Archive Download
- Downloads all files in a single text archive
- Easy to extract and organize in your project
- Best for complete file sets

#### 📋 Copy to Clipboard
- Copies all file contents to your clipboard
- Perfect for quick pasting into code editors
- Includes clear file separators

#### 📄 Individual Files
- Downloads each file separately
- Browser downloads each file one by one
- Good for selective file usage

### Component Props Configuration

You can add custom props to your components:

- **Prop Name**: JavaScript property name (e.g., `label`, `isDisabled`)
- **Type**: Choose from `string`, `number`, `boolean`, or `color`
- **Default Value**: Set default value for the prop

### Generated File Structure

The plugin generates four files for each component:

```
ComponentName/
├── ComponentName.jsx          # React component
├── ComponentName.stories.js   # Storybook stories
├── ComponentName.module.css   # CSS modules styling
└── index.js                   # Export helper
```

## Generated Code Examples

### React Component
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './MyButton.module.css';

/**
 * MyButton Component
 * 
 * @param {Object} props
 * @param {string} props.label - label prop
 */
export const MyButton = ({ label }) => {
  return (
    <div className={styles.mybutton}>
      <span className="text">{label}</span>
    </div>
  );
};

MyButton.propTypes = {
  label: PropTypes.string.isRequired
};

export default MyButton;
```

### Storybook Story
```javascript
import { MyButton } from './MyButton';

export default {
  title: 'Atoms/MyButton',
  component: MyButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A MyButton component generated from Figma.'
      }
    }
  },
  argTypes: {
    label: { 
      control: 'text',
      description: 'label property'
    }
  }
};

export const Default = {
  args: {
    label: "Click me"
  }
};

export const Interactive = {
  args: {
    label: "Click me"
  }
};

export const Example = {
  args: {
    label: "Example label"
  }
};
```

## Troubleshooting

### Download Issues
- **Archive not downloading**: Try the clipboard or individual file options
- **Files not saving**: Check browser download permissions
- **Empty files**: Ensure component is properly selected in Figma

### Component Issues
- **Invalid component name**: Must start with capital letter, alphanumeric only
- **No selection**: Select a component, frame, or group before generating
- **Multiple selections**: Select only one item at a time

### Plugin Not Loading
- Ensure Figma Desktop App is updated
- Check manifest.json is valid
- Restart Figma after installing plugin

## Development

### File Structure
- `code.js`: Main plugin logic (runs in Figma)
- `ui.html`: Plugin interface (runs in browser)
- `manifest.json`: Plugin configuration
- `package.json`: Project metadata

### Key Functions
- `handleGetSelection()`: Validates Figma selection
- `generateStorybookFiles()`: Creates file content
- `generateComponentFile()`: React component generation
- `generateStoryFile()`: Storybook story generation
- `generateCSSFile()`: CSS modules with Figma styling

### Debugging
- Open browser dev tools while plugin UI is open
- Check Figma console: `Help` → `Toggle Developer Tools`
- Use `console.log()` statements for debugging

## Supported Figma Elements

- ✅ Components and Component Sets
- ✅ Frames and Groups  
- ✅ Component Instances
- ❌ Text layers (as individual components)
- ❌ Shape layers (as individual components)

## Browser Compatibility

- ✅ Chrome/Chromium browsers
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Figma
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### Version 1.2.0
- ✅ Fixed file download issues
- ✅ Added multiple download options
- ✅ Improved CSS generation with Figma styling
- ✅ Added PropTypes support
- ✅ Better error handling and user feedback
- ✅ Enhanced component generation logic

### Version 1.0.0
- Initial release with basic functionality

## Support

If you encounter issues:
1. Check this README for solutions
2. Open an issue on GitHub
3. Include Figma version and browser details
4. Provide steps to reproduce the problem
