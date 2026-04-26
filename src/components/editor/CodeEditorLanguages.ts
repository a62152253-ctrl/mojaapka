import { LanguageConfig } from './CodeEditorTypes'

export const languageConfigs: LanguageConfig[] = [
  {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm', '.xhtml'],
    mimetypes: ['text/html'],
    aliases: ['html', 'xhtml'],
    defaultContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,
    snippets: [
      {
        name: 'HTML5 Template',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${1:Document Title}</title>
</head>
<body>
  \${2:Content}
</body>
</html>`,
        description: 'HTML5 document template'
      }
    ]
  },
  {
    id: 'css',
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass'],
    mimetypes: ['text/css', 'text/x-scss', 'text/x-sass'],
    aliases: ['css', 'scss', 'sass'],
    defaultContent: `/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`,
    snippets: [
      {
        name: 'CSS Reset',
        code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}`,
        description: 'CSS reset with modern font stack'
      },
      {
        name: 'Flexbox Container',
        code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.item {
  flex: 1;
  padding: 20px;
}`,
        description: 'Flexbox container with centered items'
      }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    mimetypes: ['text/javascript', 'application/javascript', 'text/jsx', 'application/jsx'],
    aliases: ['javascript', 'js', 'jsx', 'mjs', 'cjs'],
    defaultContent: `// JavaScript
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('DevBloxi'));`,
    snippets: [
      {
        name: 'Function Declaration',
        code: `function \${1:functionName}(\${2:parameters}) {
  \${3:// Function body}
  return \${4:returnValue};
}`,
        description: 'JavaScript function declaration'
      },
      {
        name: 'Arrow Function',
        code: `const \${1:functionName} = (\${2:parameters}) => {
  \${3:// Function body}
  return \${4:returnValue};
}`,
        description: 'ES6 arrow function'
      },
      {
        name: 'React Component',
        code: `import React from 'react';

const \${1:ComponentName} = () => {
  const [\${2:state}, set\${2:State}] = React.useState(\${3:initialValue});

  return (
    <div className="\${4:className}">
      <h1>\${5:title}</h1>
      <p>\${6:description}</p>
    </div>
  );
};

export default \${1:ComponentName};`,
        description: 'React functional component'
      }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    mimetypes: ['text/typescript', 'application/typescript', 'text/tsx', 'application/tsx'],
    aliases: ['typescript', 'ts', 'tsx'],
    defaultContent: `// TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

console.log(user);`,
    snippets: [
      {
        name: 'Interface Declaration',
        code: `interface \${1:InterfaceName} {
  \${2:properties}
}`,
        description: 'TypeScript interface declaration'
      },
      {
        name: 'Type Alias',
        code: `type \${1:TypeName} = \${2:TypeDefinition};`,
        description: 'TypeScript type alias'
      },
      {
        name: 'React Component with Props',
        code: `import React from 'react';

interface \${1:ComponentName}Props {
  \${2:props}
}

const \${1:ComponentName}: React.FC<\${1:ComponentName}Props> = (\${2:props}) => {
  return (
    <div className="\${3:className}">
      <h1>\${4:title}</h1>
      <p>\${5:description}</p>
    </div>
  );
};

export default \${1:ComponentName};`,
        description: 'React component with TypeScript props'
      }
    ]
  },
  {
    id: 'php',
    name: 'PHP',
    extensions: ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps'],
    mimetypes: ['text/php', 'application/x-httpd-php', 'application/php'],
    aliases: ['php', 'phtml'],
    defaultContent: `<?php
// PHP Script
$name = "DevBloxi";
$version = "1.0";

echo "Hello, " . $name . "! (Version " . $version . ")\\n";

// Function example
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet($name);
?>`,
    snippets: [
      {
        name: 'PHP Function',
        code: `function \${1:functionName}(\${2:parameters}) {
  \${3:// Function body}
  return \${4:returnValue};
}`,
        description: 'PHP function declaration'
      },
      {
        name: 'PHP Class',
        code: `class \${1:ClassName} {
  private \${2:property}: \${2:type};
  
  public function __construct(\${3:constructorParams}) {
    \${4:// Constructor body}
  }
  
  public function \${5:methodName}(\${6:methodParams}) {
    \${7:// Method body}
    return \${8:returnValue};
  }
}`,
        description: 'PHP class with constructor and method'
      },
      {
        name: 'PHP Array',
        code: `$array = [
  \${1:item1},
  \${2:item2},
  \${3:item3}
];

// Loop through array
foreach ($array as $item) {
  echo $item . "\\n";
}`,
        description: 'PHP array creation and iteration'
      }
    ]
  },
  {
    id: 'python',
    name: 'Python',
    extensions: ['.py', '.pyw', '.pyi'],
    mimetypes: ['text/x-python', 'text/x-python-script', 'application/x-python-code'],
    aliases: ['python', 'py', 'pyw', 'pyi'],
    defaultContent: `# Python Script
def main():
    name = "DevBloxi"
    version = "1.0"
    
    print(f"Hello, {name}! (Version {version})")
    
    # Function example
    def greet(name):
        return f"Hello, {name}!"
    
    print(greet(name))

if __name__ == "__main__":
    main()`,
    snippets: [
      {
        name: 'Python Function',
        code: `def \${1:function_name}(\${2:parameters}):
    """\${3:docstring}"""
    \${4:// Function body}
    return \${5:return_value}`,
        description: 'Python function with docstring'
      },
      {
        name: 'Python Class',
        code: `class \${1:ClassName}:
    def __init__(self, \${2:init_params}):
        \${3:// Constructor body}
        self.\${4:attribute} = \${4:value}
    
    def \${5:method_name}(self, \${6:method_params}):
        """\${7:docstring}"""
        \${8:// Method body}
        return \${9:return_value}`,
        description: 'Python class with init method'
      },
      {
        name: 'Python List Comprehension',
        code: `# List comprehension
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
filtered = [x for x in numbers if x % 2 == 0]

print(f"Numbers: {numbers}")
print(f"Squared: {squared}")
print(f"Even: {filtered}")`,
        description: 'Python list comprehensions'
      }
    ]
  },
  {
    id: 'go',
    name: 'Go',
    extensions: ['.go'],
    mimetypes: ['text/x-go', 'application/x-go'],
    aliases: ['go'],
    defaultContent: `package main

import "fmt"

func main() {
    name := "DevBloxi"
    version := "1.0"
    
    fmt.Printf("Hello, %s! (Version %s)\\n", name, version)
    
    // Function example
    greet := func(name string) string {
        return fmt.Sprintf("Hello, %s!", name)
    }
    
    fmt.Println(greet(name))
}`,
    snippets: [
      {
        name: 'Go Function',
        code: `func \${1:function_name}(\${2:parameters}) \${3:return_type} {
    \${4:// Function body}
    return \${5:return_value}
}`,
        description: 'Go function with type annotations'
      },
      {
        name: 'Go Struct',
        code: `type \${1:StructName} struct {
    \${2:field1} \${2:type1}
    \${3:field2} \${3:type2}
}

func (\${1:StructName}) \${4:method_name}() \${4:return_type} {
    \${5:// Method body}
    return \${6:return_value}
}`,
        description: 'Go struct with method'
      },
      {
        name: 'Go Slice',
        code: `// Slice operations
numbers := []int{1, 2, 3, 4, 5}
numbers = append(numbers, 6)
numbers = numbers[1:4] // Slice from index 1 to 3

fmt.Printf("Numbers: %v\\n", numbers)`,
        description: 'Go slice operations'
      }
    ]
  },
  {
    id: 'rust',
    name: 'Rust',
    extensions: ['.rs'],
    mimetypes: ['text/x-rust', 'text/x-rust-script'],
    aliases: ['rust', 'rs'],
    defaultContent: `// Rust Program
fn main() {
    let name = "DevBloxi";
    let version = "1.0";
    
    println!("Hello, {}! (Version {})", name, version);
    
    // Function example
    greet(name);
}

fn greet(name: &str) {
    println!("Hello, {}!", name);
}`,
    snippets: [
      {
        name: 'Rust Function',
        code: `fn \${1:function_name}(\${2:parameters}) -> \${3:return_type} {
    \${4:// Function body}
    \${5:return_value}
}`,
        description: 'Rust function with type annotations'
      },
      {
        name: 'Rust Struct',
        code: `struct \${1:StructName} {
    \${2:field1}: \${2:type1},
    \${3:field2}: \${3:type2},
}

impl \${1:StructName} {
    fn \${4:method_name}(&self) -> \${5:return_type} {
        \${6:// Method body}
        \${7:return_value}
    }
}`,
        description: 'Rust struct with implementation'
      },
      {
        name: 'Rust Vector',
        code: `use std::vec::Vec;

fn main() {
    let mut numbers: Vec<i32> = vec![1, 2, 3];
    numbers.push(4);
    
    for num in &numbers {
        println!("{}", num);
    }
}`,
        description: 'Rust vector operations'
      }
    ]
  },
  {
    id: 'json',
    name: 'JSON',
    extensions: ['.json'],
    mimetypes: ['application/json', 'text/json'],
    aliases: ['json'],
    defaultContent: `{
  "name": "DevBloxi",
  "version": "1.0.0",
  "type": "platform",
  "features": ["code editor", "monaco", "languages"],
  "users": 0
}`,
    snippets: [
      {
        name: 'JSON Object',
        code: `{
  "\${1:key}": "\${2:value}",
  "\${3:key}": "\${3:value}",
  "\${4:key}": "\${4:value}"
}`,
        description: 'JSON object structure'
      },
      {
        name: 'JSON Array',
        code: `[
  "\${1:item1}",
  "\${2:item2}",
  "\${3:item3}"
]`,
        description: 'JSON array structure'
      }
    ]
  },
  {
    id: 'xml',
    name: 'XML',
    extensions: ['.xml', '.xhtml'],
    mimetypes: ['application/xml', 'text/xml'],
    aliases: ['xml'],
    defaultContent: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <title>DevBloxi</title>
  <version>1.0</version>
  <description>Code editor platform</description>
</root>`,
    snippets: [
      {
        name: 'XML Element',
        code: `<\${1:tag_name} \${2:attributes}>
  \${3:content}
</\${1:tag_name}>`,
        description: 'XML element with attributes'
      }
    ]
  },
  {
    id: 'sql',
    name: 'SQL',
    extensions: ['.sql'],
    mimetypes: ['text/sql', 'application/sql'],
    aliases: ['sql'],
    defaultContent: `-- SQL Query
SELECT * FROM users WHERE id = 1;

-- Insert statement
INSERT INTO users (name, email, created_at) 
VALUES ('John Doe', 'john@example.com', NOW());`,
    snippets: [
      {
        name: 'SELECT Statement',
        code: `SELECT \${1:columns} FROM \${2:table} \${3:conditions}`,
        description: 'SQL SELECT query'
      },
      {
        name: 'INSERT Statement',
        code: `INSERT INTO \${1:table} (\${2:columns})
VALUES (\${3:values});`,
        description: 'SQL INSERT statement'
      }
    ]
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extensions: ['.md', '.markdown'],
    mimetypes: ['text/markdown', 'text/x-markdown'],
    aliases: ['md', 'markdown'],
    defaultContent: `# DevBloxi

## Features

- **Code Editor**: Monaco Editor with syntax highlighting
- **Multiple Languages**: Support for 10+ programming languages
- **Real-time Preview**: Live preview for HTML/CSS/JS
- **Collaboration**: Share and edit code together

## Getting Started

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
const example = 'Hello World';
console.log(example);
\`\`\`

---

Built with ❤️ by the DevBloxi team`,
    snippets: [
      {
        name: 'Header',
        code: `# \${1:header_text}

\${2:header_content}

---`,
        description: 'Markdown header'
      },
      {
        name: 'Link',
        code: `[\${1:link_text}](\${2:url})`,
        description: 'Markdown link'
      },
      {
        name: 'Code Block',
        code: `\`\`\${1:language}
\${2:code}
\`\`\``,
        description: 'Code block with syntax highlighting'
      }
    ]
  }
]

export const getLanguageByExtension = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) return 'plaintext';
  
  const config = languageConfigs.find(lang => 
    lang.extensions.includes(`.${extension}`)
  );
  
  return config?.id || 'plaintext';
}

export const getLanguageConfig = (languageId: string): LanguageConfig | undefined => {
  return languageConfigs.find(lang => lang.id === languageId);
}

export const getAllLanguages = (): LanguageConfig[] => {
  return languageConfigs;
}

export const getLanguageById = (id: string): LanguageConfig => {
  return languageConfigs.find(lang => lang.id === id) || languageConfigs[0]
}

export const getLanguageFromContent = (content: string): LanguageConfig => {
  // Simple content-based language detection
  if (content.includes('<!DOCTYPE') || content.includes('<html')) {
    return getLanguageById('html')
  }
  if (content.includes('<?php')) {
    return getLanguageById('php')
  }
  if (content.includes('def ') || content.includes('import ') || content.includes('from ')) {
    return getLanguageById('python')
  }
  if (content.includes('package main') || content.includes('func main()')) {
    return getLanguageById('go')
  }
  if (content.includes('fn main()') || content.includes('use std::')) {
    return getLanguageById('rust')
  }
  if (content.includes('type ') && content.includes('{')) {
    return getLanguageById('graphql')
  }
  if (content.includes(': ') && content.includes('- ')) {
    return getLanguageById('yaml')
  }
  if (content.includes('FROM ') || content.includes('FROM ')) {
    return getLanguageById('dockerfile')
  }
  if (content.includes('#!/bin/bash') || content.includes('#!/bin/sh')) {
    return getLanguageById('bash')
  }
  if (content.includes('SELECT ') || content.includes('INSERT ') || content.includes('UPDATE ')) {
    return getLanguageById('sql')
  }
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    return getLanguageById('json')
  }
  if (content.includes('<?xml') || content.includes('<root>')) {
    return getLanguageById('xml')
  }
  if (content.includes('# ') || content.includes('## ')) {
    return getLanguageById('markdown')
  }
  if (content.includes('function ') || content.includes('const ') || content.includes('let ') || content.includes('var ')) {
    return content.includes(': ') && content.includes('interface ') ? getLanguageById('typescript') : getLanguageById('javascript')
  }
  if (content.includes('{') && content.includes(':') && content.includes(';')) {
    return getLanguageById('css')
  }
  
  return getLanguageById('plaintext')
}

export default getLanguageByExtension
