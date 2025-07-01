import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/topnav";
import { Toaster, toast } from "sonner";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function Upload() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPath, setUploadPath] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Redirect non-admins away
  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
      navigate("/");
    }
  }, [user, navigate]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles((prev) => [
        ...prev,
        ...Array.from(e.dataTransfer.files),
      ]);
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      toast.error("Upload cancelled");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    // --- Build the URL with the path query parameter ---
    const url = new URL(`${BACKEND_URL}/upload`);
    if (uploadPath) {
      // The Go backend sanitizes ".." but trimming here is good practice
      url.searchParams.append("path", uploadPath.trim());
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          toast.success(
            `Uploaded ${response.uploaded?.length || 0} files successfully!`
          );
          clearFiles();
        } catch (e) {
          toast.error("Upload failed: Could not parse server response.");
          console.error("Response parsing error:", e);
        }
      } else {
        toast.error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error("Upload failed due to a network error.");
    };

    xhr.onabort = () => {
      setUploading(false);
      toast.error("Upload aborted.");
    };

    xhr.open("POST", url.toString());
    xhr.send(formData);
  };
  return (
    <div className="min-h-screen p-4 bg-white dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <Toaster richColors position="bottom-right" />
      <div className="flex items-center justify-between mb-6">
        <TopNav />
      </div>
      <h1 className="text-2xl font-bold mb-4">Admin Upload</h1>

      {/* --- New Input Field for Upload Path --- */}
      <div className="mb-4 max-w-xl">
        <label htmlFor="uploadPath" className="block text-sm font-medium mb-1">
          Upload to Folder (optional)
        </label>
        <input
          id="uploadPath"
          type="text"
          value={uploadPath}
          onChange={(e) => setUploadPath(e.target.value)}
          placeholder="e.g., videos/summer-trip-2025"
          className="w-full p-2 rounded border bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={uploading}
        />
      </div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-4 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-600 transition-colors"
      >
        <p>Drag and drop files here, or</p>
        <label
          htmlFor="fileInput"
          className="text-blue-600 dark:text-blue-400 cursor-pointer underline"
        >
          browse to select files
        </label>
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Files to upload:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-auto">
            {selectedFiles.map((file, idx) => (
              <li key={idx}>
                {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
              </li>
            ))}
          </ul>
          <button
            onClick={clearFiles}
            className="mt-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
            disabled={uploading}
          >
            Clear
          </button>
        </div>
      )}

      {uploading && (
        <div className="mt-4 w-full max-w-lg mx-auto">
          <div className="text-center mb-1">Uploading: {uploadProgress}%</div>
          <progress
            value={uploadProgress}
            max={100}
            className="w-full h-4 rounded"
          />
          <button
            onClick={cancelUpload}
            className="mt-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors w-full"
          >
            Cancel Upload
          </button>
        </div>
      )}

      <button
        onClick={uploadFiles}
        disabled={uploading || selectedFiles.length === 0}
        className={`mt-6 px-6 py-3 rounded text-white ${
          uploading || selectedFiles.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } transition-colors`}
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
    </div>
  );
}
