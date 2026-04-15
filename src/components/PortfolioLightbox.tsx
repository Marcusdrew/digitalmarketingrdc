import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"portfolio_projects">;

interface MediaItem {
  id: string;
  media_url: string;
  media_type: string;
  position: number;
}

interface Props {
  project: Project | null;
  media: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const PortfolioLightbox = ({ project, media, currentIndex, onClose, onNavigate }: Props) => {
  const current = media[currentIndex];

  const goNext = () => onNavigate((currentIndex + 1) % media.length);
  const goPrev = () => onNavigate((currentIndex - 1 + media.length) % media.length);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl mx-4 max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 md:top-4 md:right-4 z-20 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
            >
              <X size={22} />
            </button>

            {/* Main media area */}
            <div className="relative flex-1 flex items-center justify-center min-h-0 rounded-t-2xl overflow-hidden bg-black">
              {current && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.media_url}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {current.media_type === "video" ? (
                      <video
                        src={current.media_url}
                        controls
                        autoPlay
                        className="max-w-full max-h-[70vh] w-auto rounded-lg"
                        style={{ maxHeight: "70vh" }}
                      />
                    ) : (
                      <img
                        src={current.media_url}
                        alt={project.title}
                        className="max-w-full max-h-[70vh] w-auto object-contain rounded-lg"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Navigation arrows */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all hover:scale-110"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all hover:scale-110"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom panel */}
            <div className="glass rounded-b-2xl">
              {/* Thumbnails */}
              {media.length > 1 && (
                <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto scrollbar-thin">
                  {media.map((m, i) => (
                    <button
                      key={m.id + i}
                      onClick={() => onNavigate(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        i === currentIndex
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      {m.media_type === "video" ? (
                        <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                          <Play size={16} className="text-primary-foreground" />
                        </div>
                      ) : (
                        <img src={m.media_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Project info */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                  {media.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {currentIndex + 1} / {media.length}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold mb-2">{project.title}</h3>
                {project.description && (
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{project.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortfolioLightbox;
