import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import PortfolioLightbox from "./PortfolioLightbox";

type Project = Tables<"portfolio_projects">;

interface MediaItem {
  id: string;
  media_url: string;
  media_type: string;
  position: number;
}

const categories = ["Tout", "Réseaux Sociaux", "Développement Web", "Design Graphique", "Publicité Digitale", "Branding", "Vidéo"];

const PortfolioSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMedia, setProjectMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const openProject = async (project: Project) => {
    setSelectedProject(project);
    setCurrentMediaIndex(0);

    const { data } = await supabase
      .from("portfolio_media")
      .select("*")
      .eq("project_id", project.id)
      .order("position", { ascending: true });

    if (data && data.length > 0) {
      setProjectMedia(data);
    } else {
      setProjectMedia([{
        id: project.id,
        media_url: project.media_url,
        media_type: project.media_type,
        position: 0,
      }]);
    }
  };

  const closeLightbox = () => {
    setSelectedProject(null);
    setProjectMedia([]);
  };

  const filtered = selectedCategory === "Tout"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="realisations" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Nos <span className="text-gradient">Réalisations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Découvrez quelques-uns de nos projets qui ont fait la différence
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-brand text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Filter size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {projects.length === 0
                ? "Les réalisations arrivent bientôt..."
                : "Aucune réalisation dans cette catégorie"}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => openProject(project)}
                  className="glass rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-500 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    {project.media_type === "video" ? (
                      <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={40} className="text-primary-foreground" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={project.media_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="font-display text-lg font-bold mt-2 mb-2">{project.title}</h3>
                    {project.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <PortfolioLightbox
        project={selectedProject}
        media={projectMedia}
        currentIndex={currentMediaIndex}
        onClose={closeLightbox}
        onNavigate={setCurrentMediaIndex}
      />
    </section>
  );
};

export default PortfolioSection;
