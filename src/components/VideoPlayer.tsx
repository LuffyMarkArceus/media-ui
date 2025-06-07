// components/VideoPlayer.tsx
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

export function VideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      console.log("HLS supported, using Hls.js");
      return () => hls.destroy();
    } else if (videoRef.current) {
      videoRef.current.src = src;
      console.warn("HLS not supported, using native video element.");
    }
  }, [src]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <MediaPlayer
        title={title}
        src={{ src: src, type: "video/mp4" }}
        className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-700 shadow-md dark:shadow-lg bg-white dark:bg-zinc-800"
      >
        <MediaProvider>
          <track
            kind="subtitles"
            src={`/api/subtitle/${title}`}
            srcLang="en"
            label="English"
            default
          />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      <div className="mt-6 text-center">
        <a
          href={src}
          download
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          Download
        </a>
      </div>
    </div>
  );
}
