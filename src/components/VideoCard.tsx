import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { MoreVertical } from "lucide-react";

import { formatFileSize, formatFileName } from "../lib/utils";

export interface VideoMeta {
  name: string;
  size: number;
  path: string;
  type: string;
}

export function VideoCard({ video }: { video: VideoMeta }) {
  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Stop propagation to prevent dropdown from closing immediately

    try {
      console.log(video.path);
      const response = await fetch(
        `/api/media_stream/?path=${encodeURIComponent(video.path)}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = video.name; // Set the desired file name
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div
      key={video.path}
      className="relative border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
    >
      <Link to={`/video?path=${encodeURIComponent(video.path)}`}>
        <img
          src={`/api/thumbnail/${encodeURIComponent(video.path)}`}
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

      {/* Options Menu */}
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
            side="bottom"
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
              onClick={(event) => {
                event.stopPropagation();
                alert(`Rename: ${video.name}`);
              }}
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
