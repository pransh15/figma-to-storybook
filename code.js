// Main plugin code that runs in the Figma environment
figma.showUI(__html__, { width: 400, height: 650 });

// Message handler for UI communication
figma.ui.onmessage = async (msg) => {
  console.log('Received message in plugin:', msg);
  
  if (msg.type === 'generate-storybook') {
    try {
      await generateStorybookFiles(msg.data);
    } catch (error) {
      console.error('Error generating storybook files:', error);
      figma.ui.postMessage({
        type: 'error',
        message: error.message
      });
    }
  } else if (msg.type === 'get-selection') {
    handleGetSelection();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  } else if (msg.type === 'debug-selection') {
    // Debug function to help troubleshoot
    const selection = figma.currentPage.selection;
    console.log('DEBUG - Selection details:', {
      count: selection.length,
      items: selection.map(node => ({
        name: node.name,
        type: node.type,
        id: node.id,
        hasWidth: 'width' in node,
        hasHeight: 'height' in node,
        width: 'width' in node ? node.width : 'N/A',
        height: 'height' in node ? node.height : 'N/A'
      }))
    });
    
    figma.ui.postMessage({
      type: 'debug-info',
      data: {
        selection: selection.map(node => ({
          name: node.name,
          type: node.type,
          id: node.id
        }))
      }
    });
  }
};

// Handle getting current selection
function handleGetSelection() {
  const selection = figma.currentPage.selection;
  
  console.log('Current selection:', selection.length, 'items');
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'no-selection',
      message: 'Please select a component or frame to export.'
    });
    return;
  }

  if (selection.length > 1) {
    figma.ui.postMessage({
      type: 'multiple-selection',
      message: 'Please select only one component or frame at a time.'
    });
    return;
  }

  const node = selection[0];
  console.log('Selected node:', node.type, node.name);
  
  // Check if it's a valid node type for export
  const validTypes = ['COMPONENT', 'COMPONENT_SET', 'FRAME', 'GROUP', 'INSTANCE'];
  if (!validTypes.includes(node.type)) {
    console.log('Invalid node type:', node.type);
    figma.ui.postMessage({
      type: 'invalid-selection',
      message: `Selected node type "${node.type}" is not supported. Please select a component, component set, frame, group, or component instance.`
    });
    return;
  }

  // Extract component information - ensure width and height exist
  let width = 0;
  let height = 0;
  
  try {
    if ('width' in node && 'height' in node) {
      width = Math.round(node.width);
      height = Math.round(node.height);
    }
  } catch (error) {
    console.log('Could not get dimensions:', error);
  }

  const componentInfo = {
    name: node.name,
    type: node.type,
    width: width,
    height: height,
    id: node.id
  };

  console.log('Sending component info:', componentInfo);

  figma.ui.postMessage({
    type: 'selection-info',
    data: componentInfo
  });
}

// Generate Storybook files
async function generateStorybookFiles(data) {
  console.log('Generating storybook files:', data);
  
  try {
    const { componentName, category, props } = data;
    
    // Validate input
    if (!componentName || componentName.trim() === '') {
      throw new Error('Component name is required');
    }

    if (!category) {
      throw new Error('Category is required');
    }

    // Clean component name for file naming
    const cleanName = componentName.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanName === '') {
      throw new Error('Component name must contain at least one alphanumeric character');
    }
    
    console.log('Clean component name:', cleanName);
    console.log('Props:', props);
    
    // Get current selection for additional context
    const selection = figma.currentPage.selection;
    let nodeInfo = null;
    
    if (selection.length === 1) {
      const node = selection[0];
      nodeInfo = {
        width: Math.round(node.width),
        height: Math.round(node.height),
        type: node.type,
        // Extract some styling information if available
        fills: node.fills ? node.fills : [],
        effects: node.effects ? node.effects : []
      };
    }
    
    // Generate the files content
    const componentContent = generateComponentFile(cleanName, props, nodeInfo);
    const storyContent = generateStoryFile(cleanName, category, props);
    const cssContent = generateCSSFile(cleanName, nodeInfo);
    const indexContent = generateIndexFile(cleanName);
    
    console.log('Generated files successfully');
    
    // Create the file structure
    const files = {
      [`${cleanName}/${cleanName}.jsx`]: componentContent,
      [`${cleanName}/${cleanName}.stories.js`]: storyContent,
      [`${cleanName}/${cleanName}.module.css`]: cssContent,
      [`${cleanName}/index.js`]: indexContent
    };

    console.log('File structure:', Object.keys(files));
    
    // Send files to UI for download
    figma.ui.postMessage({
      type: 'files-generated',
      data: {
        files,
        componentName: cleanName
      }
    });
    
    // Show notification
    figma.notify(`Generated ${Object.keys(files).length} files for ${cleanName}`);
    
  } catch (error) {
    console.error('Error in generateStorybookFiles:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
    figma.notify(`Error: ${error.message}`, { error: true });
  }
}

