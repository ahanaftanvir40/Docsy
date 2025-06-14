"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Share2, Loader2, Mail, UserCheck } from "lucide-react";
import { shareDocument } from "@/lib/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

interface ShareDocumentPayload {
  email: string;
  documentId: string;
  role: "viewer" | "editor";
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: ({ email, role, documentId }: ShareDocumentPayload) =>
      shareDocument(email, documentId, role),
    onSuccess: (data) => {
      //   console.log("Document shared successfully:", data);

      setEmail("");
      setRole("viewer");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      alert(`Document "${documentTitle}" shared successfully!`);
    },
    onError: (error: any) => {
      console.error("Failed to share document:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to share document";
      alert(`Error: ${errorMessage}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    shareMutation.mutate({ email, role, documentId });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Share Document
              </h2>
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {documentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="block w-full pl-10 pr-3 py-3 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={shareMutation.isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("viewer")}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    role === "viewer"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                  disabled={shareMutation.isPending}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium">Viewer</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Can view only</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("editor")}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    role === "editor"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                  disabled={shareMutation.isPending}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium">Editor</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Can view and edit
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={shareMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={shareMutation.isPending || !email.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {shareMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>
                {shareMutation.isPending ? "Sharing..." : "Share Document"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
