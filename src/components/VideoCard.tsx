import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
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

export function VideoCard({ video, refreshFiles }: VideoCardProps) {
  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const toastId = `download-${video.path}`;
    try {
      const response = await fetch(
        `/api/media_stream?path=${encodeURIComponent(video.path)}`,
        {
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Response Body is NULL");
      }

      const contentLength = response.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
      let receivedBytes = 0;

      toast.custom(
        () => (
          <div className="flex flex-col gap-2 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
            <div className="font-semibold text-sm">
              Downloading {formatFileName(video.name)}
            </div>
            <Progress value={0} className="w-64" />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(receivedBytes)} /{" "}
              {totalBytes ? formatFileSize(totalBytes) : "Unknown"}
            </div>
          </div>
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
                <div className="flex flex-col gap-2 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
                  <div className="font-semibold text-sm">
                    Downloading {formatFileName(video.name)}
                  </div>
                  <Progress value={progress} className="w-64" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(receivedBytes)} /{" "}
                    {formatFileSize(totalBytes)}
                  </div>
                </div>
              ),
              { id: toastId, duration: Infinity }
            );
          }
        }
      }

      const blob = new Blob(chunks);
      console.debug(`Received blob size: ${blob.size} bytes`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = video.name;
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Download complete: ${formatFileName(video.name)}`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.dismiss(toastId);
      toast.error(`Failed to download: ${formatFileName(video.name)}`, {
        duration: 4000,
      });
    }
  };

  const handleRename = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const newName = prompt(
      `Enter new name for ${video.name}:`,
      video.name.replace(/\.[^/.]+$/, "")
    );
    if (!newName) return;
    try {
      const response = await fetch(
        `/api/rename?path=${encodeURIComponent(video.path)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Rename response:", data);
      toast.success(`File renamed to ${formatFileName(data.newPath)}`, {
        duration: 3000,
      });
      setTimeout(() => refreshFiles(), 2000);
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error(
        `Failed to rename ${formatFileName(video.name)}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          duration: 4000,
        }
      );
    }
  };

  return (
    <div
      key={video.path}
      className="relative border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
    >
      <Link to={`/video?path=${encodeURIComponent(video.path)}`}>
        <img
          src={`/api/thumbnail/${encodeURIComponent(
            video.path.replace(/\.[^/.]+$/, ".jpg")
          )}`}
          alt={video.name}
          className="w-full h-32 object-cover"
        />
      </Link>

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
            <DropdownMenuItem
              onClick={handleDownload}
              title={`/media_stream/?path=${encodeURIComponent(video.path)}`}
            >
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRename}
              title={`/rename?path=${encodeURIComponent(video.path)}`}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                alert(`Share: ${video.name}`);
              }}
            >
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
