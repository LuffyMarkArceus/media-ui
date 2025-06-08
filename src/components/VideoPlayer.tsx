import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { Button } from "./ui/button";

export function VideoPlayer({
  src,
  title,
  subtitlePath,
}: {
  src: string;
  title: string | undefined;
  subtitlePath: string | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasSubtitle, setHasSubtitle] = useState(false);

  // console.log("VIDEOPLAYER SUBS PATH:", subtitlePath);

  useEffect(() => {
    if (!subtitlePath) return;

    fetch(`/api/subtitle/${encodeURIComponent(subtitlePath)}`, {
      method: "GET",
    })
      .then((res) => {
        setHasSubtitle(res.ok);
      })
      .catch(() => {
        setHasSubtitle(false);
      });
  }, [subtitlePath]);

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
        // title={title}
        src={{ src: src, type: "video/mp4" }}
        className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-700 shadow-md dark:shadow-lg bg-white dark:bg-zinc-800"
      >
        <MediaProvider>
          {hasSubtitle && subtitlePath && (
            <track
              kind="subtitles"
              src={`/api/subtitle/${encodeURIComponent(subtitlePath)}`}
              srcLang="en"
              label="English"
              default
            />
          )}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      <Button variant={"default"} className="mt-4">
        <a href={src} download={title}>
          Download
        </a>
      </Button>
    </div>
  );
}
