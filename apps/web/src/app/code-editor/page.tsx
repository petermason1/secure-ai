'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor (only on client)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeProject {
  id: string;
  project_name: string;
  description?: string;
  language?: string;
  file_count: number;
}

interface CodeFile {
  id: string;
  file_path: string;
  file_name: string;
  file_content: string;
  language?: string;
}

export default function CodeEditorPage() {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadFiles(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedFile) {
      setFileContent(selectedFile.file_content);
    }
  }, [selectedFile]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/code-editor/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadFiles = async (projectId: string) => {
    try {
      const response = await fetch(`/api/code-editor/files?project_id=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
        if (data.files.length > 0 && !selectedFile) {
          setSelectedFile(data.files[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleCreateProject = async () => {
    const name = prompt('Project name:');
    if (!name) return;

    setLoading(true);
    try {
      const response = await fetch('/api/code-editor/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: name }),
      });

      const data = await response.json();
      if (data.success) {
        await loadProjects();
        setSelectedProject(data.project.id);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !selectedProject) return;

    setLoading(true);
    try {
      const response = await fetch('/api/code-editor/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          file_path: selectedFile.file_path,
          file_name: selectedFile.file_name,
          file_content: fileContent,
          language: selectedFile.language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('File saved!');
        await loadFiles(selectedProject);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !selectedProject) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/code-editor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          session_id: sessionId,
          message: userMessage,
          code_context: fileContent.substring(0, 2000),
          file_references: selectedFile ? [selectedFile.file_path] : [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure autocomplete
    if (autocompleteEnabled) {
      editor.onDidChangeCursorPosition(async (e: any) => {
        const model = editor.getModel();
        const position = e.position;
        const lineContent = model.getLineContent(position.lineNumber);
        const prefix = lineContent.substring(0, position.column - 1);

        if (prefix.length > 3 && selectedFile) {
          try {
            const response = await fetch('/api/code-editor/autocomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file_id: selectedFile.id,
                prefix_text: prefix,
                language: selectedFile.language,
                line_number: position.lineNumber,
                character_position: position.column,
              }),
            });

            const data = await response.json();
            if (data.success && data.completion) {
              // Could trigger autocomplete here
            }
          } catch (error) {
            // Silent fail for autocomplete
          }
        }
      });
    }
  };

  const detectLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'json': 'json',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="border-b border-white/10 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              💻 AI Code Editor
            </h1>
            <p className="text-sm text-slate-400">Cursor-like AI-powered code editor embedded in your app</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {showChat ? 'Hide' : 'Show'} AI Chat
            </button>
            {selectedFile && (
              <button
                onClick={handleSaveFile}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-4 py-2 rounded text-sm font-semibold"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-slate-900/60 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-white">Projects</h2>
              <button
                onClick={handleCreateProject}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                + New
              </button>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedProject === project.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {project.project_name}
                </button>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div>
              <h3 className="font-semibold text-white mb-2">Files</h3>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {file.file_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={detectLanguage(selectedFile.file_name)}
                value={fileContent}
                onChange={(value) => setFileContent(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  automaticLayout: true,
                  suggestOnTriggerCharacters: autocompleteEnabled,
                  quickSuggestions: autocompleteEnabled,
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-400 mb-4">Select a project and file to start coding</p>
                {projects.length === 0 && (
                  <button
                    onClick={handleCreateProject}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded font-semibold"
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-80 border-l border-white/10 bg-slate-900/60 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">AI Chat Assistant</h3>
              <p className="text-xs text-slate-400">Ask questions about your code</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask about your code..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

