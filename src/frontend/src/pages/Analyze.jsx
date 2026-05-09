import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { analysisAPI } from '../api';

export default function Analyze() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [analysisMode, setAnalysisMode] = useState('single'); // 'single', 'project', or 'github'
  const [projectFiles, setProjectFiles] = useState({}); // {filename: code}
  const [githubUrl, setGithubUrl] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (analysisMode === 'single') {
      if (!code.trim()) {
        setError('Please enter some code to analyze');
        return;
      }

      setLoading(true);
      try {
        const response = await analysisAPI.submit('dom-js', 'paste', code);
        navigate(`/analysis/${response.data.analysisId}`);
      } catch (err) {
        setError(err.response?.data?.error || 'Analysis failed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (analysisMode === 'project') {
      // Project analysis
      if (Object.keys(projectFiles).length === 0) {
        setError('Please upload a project file');
        return;
      }

      setLoading(true);
      try {
        const response = await analysisAPI.submitProject('dom-js', projectName, projectFiles);
        navigate(`/analysis/${response.data.analysisId}`);
      } catch (err) {
        setError(err.response?.data?.error || 'Analysis failed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (analysisMode === 'github') {
      // GitHub analysis
      if (!githubUrl.trim()) {
        setError('Please enter a GitHub repository URL');
        return;
      }

      setLoading(true);
      try {
        const response = await analysisAPI.submitGithub('dom-js', githubUrl);
        navigate(`/analysis/${response.data.analysisId}`);
      } catch (err) {
        setError(err.response?.data?.error || 'Analysis failed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const processZipFile = async (file) => {
    try {
      console.log('Processing ZIP file:', file.name);
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const files = {};
      let jsFileCount = 0;

      // Files/patterns to exclude
      const excludePatterns = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.venv',
        'env',
        '__pycache__',
        '.next',
        '.nuxt',
        '.cache',
      ];

      const shouldExclude = (filePath) => {
        const parts = filePath.split('/');
        return excludePatterns.some((pattern) => 
          parts.some((part) => part.includes(pattern))
        );
      };

      // Extract all .js files
      for (const [relativePath, fileObj] of Object.entries(zipContent.files)) {
        if (
          !fileObj.dir &&
          relativePath.endsWith('.js') &&
          !shouldExclude(relativePath)
        ) {
          const content = await fileObj.async('text');
          if (content.length <= 50000) { // Max 50KB per file
            files[relativePath] = content;
            jsFileCount++;
          }
        }
      }

      console.log('Found', jsFileCount, 'JavaScript files');

      if (jsFileCount === 0) {
        setError('No JavaScript files found in project (excluding node_modules, dist, etc.)');
        return;
      }

      setProjectFiles(files);
      setFileCount(jsFileCount);
      setProjectName(file.name.replace('.zip', ''));
      setAnalysisMode('project');
      setCode(''); // Clear any previous code
      setFileName('');
      setError('');
    } catch (err) {
      console.error('ZIP processing error:', err);
      setError('Failed to process ZIP file: ' + err.message);
    }
  };

  const handleFileRead = (content, name) => {
    setCode(content);
    setFileName(name);
    setError('');
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    if (file.name.endsWith('.zip')) {
      // Handle ZIP file (async)
      processZipFile(file);
    } else if (file.name.endsWith('.js')) {
      // Handle single JS file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (content.length > 200000) {
          setError('File is too large (max 200KB)');
          return;
        }
        setCode(content);
        setFileName(file.name);
        setProjectFiles({});
        setFileCount(0);
        setProjectName('');
        setAnalysisMode('single');
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsText(file);
    } else {
      setError('Please select a .js or .zip file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Analyze Code</h1>
        <p className="text-gray-600 mb-8">
          Upload a .js file, whole project (.zip), paste code, or add a GitHub repository to check for XSS vulnerabilities
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => {
              setAnalysisMode('single');
              setCode('');
              setFileName('');
              setProjectFiles({});
              setFileCount(0);
              setProjectName('');
              setGithubUrl('');
              setError('');
            }}
            className={`px-4 py-2 font-medium transition ${
              analysisMode === 'single'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Paste Code
          </button>
          <button
            onClick={() => {
              setAnalysisMode('project');
              setCode('');
              setFileName('');
              setProjectFiles({});
              setFileCount(0);
              setProjectName('');
              setGithubUrl('');
              setError('');
            }}
            className={`px-4 py-2 font-medium transition ${
              analysisMode === 'project'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upload Project
          </button>
          <button
            onClick={() => {
              setAnalysisMode('github');
              setCode('');
              setFileName('');
              setProjectFiles({});
              setFileCount(0);
              setProjectName('');
              setGithubUrl('');
              setError('');
            }}
            className={`px-4 py-2 font-medium transition ${
              analysisMode === 'github'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            GitHub Repository
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {analysisMode === 'github' ? 'GitHub Repository URL' : 'JavaScript Code'}
              <span className="text-red-600">*</span>
            </label>

            {/* GitHub Mode - URL Input */}
            {analysisMode === 'github' && (
              <div>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the full GitHub repository URL (e.g., https://github.com/facebook/react)
                </p>
              </div>
            )}

            {/* Single/Project Mode - File Upload */}
            {(analysisMode === 'single' || analysisMode === 'project') && (
              <>
                {/* Drag and Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition ${
                    dragActive
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".js,.zip"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-gray-700 font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {analysisMode === 'single'
                        ? 'Supported: .js files (max 200KB)'
                        : 'Supported: .zip files with multiple JavaScript files'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-medium"
                    >
                      Select File
                    </button>
                  </div>
                </div>

                {fileName && analysisMode === 'single' && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                    ✓ File loaded: <strong>{fileName}</strong>
                  </div>
                )}

                {fileCount > 0 && analysisMode === 'project' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                    ✓ Project loaded: <strong>{projectName}</strong> ({fileCount} JavaScript files found)
                  </div>
                )}

                {/* Or Divider - only show if single file mode */}
                {analysisMode === 'single' && (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Textarea */}
                    <label className="block text-gray-700 font-medium mb-2">
                      Paste Code Directly
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your DOM JavaScript code here..."
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {code.length.toLocaleString()} / 200,000 characters
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || (analysisMode === 'single' ? !code.trim() : analysisMode === 'project' ? fileCount === 0 : !githubUrl.trim())}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : `Analyze ${analysisMode === 'github' ? 'Repository' : analysisMode === 'project' ? 'Project' : 'Code'}`}
            </button>

            <button
              type="button"
              onClick={() => {
                setCode('');
                setFileName('');
                setProjectFiles({});
                setFileCount(0);
                setProjectName('');
                setGithubUrl('');
                setAnalysisMode('single');
                setError('');
              }}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Example Vulnerable Code</h3>
          <pre className="bg-white border border-blue-200 rounded p-4 overflow-x-auto text-xs">
{`// Example 1: Unsafe innerHTML
const userInput = getUserInput();
document.getElementById('content').innerHTML = userInput;

// Example 2: Unsafe eval
eval(userInput);

// Example 3: Unsafe document.write
document.write(userInput);`}
          </pre>
        </div>
      </div>
    </div>
  );
}

