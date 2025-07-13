import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export function VideoPlayer({
  src,
  subtitlePath,
  onEnded,
}: {
  src: string;
  subtitlePath: string | undefined;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasSubtitle, setHasSubtitle] = useState(false);
  const [tokenizedSrc, setTokenizedSrc] = useState("");
  const [tokenizedSubtitle, setTokenizedSubtitle] = useState("");
  const { getToken } = useAuth();

  useEffect(() => {
    const prepareMediaUrls = async () => {
      const token = await getToken();
      if (!token) return;

      const query = `?token=${encodeURIComponent(token)}`;
      setTokenizedSrc(`${src}${src.includes("?") ? "&" : "?"}token=${token}`);

      // Skip if subtitlePath is empty or full URL (which is invalid in our case)
      if (!subtitlePath || subtitlePath.startsWith("http")) return;

      try {
        const subtitleFetchUrl = `${API_URL}/subtitle/${encodeURIComponent(
          subtitlePath
        )}${query}`;

        const res = await fetch(subtitleFetchUrl);
        if (res.ok) {
          setHasSubtitle(true);
          setTokenizedSubtitle(
            `${API_URL}/proxy_subtitle/${encodeURIComponent(
              subtitlePath
            )}${query}`
          );
        } else {
          setHasSubtitle(false);
        }
      } catch {
        setHasSubtitle(false);
      }
    };

    prepareMediaUrls();
  }, [src, subtitlePath, getToken]);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current && tokenizedSrc) {
      const hls = new Hls();
      hls.loadSource(tokenizedSrc);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current && tokenizedSrc) {
      videoRef.current.src = tokenizedSrc;
    }
  }, [tokenizedSrc]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <MediaPlayer
        aspectRatio="16/9"
        src={{ src: tokenizedSrc, type: "video/mp4" }}
        className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-700 shadow-md dark:shadow-lg bg-white dark:bg-zinc-800"
        onEnded={onEnded}
      >
        <MediaProvider>
          {hasSubtitle && tokenizedSubtitle && (
            <track
              kind="subtitles"
              src={tokenizedSubtitle}
              srcLang="en"
              label="English"
              default
            />
          )}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
