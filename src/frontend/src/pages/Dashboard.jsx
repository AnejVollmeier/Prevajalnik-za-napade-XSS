import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analysisAPI, foldersAPI } from "../api";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [newName, setNewName] = useState("");
  const [moveModalId, setMoveModalId] = useState(null);
  const [targetFolderId, setTargetFolderId] = useState("");
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");

  const fetchData = async () => {
    try {
      const [resAnalyses, resFolders] = await Promise.all([
        analysisAPI.getList(),
        foldersAPI.getList(),
      ]);
      setAnalyses(resAnalyses.data);
      setFolders(resFolders.data);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (score) => {
    if (score === 0)
      return "border-green-600 bg-gradient-to-r from-green-50 to-green-100";
    if (score < 30)
      return "border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100";
    if (score < 60)
      return "border-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100";
    return "border-red-600 bg-gradient-to-r from-red-50 to-red-100";
  };

  const getScoreColor = (score) => {
    if (score === 0) return "text-green-600";
    if (score < 30) return "text-blue-600";
    if (score < 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRenameClick = (analysis) => {
    setRenameModalId(analysis.id);
    setNewName(analysis.name);
    setOpenMenuId(null);
  };

  const handleRenameSubmit = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
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
      setNewName("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to rename analysis");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleMoveClick = (analysis) => {
    setMoveModalId(analysis.id);
    setTargetFolderId(analysis.folderId || "");
    setOpenMenuId(null);
  };

  const handleMoveSubmit = async () => {
    try {
      const folderVal = targetFolderId ? parseInt(targetFolderId) : null;
      await analysisAPI.updateName(moveModalId, undefined, folderVal);
      setAnalyses(
        analyses.map((a) =>
          a.id === moveModalId ? { ...a, folderId: folderVal } : a,
        ),
      );
      setMoveModalId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to move analysis");
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
      setError(err.response?.data?.error || "Failed to delete analysis");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      if (editingFolder) {
        await foldersAPI.update(editingFolder.id, folderName);
      } else {
        await foldersAPI.create(folderName);
      }
      setShowFolderModal(false);
      setFolderName("");
      setEditingFolder(null);
      fetchData();
    } catch (err) {
      alert("Napaka pri shranjevanju mape");
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (
      confirm("Ali res želis izbrisati to mapo? Analize ne bodo izbrisane.")
    ) {
      try {
        await foldersAPI.delete(id);
        if (activeFolderId === id) setActiveFolderId(null);
        fetchData();
      } catch (err) {
        alert("Napaka pri brisanju mape");
      }
    }
  };

  const displayedAnalyses = analyses.filter((a) => {
    if (activeFolderId === null) return true;
    if (activeFolderId === -1) return a.folderId === null;
    return a.folderId === activeFolderId;
  });

  return (
    <div className="container py-8 flex gap-8 flex-col md:flex-row">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Folders</h2>
            <button
              onClick={() => {
                setEditingFolder(null);
                setFolderName("");
                setShowFolderModal(true);
              }}
              className="text-red-600 hover:text-red-800 font-bold text-xl"
            >
              +
            </button>
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveFolderId(null)}
                className={`w-full text-left px-3 py-2 rounded-md ${activeFolderId === null ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
              >
                All Analyses
              </button>
            </li>
            {folders.map((folder) => (
              <li
                key={folder.id}
                className="group flex justify-between items-center"
              >
                <button
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-md ${activeFolderId === folder.id ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
                >
                  📁 {folder.name}
                </button>
                <div className="hidden group-hover:flex space-x-1 pr-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                      setFolderName(folder.name);
                      setShowFolderModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            <li>
              <button
                onClick={() => setActiveFolderId(-1)}
                className={`w-full text-left px-3 py-2 rounded-md ${activeFolderId === -1 ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
              >
                Uncategorized
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            {activeFolderId === null
              ? "Dashboard"
              : activeFolderId === -1
                ? "Uncategorized"
                : folders.find((f) => f.id === activeFolderId)?.name ||
                  "Dashboard"}
          </h1>
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
        ) : displayedAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No analyses in this folder
            </p>
            <Link
              to="/analyze"
              className="text-red-600 font-medium hover:underline"
            >
              Start your first analysis
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedAnalyses.map((analysis) => (
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
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === analysis.id ? null : analysis.id,
                        )
                      }
                      className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      <span className="text-xl">•••</span>
                    </button>

                    {openMenuId === analysis.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                        <button
                          onClick={() => handleRenameClick(analysis)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleMoveClick(analysis)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                        >
                          Move to Folder
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

                  <Link
                    to={`/analysis/${analysis.id}`}
                    className="text-right ml-4"
                  >
                    <div
                      className={`text-3xl font-bold ${getScoreColor(analysis.scoreOverall)}`}
                    >
                      {analysis.scoreOverall}%
                    </div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                  </Link>
                </div>

                <Link
                  to={`/analysis/${analysis.id}`}
                  className="hover:opacity-80"
                >
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
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingFolder ? "Edit Folder" : "New Folder"}
            </h2>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moveModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Move Analysis
            </h2>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            >
              <option value="">-- Uncategorized --</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMoveModalId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Rename Analysis
            </h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleRenameSubmit()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRenameModalId(null);
                  setNewName("");
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
                {renameLoading ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete Analysis
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this analysis? This action cannot
              be undone.
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
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
