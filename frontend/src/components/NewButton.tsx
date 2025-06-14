"use client";
import React from "react";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createDocument } from "@/lib/api";
import { useRouter } from "next/navigation";

function NewButton() {
  const router = useRouter();
  const createDocumentMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      router.push(`/document/${data.data._id}`);
    },
  });

  const handleNewDocument = () => {
    createDocumentMutation.mutate();
  };

  return (
    <div>
      <button
        onClick={handleNewDocument}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25 flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>New Document</span>
      </button>
    </div>
  );
}

export default NewButton;
