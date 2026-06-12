"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize2, 
  Minimize 
} from "lucide-react";
import useVideos from "@/hooks/useVideos";

interface VideoCardPlayerProps {
  video: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string | null;
    description?: string | null;
  };
  pos: "left" | "center" | "right";
  onClick: () => void;
}

function VideoCardPlayer({ video, pos, onClick }: VideoCardPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Play/pause based on state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Automatically play when entering center position, pause or play muted on sides
  useEffect(() => {
    if (pos === "center") {
      setIsPlaying(true);
    }
  }, [pos]);

  // Fullscreen change listener to sync state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const changeSpeed = (rate: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Failed to enter fullscreen mode: ", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCardClick = () => {
    if (pos !== "center") {
      onClick();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const isCenter = pos === "center";
  const showControls = !isPlaying || showSpeedMenu || isFullscreen;

  return (
    <div 
      ref={containerRef}
      onClick={handleCardClick}
      className={`relative w-full h-full group transition-all duration-500 overflow-hidden bg-stone-950 ${
        isCenter 
          ? "rounded-3xl border-2 border-[#d4a84b] shadow-[0_25px_60px_rgba(212,168,75,0.45)] ring-4 ring-[#d4a84b]/20" 
          : "rounded-2xl border border-stone-800 shadow-md"
      }`}
    >
      {/* Styles for range slider custom thumb */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-slider-${video.id}::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4a84b;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.6);
        }
        .custom-slider-${video.id}::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4a84b;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 4px rgba(0,0,0,0.6);
        }
      `}} />

      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        playsInline
        autoPlay
        preload="metadata"
        poster={video.thumbnail ?? ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Control Bar Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/55 to-transparent transition-opacity duration-300 flex flex-col gap-2 z-20 ${
          showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="flex items-center w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className={`w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d4a84b] hover:h-1.5 transition-all outline-none custom-slider-${video.id}`}
            style={{
              background: `linear-gradient(to right, #d4a84b 0%, #d4a84b ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Buttons and Info */}
        <div className="flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button 
              onClick={handlePlayPause}
              className="hover:text-[#d4a84b] transition-colors p-1"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            </button>

            {/* Volume */}
            <button 
              onClick={toggleMute}
              className="hover:text-[#d4a84b] transition-colors p-1"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Timestamp */}
            <span className="font-mono text-[9px] tracking-wider text-stone-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Settings Gear */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeedMenu(!showSpeedMenu);
              }}
              className="hover:text-[#d4a84b] transition-colors p-1"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>

            {/* Speed Menu Popup */}
            {showSpeedMenu && (
              <div 
                className="absolute bottom-8 right-0 bg-stone-900/95 border border-stone-800 rounded-lg p-1.5 flex flex-col gap-1 z-30 min-w-[75px] shadow-xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={(e) => changeSpeed(rate, e)}
                    className={`text-[9px] text-left px-2 py-1 rounded hover:bg-[#d4a84b] hover:text-black transition-colors ${
                      playbackRate === rate ? "text-[#d4a84b] font-bold" : "text-stone-300"
                    }`}
                  >
                    {rate.toFixed(1)}x
                  </button>
                ))}
              </div>
            )}

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="hover:text-[#d4a84b] transition-colors p-1"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Label and Info Overlay (fade out slightly when hover controls are active) */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
        showControls ? "opacity-0" : "opacity-100 group-hover:opacity-0"
      }`}>
        <p
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className={`text-white font-medium truncate ${isCenter ? "text-lg" : "text-sm"}`}
        >
          {video.title}
        </p>
        {isCenter && video.description && (
          <p className="text-white/70 text-xs mt-1 line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}

export default function VideoSliderSection() {
  const { videos, loading } = useVideos();
  const [centerIndex, setCenterIndex] = useState(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!loading && videos && videos.length > 0 && !initializedRef.current) {
      setCenterIndex(Math.floor(videos.length / 2));
      initializedRef.current = true;
    }
  }, [videos, loading]);

  const goPrev = () => setCenterIndex((p) => Math.max(0, p - 1));
  const goNext = () => setCenterIndex((p) => Math.min(videos.length - 1, p + 1));

  if (loading) {
    return (
      <section className="py-24 bg-[#faf9f7] flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#c9a96e] animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) return null;

  // Build a window of up to 3 videos centered on centerIndex
  const getWindow = () => {
    if (videos.length === 1) return [{ video: videos[0], pos: "center" as const }];
    if (videos.length === 2) {
      if (centerIndex === 0)
        return [
          { video: videos[0], pos: "center" as const },
          { video: videos[1], pos: "right" as const },
        ];
      return [
        { video: videos[0], pos: "left" as const },
        { video: videos[1], pos: "center" as const },
      ];
    }
    // 3+ videos
    const left = centerIndex > 0 ? videos[centerIndex - 1] : null;
    const center = videos[centerIndex];
    const right = centerIndex < videos.length - 1 ? videos[centerIndex + 1] : null;
    const result = [];
    if (left) result.push({ video: left, pos: "left" as const });
    result.push({ video: center, pos: "center" as const });
    if (right) result.push({ video: right, pos: "right" as const });
    return result;
  };

  const window3 = getWindow();

  // Define 3D transformation properties based on position
  const get3DStyles = (pos: "left" | "center" | "right") => {
    switch (pos) {
      case "left":
        return {
          transform: "rotateY(30deg) scale(0.85)",
          transformOrigin: "right center",
          transformStyle: "preserve-3d" as const,
          opacity: 0.7,
          zIndex: 5,
        };
      case "right":
        return {
          transform: "rotateY(-30deg) scale(0.85)",
          transformOrigin: "left center",
          transformStyle: "preserve-3d" as const,
          opacity: 0.7,
          zIndex: 5,
        };
      case "center":
      default:
        return {
          transform: "rotateY(0deg) scale(1.05)",
          transformStyle: "preserve-3d" as const,
          opacity: 1,
          zIndex: 10,
        };
    }
  };

  const getWrapperWidth = (pos: "left" | "center" | "right") => {
    return pos === "center" ? "w-[42%] md:w-[38%]" : "w-[26%] md:w-[28%]";
  };

  return (
    <section className="py-24 bg-[#faf9f7] overflow-hidden">
      {/* Header */}
      <div className="text-center mb-14 px-4">
        <p
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.25em" }}
          className="text-xs text-[#c9a96e] uppercase mb-3"
        >
          OUR RITUALS
        </p>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-4xl md:text-5xl font-normal text-stone-900"
        >
          See It Come to Life
        </h2>
      </div>

      {/* 3-up video row */}
      <div className="relative max-w-5xl mx-auto px-6 overflow-visible">
        <div 
          className="flex items-center justify-center gap-1 md:gap-4 select-none overflow-visible"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {window3.map(({ video, pos }) => {
            const actualIndex = pos === "center"
              ? centerIndex
              : pos === "left"
              ? centerIndex - 1
              : centerIndex + 1;
              
            return (
              <div
                key={video.id}
                style={get3DStyles(pos)}
                className={`flex-shrink-0 aspect-[9/16] transition-all duration-500 overflow-visible ${getWrapperWidth(pos)} ${
                  pos !== "center" ? "cursor-pointer hover:opacity-85" : "cursor-default"
                }`}
              >
                <VideoCardPlayer 
                  video={video} 
                  pos={pos} 
                  onClick={() => setCenterIndex(actualIndex)} 
                />
                
                {pos === "center" && (
                  <p
                    className="text-center text-xs text-[#c9a96e] mt-4 uppercase tracking-widest font-bold animate-pulse"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Now Playing
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {centerIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:bg-[#f5e6c0] hover:text-[#a07828] hover:border-[#d4a84b]/40 transition-all z-20"
            aria-label="Previous video"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {centerIndex < videos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:bg-[#f5e6c0] hover:text-[#a07828] hover:border-[#d4a84b]/40 transition-all z-20"
            aria-label="Next video"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {videos.length > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              aria-label={`Go to video ${i + 1}`}
              className={`rounded-full border-none cursor-pointer p-0 transition-all duration-300 ${
                i === centerIndex
                  ? "w-6 h-2 bg-[#c9a96e]"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}