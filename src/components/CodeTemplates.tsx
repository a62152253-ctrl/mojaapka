import { useState } from 'react'
import { Code, FileText, Database, Globe, Smartphone, Palette, Cpu, Zap } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  files: Array<{
    name: string
    content: string
    language: string
  }>
}

interface CodeTemplatesProps {
  onSelectTemplate: (template: Template) => void
}

export default function CodeTemplates({ onSelectTemplate }: CodeTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const templates: Template[] = [
    {
      id: 'basic-html',
      name: 'Basic HTML Page',
      description: 'Simple HTML5 boilerplate with semantic structure',
      category: 'web',
      icon: <FileText className="w-6 h-6" />,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8fafc;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      background: white;
      padding: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Welcome to My Project</h1>
    </header>
    <main>
      <p>This is a basic HTML template to get you started!</p>
    </main>
  </div>
</body>
</html>`,
          language: 'html'
        }
      ]
    },
    {
      id: 'react-app',
      name: 'React App',
      description: 'Modern React application with hooks and components',
      category: 'web',
      icon: <Zap className="w-6 h-6" />,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    button { background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      const [count, setCount] = useState(0);

      return (
        <div className="container">
          <h1>React App</h1>
          <div className="card">
            <h2>Counter: {count}</h2>
            <button onClick={() => setCount(count + 1)}>
              Increment
            </button>
          </div>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>`,
          language: 'html'
        }
      ]
    },
    {
      id: 'vue-app',
      name: 'Vue.js App',
      description: 'Vue 3 application with Composition API',
      category: 'web',
      icon: <Zap className="w-6 h-6" />,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue.js App</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    button { background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #059669; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const { createApp, ref, computed } = Vue;

    createApp({
      setup() {
        const count = ref(0);
        const doubled = computed(() => count.value * 2);

        return {
          count,
          doubled
        };
      },
      template: \`
        <div class="container">
          <h1>Vue.js App</h1>
          <div class="card">
            <h2>Count: {{ count }}</h2>
            <h2>Doubled: {{ doubled }}</h2>
            <button @click="count++">Increment</button>
          </div>
        </div>
      \`
    }).mount('#app');
  </script>
</body>
</html>`,
          language: 'html'
        }
      ]
    },
    {
      id: 'express-api',
      name: 'Express API',
      description: 'Node.js REST API with Express framework',
      category: 'backend',
      icon: <Database className="w-6 h-6" />,
      files: [
        {
          name: 'server.js',
          content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express API!' });
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: Date.now(), name, email };
  res.status(201).json(newUser);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
          language: 'javascript'
        }
      ]
    },
    {
      id: 'react-native',
      name: 'React Native',
      description: 'Mobile app template with React Native',
      category: 'mobile',
      icon: <Smartphone className="w-6 h-6" />,
      files: [
        {
          name: 'App.js',
          content: `import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView } from 'react-native';

export default function App() {
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      setSubmittedName(name);
      setName('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>React Native App</Text>
        <Text style={styles.subtitle}>Mobile Development Template</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Enter your name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
        
        <Button
          title="Submit"
          onPress={handleSubmit}
          style={styles.button}
        />

        {submittedName ? (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              Hello, {submittedName}! 👋
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  result: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#065f46',
    fontWeight: '600',
  },
});`,
          language: 'javascript'
        }
      ]
    },
    {
      id: 'css-animations',
      name: 'CSS Animations',
      description: 'Modern CSS animations and transitions',
      category: 'web',
      icon: <Palette className="w-6 h-6" />,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Animations</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
    }

    .animation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    /* Pulse Animation */
    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    /* Rotate Animation */
    .rotate {
      animation: rotate 3s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Bounce Animation */
    .bounce {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-30px); }
      60% { transform: translateY(-15px); }
    }

    /* Fade Animation */
    .fade {
      animation: fade 3s infinite;
    }

    @keyframes fade {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }

    .demo-element {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #3b82f6, #8b5cf6);
      border-radius: 12px;
      margin: 20px auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Animations Showcase</h1>
    
    <div class="animation-grid">
      <div class="card">
        <h2>Pulse</h2>
        <div class="demo-element pulse"></div>
        <p>Smooth scaling animation that creates a breathing effect.</p>
      </div>

      <div class="card">
        <h2>Rotate</h2>
        <div class="demo-element rotate"></div>
        <p>Continuous rotation animation with linear timing.</p>
      </div>

      <div class="card">
        <h2>Bounce</h2>
        <div class="demo-element bounce"></div>
        <p>Playful bouncing animation with easing.</p>
      </div>

      <div class="card">
        <h2>Fade</h2>
        <div class="demo-element fade"></div>
        <p>Opacity transition that creates a ghost effect.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
          language: 'html'
        }
      ]
    }
  ]

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Apps' },
    { id: 'backend', name: 'Backend APIs' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Choose a Template</h2>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors border border-gray-600 hover:border-blue-500"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                {template.icon}
              </div>
              <div>
                <h3 className="text-white font-medium">{template.name}</h3>
                <p className="text-gray-400 text-xs">{template.category}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{template.description}</p>
            <div className="mt-3 text-xs text-gray-500">
              {template.files.length} file{template.files.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No templates found in this category</p>
        </div>
      )}
    </div>
  )
}
