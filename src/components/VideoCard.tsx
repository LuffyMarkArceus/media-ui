import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { useAxiosAuth } from "../hooks/useAxiosAuth";
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
import { MoreVertical } from "lucide-react";
import { formatFileSize, formatFileName } from "../lib/utils";

// import { useAuth } from "@clerk/clerk-react";

export interface VideoMeta {
  name: string;
  size: number;
  path: string;
  type: string;
  thumbnail_url: string;
  subtitle_url: string;
}

interface VideoCardProps {
  video: VideoMeta;
  refreshFiles: () => Promise<void>;
  isAdmin: boolean;
}

// const API_BASE = import.meta.env.VITE_BACKEND_API_URL;

export function VideoCard({ video, refreshFiles, isAdmin }: VideoCardProps) {
  // const { getToken } = useAuth();
  // const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);

  const axiosAuth = useAxiosAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  // useEffect(() => {
  //   (async () => {
  //     const jwt = await getToken();
  //     setToken(jwt);
  //   })();
  // }, [getToken]);

  const openRenameDialog = () => {
    setNewName(video.name.replace(/\.[^/.]+$/, ""));
    setRenameDialogOpen(true);
  };

  const handleCardClick = () => {
    // We navigate to the video page, passing the video data in the state
    const videoPaths = [video.path]; // Simplified for single click context
    const playlistParam = encodeURIComponent(JSON.stringify(videoPaths));

    navigate(
      `/video?path=${encodeURIComponent(video.path)}&playlist=${playlistParam}`,
      { state: { videoData: video } }
    );
  };

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const toastId = `download-${video.path}`;
    const fileName = formatFileName(video.name);

    const handleCancelDownload = () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      toast.dismiss(toastId);
    };

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await axiosAuth.get<ArrayBuffer>(`/media_stream`, {
        params: { path: video.path },
        responseType: "arraybuffer",
        signal: controller.signal,
      });

      const blob = new Blob([response.data]);
      const totalBytes = response.data.byteLength;

      toast.custom(
        () => (
          <CustomToast
            fileName={fileName}
            progress={100}
            received={totalBytes}
            total={totalBytes}
            onCancel={handleCancelDownload}
          />
        ),
        {
          id: toastId,
          duration: 2000,
        }
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = video.name;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Download complete: ${fileName}`);
    } catch (err) {
      console.error("Error downloading:", err);
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
      const response = await axiosAuth.put(
        "/rename",
        {
          newName,
        },
        {
          params: { path: video.path },
        }
      );

      toast.success(`Renamed to ${formatFileName(response.data.newPath)}`);
      setRenameDialogOpen(false);
      await refreshFiles();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Rename error:", err);
      toast.error(
        `Rename failed: ${err.response?.data?.error || "Unknown error"}`
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
          src={video.thumbnail_url}
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
              {isAdmin && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameDialog();
                  }}
                >
                  Rename
                </DropdownMenuItem>
              )}
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
