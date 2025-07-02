import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useRef } from "react";
import { CustomToast } from "../components/CustomToast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { formatFileSize, formatFileName } from "../lib/utils";

export interface VideoMeta {
  name: string;
  size: number;
  path: string;
  type: string;
}

interface VideoCardProps {
  video: VideoMeta;
  refreshFiles: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_BACKEND_API_URL;

export function VideoCard({ video, refreshFiles }: VideoCardProps) {
  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);

  const openRenameDialog = () => {
    setNewName(video.name.replace(/\.[^/.]+$/, ""));
    setRenameDialogOpen(true);
  };

  const handleCardClick = () => {
    navigate(`/video?path=${encodeURIComponent(video.path)}`);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const toastId = `download-${video.path}`;

    const handleCancelDownload = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      toast.dismiss(toastId);
    };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fileName = formatFileName(video.name);

    try {
      const response = await fetch(
        `${API_BASE}/media_stream?path=${encodeURIComponent(video.path)}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const contentLength = response.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
      let receivedBytes = 0;

      toast.custom(
        () => (
          <CustomToast
            fileName={fileName}
            progress={0}
            received={0}
            total={totalBytes}
            onCancel={handleCancelDownload}
          />
        ),
        { id: toastId, duration: Infinity }
      );

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes) {
            const progress = Math.min((receivedBytes / totalBytes) * 100, 100);
            toast.custom(
              () => (
                <CustomToast
                  fileName={fileName}
                  progress={progress}
                  received={receivedBytes}
                  total={totalBytes}
                  onCancel={handleCancelDownload}
                />
              ),
              { id: toastId, duration: Infinity }
            );
          }
        }
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = video.name;
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Download complete: ${fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.dismiss(toastId);
      toast.error(`Failed to download: ${fileName}`);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error("New name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE}/rename?path=${encodeURIComponent(video.path)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${errorData?.error || "Unknown error"}`
        );
      }

      const data = await response.json();
      toast.success(`Renamed to ${formatFileName(data.newPath)}`);
      setRenameDialogOpen(false);
      await refreshFiles();
    } catch (error) {
      toast.error(
        `Rename failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="relative border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={`${API_BASE}/thumbnail/${encodeURIComponent(
            video.path.replace(/\.[^/.]+$/, ".jpg")
          )}`}
          alt={video.name}
          className="w-full h-32 object-cover"
        />

        <div className="p-2" title={video.name}>
          <div className="font-semibold text-sm">
            {formatFileName(video.name)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(video.size)}
          </div>
        </div>

        <div className="absolute bottom-1 right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300 hover:bg-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleDownload}>
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openRenameDialog();
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Share: ${video.name}`);
                }}
              >
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name without extension"
            disabled={isSubmitting}
            onClick={(e) => e.stopPropagation()}
          />
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isSubmitting}>
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
