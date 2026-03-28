import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Campagne Social Media",
    category: "Réseaux Sociaux",
    description: "Stratégie de contenu et gestion de communauté ayant doublé l'engagement en 3 mois.",
  },
  {
    title: "Site E-commerce",
    category: "Développement Web",
    description: "Plateforme de vente en ligne complète avec système de paiement mobile intégré.",
  },
  {
    title: "Branding Complet",
    category: "Design Graphique",
    description: "Refonte totale de l'identité visuelle d'une marque de mode congolaise.",
  },
  {
    title: "Campagne Publicitaire",
    category: "Publicité Digitale",
    description: "Campagne Facebook Ads ayant généré +200% de leads qualifiés pour un client B2B.",
  },
];

const PortfolioSection = () => {
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

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-500"
            >
              <div className="bg-gradient-brand h-48 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={40} className="text-primary-foreground opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <div className="p-8">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="font-display text-xl font-bold mt-2 mb-3">{project.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
