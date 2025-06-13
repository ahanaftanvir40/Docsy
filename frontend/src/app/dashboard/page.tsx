"use client";
import React, { useState } from "react";
import { useAuth } from "@/Providers/AuthProvider";
import { useSearch } from "@/Providers/SearchProvider";
import { useQuery } from "@tanstack/react-query";

import {
  FileText,
  Plus,
  Filter,
  MoreVertical,
  Share2,
  Users,
  Clock,
  Star,
  Grid3X3,
  List,
  Edit3,
  Trash2,
  Copy,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { getDocuments } from "@/lib/api";
import Link from "next/link";

interface IDocument {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface ISharedDocument {
  authorId?: string;
  document: IDocument;
  role: "viewer" | "editor";
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<"my-docs" | "shared-docs">(
    "my-docs"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { searchQuery } = useSearch();
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  console.log("Documents Data:", data);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load documents
          </h3>
          <p className="text-gray-500 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const myDocs: IDocument[] = data?.data.documents || [];
  const sharedDocs: ISharedDocument[] = data?.data.sharedDocuments || [];
  // Get current documents based on active tab
  const currentDocs = activeTab === "my-docs" ? myDocs : sharedDocs;
  console.log("Current Documents:", currentDocs);

  // Filter documents based on search query
  const filteredDocs = currentDocs.filter((item) => {
    if (activeTab === "my-docs") {
      const doc = item as IDocument;
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const sharedDoc = item as ISharedDocument;
      return sharedDoc.document.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }
  });

  console.log("Filtered Documents:", filteredDocs);

  const handleDocumentAction = (action: string, docId: string) => {
    console.log(`${action} document ${docId}`);
    setShowDropdown(null);
  };

  const DocumentCard = ({
    doc,
    isShared = false,
  }: {
    doc: IDocument;
    isShared?: boolean;
  }) => (
    <Link href={`/document/${doc._id}`}>
      <div className="group bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isShared ? "Shared" : "You"} •{" "}
                  {new Date(
                    doc.updatedAt || doc.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isShared && <Share2 className="w-4 h-4 text-blue-500" />}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(showDropdown === doc._id ? null : doc._id);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                {showDropdown === doc._id && (
                  <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <button
                        onClick={() => handleDocumentAction("open", doc._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={() => handleDocumentAction("edit", doc._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDocumentAction("share", doc._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentAction("duplicate", doc._id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentAction("download", doc._id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => handleDocumentAction("delete", doc._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {doc.content ? doc.content.slice(0, 100) + "..." : "No content"}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Updated{" "}
                  {new Date(
                    doc.updatedAt || doc.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const DocumentListItem = ({
    doc,
    isShared = false,
  }: {
    doc: IDocument;
    isShared?: boolean;
  }) => (
    <div className="group bg-white border border-gray-200 rounded-lg hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="p-4 flex items-center space-x-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {doc.title}
            </h3>
            {isShared && (
              <Share2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {isShared ? "Shared" : "You"} •{" "}
            {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() =>
              setShowDropdown(showDropdown === doc._id ? null : doc._id)
            }
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showDropdown === doc._id && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-2">
                <button
                  onClick={() => handleDocumentAction("open", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open</span>
                </button>
                <button
                  onClick={() => handleDocumentAction("edit", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDocumentAction("share", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => handleDocumentAction("duplicate", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => handleDocumentAction("download", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => handleDocumentAction("delete", doc._id)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Documents
          </h1>
          <p className="text-gray-600">
            Manage and collaborate on your documents
          </p>
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("my-docs")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === "my-docs"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Documents ({myDocs.length})
            </button>
            <button
              onClick={() => setActiveTab("shared-docs")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === "shared-docs"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Shared with Me ({sharedDocs.length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first document to get started"}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25 flex items-center space-x-2 mx-auto">
              <Plus className="w-4 h-4" />
              <span>Create Document</span>
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
            }
          >
            {filteredDocs.map((item) => {
              if (activeTab === "my-docs") {
                const doc = item as IDocument;
                return viewMode === "grid" ? (
                  <DocumentCard key={doc._id} doc={doc} />
                ) : (
                  <DocumentListItem key={doc._id} doc={doc} />
                );
              } else {
                const sharedDoc = item as ISharedDocument;
                return viewMode === "grid" ? (
                  <DocumentCard
                    key={sharedDoc.document._id}
                    doc={sharedDoc.document}
                    isShared={true}
                  />
                ) : (
                  <DocumentListItem
                    key={sharedDoc.document._id}
                    doc={sharedDoc.document}
                    isShared={true}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
