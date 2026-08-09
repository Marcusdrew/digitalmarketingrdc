import { useRef, useState } from "react";
import { Play } from "lucide-react";

interface Props {
  src: string;
  className?: string;
  /** Show the play badge overlay */
  showPlayIcon?: boolean;
  /** Play a short muted loop on hover (desktop) */
  playOnHover?: boolean;
  iconSize?: number;
}

/**
 * Displays a real frame of a video (instead of a blurred/placeholder block)
 * by loading only its metadata and seeking to the first visible frame.
 */
const VideoPreview = ({
  src,
  className = "",
  showPlayIcon = true,
  playOnHover = false,
  iconSize = 32,
}: Props) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-muted ${className}`}
      onMouseEnter={() => {
        if (playOnHover) ref.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (playOnHover && ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0.1;
        }
      }}
    >
      <video
        ref={ref}
        // #t=0.1 forces browsers to render the first frame as the poster
        src={`${src}#t=0.1`}
        muted
        playsInline
        loop
        preload="metadata"
        onLoadedData={() => setReady(true)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.currentTime === 0) {
            try {
              v.currentTime = 0.1;
            } catch {
              /* ignore */
            }
          }
        }}
        className="w-full h-full object-cover"
      />
      {!ready && <div className="absolute inset-0 animate-pulse bg-muted" />}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="rounded-full bg-black/45 p-3 backdrop-blur-sm">
            <Play size={iconSize} className="text-white" fill="currentColor" />
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
