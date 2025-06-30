import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { VideoPlayer } from "../components/VideoPlayer";
import { TopNav } from "../components/topnav";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useVideoPageBreadcrumbs } from "../hooks/useVideoPageBreadCrumbs";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DownloadIcon,
} from "lucide-react";
import { CustomToast } from "../components/CustomToast";
import { toast } from "sonner";
import { formatFileName } from "../lib/utils";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function VideoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const path = decodeURIComponent(searchParams.get("path") ?? "");
  const playlistParam = searchParams.get("playlist");

  const playlist: string[] = useMemo(() => {
    if (!playlistParam) return [];
    try {
      return JSON.parse(decodeURIComponent(playlistParam));
    } catch (e) {
      console.error("Failed to parse playlist:", e);
      return [];
    }
  }, [playlistParam]);

  const currentIndex = useMemo(
    () => playlist.findIndex((p) => p === path),
    [playlist, path]
  );

  const firstVideoPath = playlist.length > 0 ? playlist[0] : null;
  const previousVideoPath =
    currentIndex > 0 ? playlist[currentIndex - 1] : null;
  const nextVideoPath =
    currentIndex !== -1 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : null;
  const lastVideoPath =
    playlist.length > 0 ? playlist[playlist.length - 1] : null;

  const navigateToVideo = (newPath: string | null) => {
    if (newPath) {
      navigate(
        `/video?path=${encodeURIComponent(
          newPath
        )}&playlist=${encodeURIComponent(JSON.stringify(playlist))}`
      );
    }
  };

  const handleVideoEnded = () => {
    if (nextVideoPath) {
      navigateToVideo(nextVideoPath);
    }
  };

  const breadcrumbItems = useVideoPageBreadcrumbs(path);

  if (!path) {
    return <div className="p-4 text-red-500">Invalid video path.</div>;
  }

  const fileName = decodeURIComponent(path.split("/").pop() || path);
  const subtitlePath = path.replace(/\.[^/.]+$/, ".vtt");

  const handleDownload = async (event: React.MouseEvent) => {
    event.preventDefault();
    const toastId = `download-${path}`;

    const handleCancelDownload = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      toast.dismiss(toastId);
    };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `${API_URL}/media_stream?path=${encodeURIComponent(path)}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error ! status = ${response.status}`);
      if (!response.body) throw new Error("Response body is NULL");

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
            setDownloadProgress(progress);
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
      a.download = fileName;
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Download complete: ${formatFileName(fileName)}`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.dismiss(toastId);
      toast.error(`Failed to download: ${formatFileName(fileName)}`, {
        duration: 4000,
      });
    } finally {
      setDownloadProgress(null);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div>
        <TopNav />
      </div>
      <br />
      <Breadcrumbs items={breadcrumbItems} />
      <br />
      <h3 className="text-center font-bold mt-4 text-base mb-4 text-gray-700 dark:text-gray-300 truncate">
        {fileName}
      </h3>

      <VideoPlayer
        src={`${API_URL}/media_stream?path=${encodeURIComponent(path)}`}
        subtitlePath={subtitlePath}
        onEnded={handleVideoEnded}
      />

      <div className="flex justify-between items-center w-full max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(firstVideoPath)}
            disabled={!firstVideoPath || currentIndex === 0}
            className="flex items-center gap-2"
            title={firstVideoPath ?? ""}
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(previousVideoPath)}
            disabled={!previousVideoPath}
            className="flex items-center gap-2"
            title={previousVideoPath ?? ""}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"default"}
            className="flex items-center gap-2"
            title={fileName}
            onClick={handleDownload}
            disabled={downloadProgress !== null}
          >
            <DownloadIcon className="w-5 h-5" />
            {downloadProgress === null
              ? "Download"
              : `Downloading... ${downloadProgress.toFixed(0)}%`}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(nextVideoPath)}
            disabled={!nextVideoPath}
            className="flex items-center gap-2"
            title={nextVideoPath ?? ""}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(lastVideoPath)}
            disabled={!lastVideoPath || currentIndex === playlist.length - 1}
            className="flex items-center gap-2"
            title={lastVideoPath ?? ""}
          >
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