// Generate React component file
function generateComponentFile(componentName, props, nodeInfo) {
  const hasProps = props.length > 0;
  const propsDestructure = hasProps 
    ? `{ ${props.map(p => p.name).join(', ')} }`
    : '';

  // Generate prop types comment
  const propTypesComment = hasProps
    ? `/**
 * ${componentName} Component
 * 
 * @param {Object} props
${props.map(prop => ` * @param {${prop.type}} props.${prop.name} - ${prop.name} prop`).join('\n')}
 */`
    : `/**
 * ${componentName} Component
 */`;

  // Determine the main content based on props
  let componentContent = '';
  const textProp = props.find(p => p.type === 'string' && (p.name.toLowerCase().includes('text') || p.name.toLowerCase().includes('label') || p.name.toLowerCase().includes('title')));
  
  if (textProp) {
    componentContent = `<span className="text">{${textProp.name}}</span>`;
  } else {
    componentContent = '<div className="content">Component content</div>';
  }

  // Generate PropTypes if there are props
  const propTypesImport = hasProps ? "import PropTypes from 'prop-types';\n" : '';
  const propTypesDefinition = hasProps 
    ? `\n${componentName}.propTypes = {
${props.map(prop => `  ${prop.name}: PropTypes.${getPropType(prop.type)}${prop.defaultValue ? '' : '.isRequired'}`).join(',\n')}
};

${componentName}.defaultProps = {
${props.filter(p => p.defaultValue).map(prop => `  ${prop.name}: ${getDefaultValue(prop)}`).join(',\n')}
};`
    : '';

return `import React from 'react';
${propTypesImport}import styles from './${componentName}.module.css';

${propTypesComment}
export const ${componentName} = (${propsDestructure}) => {
  return (
    <div className={styles.${componentName.toLowerCase()}}>
      ${componentContent}
    </div>
  );
};
${propTypesDefinition}

export default ${componentName};`;
}

// Generate Storybook story file
function generateStoryFile(componentName, category, props) {
  const hasProps = props.length > 0;
  
  const argTypes = hasProps 
    ? `,
  argTypes: {
${props.map(prop => `    ${prop.name}: { 
      control: '${getControlType(prop.type)}',
      description: '${prop.name} property'
    }`).join(',\n')}
  }`
    : '';
  
  const defaultArgs = hasProps
    ? `
  args: {
${props.map(prop => `    ${prop.name}: ${getDefaultValue(prop)}`).join(',\n')}
  }`
    : '';

  return `import { ${componentName} } from './${componentName}';

export default {
  title: '${category}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A ${componentName} component generated from Figma.'
      }
    }
  }${argTypes}
};

// Default story
export const Default = {${defaultArgs}
};

// Interactive story with all controls
export const Interactive = {${defaultArgs}
};

${hasProps ? `// Example variations
export const Example = {
  args: {
${props.map(prop => `    ${prop.name}: ${getExampleValue(prop)}`).join(',\n')}
  }
};` : ''}`;
}

// Generate CSS module file with better styling
function generateCSSFile(componentName, nodeInfo) {
  const className = componentName.toLowerCase();
  
  // Extract dimensions and styling from Figma node if available
  let width = '200px';
  let height = 'auto';
  let backgroundColor = '#f5f5f5';
  let borderRadius = '8px';
  
  if (nodeInfo) {
    width = nodeInfo.width ? `${nodeInfo.width}px` : width;
    height = nodeInfo.height ? `${nodeInfo.height}px` : height;
    
    // Try to extract background color from fills
    if (nodeInfo.fills && nodeInfo.fills.length > 0) {
      const fill = nodeInfo.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        backgroundColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      }
    }
  }
  
  return `.${className} {
  /* Component container */
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${width};
  height: ${height};
  min-height: 40px;
  padding: 12px 24px;
  
  /* Visual styling */
  background-color: ${backgroundColor};
  border: 1px solid #e0e0e0;
  border-radius: ${borderRadius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  text-align: center;
  
  /* Interactions */
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;
}

.${className}:hover {
  background-color: ${backgroundColor === '#f5f5f5' ? '#ebebeb' : 'color-mix(in srgb, ' + backgroundColor + ', black 10%)'};
  border-color: #d0d0d0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.${className}:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.${className}:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Content styling */
.${className} .text {
  font-weight: inherit;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.${className} .content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .${className} {
    font-size: 13px;
    padding: 10px 20px;
    min-height: 36px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .${className} {
    transition: none;
  }
  
  .${className}:hover {
    transform: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .${className} {
    border-width: 2px;
    border-color: #000000;
  }
}`;
}

// Generate index.js file for easier importing
function generateIndexFile(componentName) {
  return `export { ${componentName} } from './${componentName}';
export { default } from './${componentName}';`;
}

// Helper functions
function getDefaultValue(prop) {
  switch (prop.type) {
    case 'string':
      return prop.defaultValue ? `"${prop.defaultValue}"` : '"Default text"';
    case 'number':
      return prop.defaultValue || '0';
    case 'boolean':
      return prop.defaultValue === 'true' || prop.defaultValue === true ? 'true' : 'false';
    case 'color':
      return prop.defaultValue ? `"${prop.defaultValue}"` : '"#000000"';
    default:
      return '""';
  }
}

function getExampleValue(prop) {
  switch (prop.type) {
    case 'string':
      return `"Example ${prop.name}"`;
    case 'number':
      return '42';
    case 'boolean':
      return 'true';
    case 'color':
      return '"#ff6b6b"';
    default:
      return '""';
  }
}

function getControlType(type) {
  switch (type) {
    case 'string':
      return 'text';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'color':
      return 'color';
    default:
      return 'text';
  }
}

function getPropType(type) {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'bool';
    case 'color':
      return 'string';
    default:
      return 'string';
  }
}

// Initialize plugin by checking selection
console.log('Plugin initialized');
handleGetSelection();