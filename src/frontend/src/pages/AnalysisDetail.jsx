import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analysisAPI } from '../api';

export default function AnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await analysisAPI.getDetail(parseInt(id));
        setAnalysis(response.data);
      } catch (err) {
        setError('Failed to load analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-600">Analysis not found</p>
        </div>
      </div>
    );
  }

  const report = analysis.reportJson;
  
  const getRiskCardColor = (score) => {
    if (score === 0) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score < 30) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (score < 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Analysis #{analysis.id}</h1>
            <p className="text-gray-600 mt-2">{formatDate(analysis.createdAt)}</p>
          </div>
          <a
            href="/dashboard"
            className="text-red-600 font-medium hover:underline"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Risk Score Card */}
        <div className={`${getRiskCardColor(report.scoreOverall)} text-white rounded-lg shadow-lg p-8 mb-8`}>
          <div className="text-6xl font-bold text-center">{report.scoreOverall}%</div>
          <p className="text-center opacity-90 mt-2">Overall Risk Score</p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold">{report.summary.high}</div>
              <p className="opacity-90 mt-1">High Severity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{report.summary.medium}</div>
              <p className="opacity-90 mt-1">Medium Severity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{report.summary.low}</div>
              <p className="opacity-90 mt-1">Low Severity</p>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Target</p>
              <p className="font-medium text-gray-800">{report.target}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Input Mode</p>
              <p className="font-medium text-gray-800">{report.inputMode}</p>
            </div>
            {report.projectName && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Project Name</p>
                  <p className="font-medium text-gray-800">{report.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Files Analyzed</p>
                  <p className="font-medium text-gray-800">{report.fileCount}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Analyzed Code */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analyzed Code</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {analysis.code}
          </pre>
        </div>

        {/* Findings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Findings ({report.findings.length})
          </h2>

          {report.findings.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <p className="text-green-800 font-medium">✓ No XSS vulnerabilities detected!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.findings.map((finding, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-6 ${getSeverityColor(finding.severity)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSeverityBadge(finding.severity)}</span>
                      <div>
                        <p className="font-semibold text-lg">{finding.message}</p>
                        <p className="text-sm opacity-75">Rule: {finding.ruleId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">Line {finding.location.line}</span>
                      {finding.file && (
                        <p className="text-xs opacity-75 mt-1">{finding.file}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="font-medium text-sm mb-1">Code Snippet</p>
                      <pre className="bg-white bg-opacity-50 px-3 py-2 rounded text-xs overflow-x-auto">
                        {finding.snippet}
                      </pre>
                    </div>

                    <div>
                      <p className="font-medium text-sm mb-1">Recommendation</p>
                      <p className="text-sm">{finding.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

