import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analysisAPI } from '../api';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [newName, setNewName] = useState('');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await analysisAPI.getList();
        setAnalyses(response.data);
      } catch (err) {
        setError('Failed to load analyses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const getRiskColor = (score) => {
    if (score === 0) return 'border-green-600 bg-gradient-to-r from-green-50 to-green-100';
    if (score < 30) return 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100';
    if (score < 60) return 'border-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100';
    return 'border-red-600 bg-gradient-to-r from-red-50 to-red-100';
  };

  const getScoreColor = (score) => {
    if (score === 0) return 'text-green-600';
    if (score < 30) return 'text-blue-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
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

  const handleRenameClick = (analysis) => {
    setRenameModalId(analysis.id);
    setNewName(analysis.name);
    setOpenMenuId(null);
  };

  const handleRenameSubmit = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setRenameLoading(true);
    try {
      await analysisAPI.updateName(renameModalId, newName);
      setAnalyses(
        analyses.map((a) =>
          a.id === renameModalId ? { ...a, name: newName } : a,
        ),
      );
      setRenameModalId(null);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to rename analysis');
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDeleteClick = (analysis) => {
    setDeleteModalId(analysis.id);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await analysisAPI.delete(deleteModalId);
      setAnalyses(analyses.filter((a) => a.id !== deleteModalId));
      setDeleteModalId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete analysis');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/analyze"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
        >
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No analyses yet</p>
          <Link
            to="/analyze"
            className="text-red-600 font-medium hover:underline"
          >
            Start your first analysis
          </Link>
        </div>
       ) : (
         <div className="grid gap-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className={`rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${getRiskColor(analysis.scoreOverall)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <Link
                    to={`/analysis/${analysis.id}`}
                    className="flex-1 hover:opacity-80"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {analysis.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </Link>
                  
                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === analysis.id ? null : analysis.id)}
                      className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      <span className="text-xl">•••</span>
                    </button>
                    
                    {openMenuId === analysis.id && (
                      <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                        <button
                          onClick={() => handleRenameClick(analysis)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteClick(analysis)}
                          className="block w-full text-left px-4 py-2 hover:bg-red-50 transition text-sm text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/analysis/${analysis.id}`} className="text-right ml-4">
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.scoreOverall)}`}>
                      {analysis.scoreOverall}%
                    </div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                  </Link>
                </div>

                <Link to={`/analysis/${analysis.id}`} className="hover:opacity-80">
                  <div className="flex gap-4 mb-4">
                    <div className="px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
                      🔴 High: {analysis.highCount}
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm font-medium text-yellow-600 bg-yellow-100">
                      🟡 Medium: {analysis.mediumCount}
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
                      🔵 Low: {analysis.lowCount}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Target: {analysis.target} | Input Mode: {analysis.inputMode}
                  </p>
                </Link>
              </div>
            ))}
         </div>
       )}

      {/* Rename Modal */}
      {renameModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rename Analysis</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRenameModalId(null);
                  setNewName('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={renameLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {renameLoading ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Delete Analysis</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this analysis? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

