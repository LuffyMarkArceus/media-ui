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
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem asChild>
              <a href={`/api/media/${video.path}`} download>
                Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Rename: ${video.name}`)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Share: ${video.name}`)}>
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
