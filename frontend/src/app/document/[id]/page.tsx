"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentById, updateDocument } from "@/lib/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import {
  Save,
  ArrowLeft,
  Share2,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import ShareModal from "@/components/ShareModal";
import { useAuth } from "@/Providers/AuthProvider";

interface IConnectedUser {
  id: string;
  fullname: string;
  avatar: string;
}

interface IDocument {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function SingleDoc() {
  const params = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isViewer = role === "viewer";
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const { user, isAuthenticated, isLoading: AuthLoader } = useAuth();
  const editorRef = useRef<any>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isReceivingUpdate = useRef(false);
  const [connectedUsers, setConnectedUsers] = useState<IConnectedUser[]>([]);
  const filteredConnectedUsers = connectedUsers.filter(
    (connectedUser) => connectedUser.id !== user?._id
  );

  const [title, setTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(
    null
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !AuthLoader) {
      router.push("/SignIn");
    }
  }, [isAuthenticated, router, AuthLoader]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      updateDocument(id, { title, content }),
    onSuccess: (data, variables) => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      queryClient.setQueryData(["document", id], (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              title: variables.title,
              content: variables.content,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return oldData;
      });

      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      // console.error("Failed to save document:", error);
    },
  });

  useEffect(() => {
    if (data?.data) {
      const doc = data.data as IDocument;
      setTitle(doc.title);
      setLastSaved(new Date(doc.updatedAt));
    }
  }, [data?.data?._id]);

  useEffect(() => {
    if (!hasUnsavedChanges || !data?.data) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSaveWithCursorPreservation();
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, hasUnsavedChanges, data?.data]);

  const handleAutoSaveWithCursorPreservation = () => {
    if (title.trim() && editorRef.current && !updateMutation.isPending) {
      const editor = editorRef.current;
      const bookmark = editor.selection.getBookmark(2, true);

      const content = editor.getContent({ format: "text" });
      updateMutation.mutate(
        { title: title.trim(), content },
        {
          onSuccess: () => {
            setTimeout(() => {
              if (editorRef.current && bookmark) {
                try {
                  editorRef.current.selection.moveToBookmark(bookmark);
                  if (document.activeElement !== titleInputRef.current) {
                    editorRef.current.focus();
                  }
                } catch (e) {
                  if (document.activeElement !== titleInputRef.current) {
                    editorRef.current.focus();
                  }
                }
              }
            }, 0);
          },
        }
      );
    }
  };

  const handleSaveWithCursorPreservation = () => {
    if (title.trim() && editorRef.current) {
      const editor = editorRef.current;
      const bookmark = editor.selection.getBookmark(2, true);

      const content = editor.getContent({ format: "text" });
      updateMutation.mutate(
        { title: title.trim(), content },
        {
          onSuccess: () => {
            setTimeout(() => {
              if (editorRef.current && bookmark) {
                try {
                  editorRef.current.selection.moveToBookmark(bookmark);
                  if (document.activeElement !== titleInputRef.current) {
                    editorRef.current.focus();
                  }
                } catch (e) {
                  if (document.activeElement !== titleInputRef.current) {
                    editorRef.current.focus();
                  }
                }
              }
            }, 0);
          },
        }
      );
    }
  };

  const handleSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    handleSaveWithCursorPreservation();
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleTitleBlur = () => {
    if (hasUnsavedChanges && title.trim()) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      handleAutoSaveWithCursorPreservation();
    }
  };

  const handleEditorChange = (content: string) => {
    setHasUnsavedChanges(true);
    if (socketRef.current && !isReceivingUpdate.current) {
      socketRef.current.emit("documentChange", { documentId: id, content });
    }
  };
  const handlerShare = () => {
    if (id) {
      setSelectedDocument(data.data);
      setShareModalOpen(true);
    }
  };

  useEffect(() => {
    if (!id || !user?._id) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", id, user._id);
    });

    socket.on("connectedUsers", (users: IConnectedUser[]) => {
      setConnectedUsers(users);
    });

    socket.on("documentChange", (content: string) => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const bookmark = editor.selection.getBookmark(2, true);

        isReceivingUpdate.current = true;
        editor.setContent(content, { format: "text" });

        setTimeout(() => {
          try {
            editor.selection.moveToBookmark(bookmark);
            editor.focus();
          } catch (error) {
            editor.focus();
          }
          isReceivingUpdate.current = false;
        }, 0);
      }
    });

    socket.on("onDisconnect", (userId: string) => {
      setConnectedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user?._id]);

  if (AuthLoader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load document
          </h3>
          <p className="text-gray-500 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between h-auto min-h-16 py-2 gap-y-2">
            <div className="flex flex-1 items-center space-x-2 min-w-0">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 truncate min-w-0"
                placeholder="Document title..."
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 justify-center min-w-0 mt-2 md:mt-0">
              {updateMutation.isPending && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {!updateMutation.isPending && hasUnsavedChanges && (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Unsaved changes</span>
                </>
              )}
              {!updateMutation.isPending && !hasUnsavedChanges && lastSaved && (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>
                    Saved{" "}
                    <span className="invisible sm:visible">
                      {lastSaved.toLocaleTimeString()}
                    </span>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-1 items-center justify-end space-x-2 min-w-0 mt-2 md:mt-0">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || !hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>

              <button
                onClick={handlerShare}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2 overflow-x-auto max-w-full md:max-w-[160px] invisible sm:visible">
                {filteredConnectedUsers.length > 0 && (
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {filteredConnectedUsers.length} user
                    {filteredConnectedUsers.length !== 1 ? "s" : ""} online
                  </span>
                )}
                <div className="flex -space-x-2">
                  {filteredConnectedUsers.length > 0 &&
                    filteredConnectedUsers.map((user, idx) => (
                      <div
                        key={user.id}
                        className="flex flex-col justify-center items-center"
                      >
                        <Image
                          src={user.avatar || "/default-avatar.png"}
                          alt={"User Avatar"}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          style={{
                            zIndex: filteredConnectedUsers.length - idx,
                          }}
                          width={32}
                          height={32}
                        />
                        <div className="user-name">
                          <h1 className="text-xs text-gray-500 truncate max-w-[64px]">
                            {user.fullname}
                          </h1>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-5xl sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8 py-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Editor
            apiKey={`${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}`}
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={data?.data?.content || ""}
            key={`${id}-${data?.data?._id || "loading"}`}
            init={{
              height: "80vh",
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              skin: "oxide",
              content_css: "default",
              branding: false,
            }}
            disabled={isViewer}
            onEditorChange={isViewer ? undefined : handleEditorChange}
          />
        </div>
      </div>

      <div className="max-w-5xl  px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full md:max-w-[160px] sm:invisible">
          {filteredConnectedUsers.length > 0 && (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {filteredConnectedUsers.length} user
              {filteredConnectedUsers.length !== 1 ? "s" : ""} online
            </span>
          )}
          <div className="flex -space-x-2 ">
            {filteredConnectedUsers.length > 0 &&
              filteredConnectedUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-center items-center"
                >
                  <Image
                    src={user.avatar || "/default-avatar.png"}
                    alt={"User Avatar"}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{
                      zIndex: filteredConnectedUsers.length - idx,
                    }}
                    width={32}
                    height={32}
                  />
                  <div className="user-name">
                    <h1 className="text-xs text-gray-500 truncate max-w-[64px]">
                      {user.fullname}
                    </h1>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedDocument(null);
        }}
        documentId={selectedDocument?._id || ""}
        documentTitle={selectedDocument?.title || ""}
      />
    </div>
  );
}

export default SingleDoc;
