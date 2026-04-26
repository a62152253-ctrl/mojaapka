import CodeEditor from '../components/CodeEditor';

export default function TestEditor() {
  return (
    <div style={{ height: "100vh", background: "#111", padding: "20px" }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Monaco Editor Test</h1>
      <CodeEditor 
        height="90vh" 
        language="javascript" 
        value="// Test Monaco Editor\nfunction hello() {\n  console.log('Hello DevBloxi!');\n}" 
        theme="dark" 
      />
    </div>
  );
}
