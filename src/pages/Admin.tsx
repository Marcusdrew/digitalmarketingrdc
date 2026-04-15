import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, LogOut, ArrowLeft, Upload, Image, Video, X } from "lucide-react";
import AdminVisitStats from "@/components/AdminVisitStats";
import logo from "@/assets/logo-dlm.jpeg";

type Project = Tables<"portfolio_projects">;

interface MediaFile {
  file: File;
  type: "image" | "video";
  preview: string;
}

const categories = ["Réseaux Sociaux", "Développement Web", "Design Graphique", "Publicité Digitale", "Branding", "Vidéo"];

const Admin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMediaCounts, setProjectMediaCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);

    // Fetch media counts
    if (data && data.length > 0) {
      const { data: media } = await supabase
        .from("portfolio_media")
        .select("project_id");
      if (media) {
        const counts: Record<string, number> = {};
        media.forEach((m) => {
          counts[m.project_id] = (counts[m.project_id] || 0) + 1;
        });
        setProjectMediaCounts(counts);
      }
    }

    setLoading(false);
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      const { data: hasRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!hasRole) {
        toast({ title: "Accès refusé", description: "Vous n'avez pas les droits administrateur.", variant: "destructive" });
        navigate("/");
        return;
      }
      fetchProjects();
    };
    checkAuth();
  }, [navigate, toast, fetchProjects]);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaFile[] = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith("video/");
      return {
        file,
        type: isVideo ? "video" : "image",
        preview: URL.createObjectURL(file),
      };
    });

    setMediaFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaFiles.length === 0 || !title || !category) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs et ajouter au moins un fichier.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Use first image as main media, or first file
      const firstImage = mediaFiles.find((f) => f.type === "image") || mediaFiles[0];
      const mainExt = firstImage.file.name.split(".").pop();
      const mainPath = `${Date.now()}-main.${mainExt}`;

      const { error: mainUploadErr } = await supabase.storage.from("portfolio").upload(mainPath, firstImage.file);
      if (mainUploadErr) throw mainUploadErr;

      const { data: mainUrl } = supabase.storage.from("portfolio").getPublicUrl(mainPath);

      // Create the project
      const { data: project, error: insertError } = await supabase
        .from("portfolio_projects")
        .insert({
          title,
          category,
          description: description || null,
          media_type: firstImage.type,
          media_url: mainUrl.publicUrl,
        })
        .select()
        .single();

      if (insertError || !project) throw insertError || new Error("Échec de création");

      // Upload all media files
      const mediaInserts = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        const mf = mediaFiles[i];
        let url: string;

        if (mf === firstImage) {
          url = mainUrl.publicUrl;
        } else {
          const ext = mf.file.name.split(".").pop();
          const path = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${ext}`;
          const { error: upErr } = await supabase.storage.from("portfolio").upload(path, mf.file);
          if (upErr) throw upErr;
          const { data: fileUrl } = supabase.storage.from("portfolio").getPublicUrl(path);
          url = fileUrl.publicUrl;
        }

        mediaInserts.push({
          project_id: project.id,
          media_url: url,
          media_type: mf.type,
          position: i,
        });
      }

      const { error: mediaErr } = await supabase.from("portfolio_media").insert(mediaInserts);
      if (mediaErr) throw mediaErr;

      toast({ title: "Succès", description: `Réalisation ajoutée avec ${mediaFiles.length} fichier(s) !` });
      
      // Cleanup
      mediaFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setTitle("");
      setCategory("");
      setDescription("");
      setMediaFiles([]);
      setShowForm(false);
      fetchProjects();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Supprimer "${project.title}" et tous ses fichiers ?`)) return;

    // Get all media for this project
    const { data: media } = await supabase
      .from("portfolio_media")
      .select("media_url")
      .eq("project_id", project.id);

    // Delete storage files
    const filePaths: string[] = [];
    const allUrls = [project.media_url, ...(media || []).map((m) => m.media_url)];
    const uniqueUrls = [...new Set(allUrls)];

    for (const url of uniqueUrls) {
      try {
        const u = new URL(url);
        const parts = u.pathname.split("/storage/v1/object/public/portfolio/");
        if (parts[1]) filePaths.push(parts[1]);
      } catch {}
    }

    if (filePaths.length > 0) {
      await supabase.storage.from("portfolio").remove(filePaths);
    }

    // Delete project (cascade deletes media rows)
    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "Réalisation et tous ses fichiers supprimés." });
      fetchProjects();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DLM" className="h-8 w-8 rounded-full object-cover" />
            <h1 className="font-display text-lg font-bold text-gradient">Admin DLM</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground">
              <ArrowLeft size={16} className="mr-1" /> Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut size={16} className="mr-1" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AdminVisitStats />


        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gradient">{projects.length}</p>
            <p className="text-sm text-muted-foreground">Réalisations</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gradient">{projects.filter(p => p.media_type === 'image').length}</p>
            <p className="text-sm text-muted-foreground">Photos</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gradient">{projects.filter(p => p.media_type === 'video').length}</p>
            <p className="text-sm text-muted-foreground">Vidéos</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gradient">{new Set(projects.map(p => p.category)).size}</p>
            <p className="text-sm text-muted-foreground">Catégories</p>
          </div>
        </div>

        {/* Add button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-bold">Réalisations</h2>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-brand hover:opacity-90">
            <Plus size={16} className="mr-1" /> Ajouter
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleUpload} className="glass rounded-2xl p-6 mb-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du projet" required />
              </div>
              <div>
                <Label>Catégorie *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le projet..." />
            </div>

            {/* Multi-file upload */}
            <div>
              <Label>Fichiers (photos et vidéos) *</Label>
              <p className="text-xs text-muted-foreground mb-2">Vous pouvez ajouter autant de photos et vidéos que vous voulez</p>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {mediaFiles.map((mf, i) => (
                  <div key={i} className="relative group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                      {mf.type === "video" ? (
                        <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                          <Video size={24} className="text-primary-foreground" />
                        </div>
                      ) : (
                        <img src={mf.preview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                      {mf.type === "video" ? "Vidéo" : "Photo"}
                    </span>
                  </div>
                ))}

                {/* Add more button */}
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Plus size={20} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleAddFiles}
                    className="hidden"
                  />
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {mediaFiles.filter(f => f.type === "image").length} photo(s), {mediaFiles.filter(f => f.type === "video").length} vidéo(s)
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={uploading} className="bg-gradient-brand hover:opacity-90">
                <Upload size={16} className="mr-1" />
                {uploading ? "Envoi en cours..." : "Publier"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); mediaFiles.forEach(f => URL.revokeObjectURL(f.preview)); setMediaFiles([]); }}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Projects list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune réalisation pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  {project.media_type === "video" ? (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                      <Video size={20} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <img src={project.media_url} alt={project.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold truncate">{project.title}</h3>
                  <p className="text-xs text-secondary">{project.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {projectMediaCounts[project.id] || 1} fichier(s) · {new Date(project.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(project)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
