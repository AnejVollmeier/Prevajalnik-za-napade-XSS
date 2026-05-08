import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analysisAPI } from '../api';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
             <Link
               key={analysis.id}
               to={`/analysis/${analysis.id}`}
               className={`rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${getRiskColor(analysis.scoreOverall)}`}
             >
               <div className="flex justify-between items-start mb-4">
                 <div className="flex-1">
                   <h3 className="text-lg font-semibold text-gray-800">
                     Analysis #{analysis.id}
                   </h3>
                   <p className="text-sm text-gray-600 mt-1">
                     {formatDate(analysis.createdAt)}
                   </p>
                 </div>
                 <div className="text-right">
                   <div className={`text-3xl font-bold ${getScoreColor(analysis.scoreOverall)}`}>
                     {analysis.scoreOverall}%
                   </div>
                   <p className="text-sm text-gray-600">Risk Score</p>
                 </div>
               </div>

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
           ))}
        </div>
      )}
    </div>
  );
}

