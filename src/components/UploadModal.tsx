import React, { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { X as CloseIcon } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

// You'll want a real modal/dialog component here from Shadcn/Radix or another library
// For simplicity, this is a basic modal structure.
export function UploadModal() {
  const { currentPath, isUploadModalOpen, setIsUploadModalOpen } =
    useAppContext();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const clearStateAndClose = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploading(false);
    setIsUploadModalOpen(false);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
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
    if (currentPath) {
      url.searchParams.append("path", currentPath);
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    // --- This is the key part for the progress bar ---
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success(
          `Files uploaded successfully to /${currentPath || "root"}`
        );
        clearStateAndClose();
        window.location.reload();
        // You might want to trigger a refresh of the file list here
      } else {
        toast.error(`Upload failed: ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error("Upload failed due to a network error.");
    };

    xhr.onabort = () => {
      setUploading(false);
      toast.error("Upload was cancelled.");
    };

    xhr.open("POST", url.toString());
    xhr.send(formData);
  };

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

  if (!isUploadModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Upload Files</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearStateAndClose}
            disabled={uploading}
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Uploading to:{" "}
          <span className="font-mono bg-muted px-1 py-0.5 rounded">{`/${
            currentPath || "root"
          }`}</span>
        </p>

        {!uploading && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="p-6 text-center border-2 border-dashed rounded-lg dark:border-zinc-600 hover:border-blue-500 transition-colors cursor-pointer"
          >
            <p className="text-muted-foreground mb-2">Drag & drop files or</p>
            <label
              htmlFor="modalFileInput"
              className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
            >
              click to browse
            </label>
            <input
              id="modalFileInput"
              type="file"
              multiple
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold">Selected:</h3>
            <ul className="max-h-32 overflow-auto space-y-1 text-sm list-disc pl-5">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="truncate">
                  {file.name} – {(file.size / (1024 * 1024)).toFixed(2)} MB
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-2">
            <Progress value={uploadProgress} />
            <div className="text-sm text-center font-medium">
              {uploadProgress}%
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="ghost" onClick={cancelUpload} disabled={!uploading}>
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
