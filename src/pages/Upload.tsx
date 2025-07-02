import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/topnav";
import { Toaster, toast } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";

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

    const url = new URL(`${BACKEND_URL}/upload`);
    if (uploadPath) {
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
    <div className="min-h-screen bg-white dark:bg-zinc-900 dark:text-white p-4 transition-colors duration-300">
      <Toaster richColors position="bottom-right" />
      <TopNav />

      <div className="max-w-3xl mx-auto mt-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Admin Upload</h1>

        <Card className="p-6 space-y-4 shadow-lg border dark:border-zinc-700">
          <div className="space-y-2">
            <label htmlFor="uploadPath" className="text-sm font-medium">
              Upload to Folder (optional)
            </label>
            <input
              id="uploadPath"
              type="text"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              placeholder="e.g., movies/anime"
              className="w-full px-3 py-2 border dark:border-zinc-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          <Separator />

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="p-6 text-center border-2 border-dashed rounded-lg dark:border-zinc-600 hover:border-blue-500 transition-colors cursor-pointer"
          >
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Drag and drop files here or
            </p>
            <label
              htmlFor="fileInput"
              className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
            >
              click to browse
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
            <div className="mt-4 space-y-2">
              <h2 className="text-sm font-semibold">Selected Files:</h2>
              <ul className="max-h-40 overflow-auto space-y-1 text-sm list-disc pl-5">
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>
                    {file.name} – {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </li>
                ))}
              </ul>
              <Button
                variant="destructive"
                onClick={clearFiles}
                disabled={uploading}
              >
                Clear Files
              </Button>
            </div>
          )}

          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <div className="text-sm text-center">{uploadProgress}%</div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={cancelUpload}
              >
                Cancel Upload
              </Button>
            </div>
          )}

          <Button
            className="w-full"
            onClick={uploadFiles}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
