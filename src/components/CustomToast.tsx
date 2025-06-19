import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { X as XIcon } from "lucide-react";
import { formatFileSize, formatFileName } from "../lib/utils";

interface DownloadToastProps {
  fileName: string;
  progress: number;
  received: number;
  total: number | null;
  onCancel: () => void; // A function to call when the cancel button is clicked
}

export const CustomToast = ({
  fileName,
  progress,
  received,
  total,
  onCancel,
}: DownloadToastProps) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 w-80">
    <div className="flex flex-col gap-2 flex-grow">
      <div className="font-semibold text-sm">
        Downloading {formatFileName(fileName)}
      </div>
      <Progress value={progress} className="w-full" />
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {formatFileSize(received)} / {total ? formatFileSize(total) : "Unknown"}
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={onCancel}
      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
    >
      <XIcon className="w-5 h-5" />
    </Button>
  </div>
);
