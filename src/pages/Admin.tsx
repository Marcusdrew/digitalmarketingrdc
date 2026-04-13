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
import { Trash2, Plus, LogOut, ArrowLeft, Upload, Image, Video } from "lucide-react";
import logo from "@/assets/logo-dlm.jpeg";

type Project = Tables<"portfolio_projects">;

const categories = ["Réseaux Sociaux", "Développement Web", "Design Graphique", "Publicité Digitale", "Branding", "Vidéo"];

const Admin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      // Check admin role
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("portfolio_projects")
        .insert({
          title,
          category,
          description: description || null,
          media_type: mediaType,
          media_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      toast({ title: "Succès", description: "Réalisation ajoutée avec succès !" });
      setTitle("");
      setCategory("");
      setDescription("");
      setFile(null);
      setShowForm(false);
      fetchProjects();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Supprimer "${project.title}" ?`)) return;

    // Extract file path from URL
    const url = new URL(project.media_url);
    const pathParts = url.pathname.split("/storage/v1/object/public/portfolio/");
    if (pathParts[1]) {
      await supabase.storage.from("portfolio").remove([pathParts[1]]);
    }

    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "Réalisation supprimée." });
      fetchProjects();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Stats */}
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Type de média</Label>
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      mediaType === "image" ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground"
                    }`}
                  >
                    <Image size={16} /> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      mediaType === "video" ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground"
                    }`}
                  >
                    <Video size={16} /> Vidéo
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="file">Fichier *</Label>
                <Input
                  id="file"
                  type="file"
                  accept={mediaType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={uploading} className="bg-gradient-brand hover:opacity-90">
                <Upload size={16} className="mr-1" />
                {uploading ? "Envoi en cours..." : "Publier"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
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
                    {new Date(project.created_at).toLocaleDateString("fr-FR")}
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
