import { motion } from "framer-motion";
import { Megaphone, Globe, PenTool, BarChart3, Users, Camera } from "lucide-react";

const services = [
  {
    icon: Megaphone,
    title: "Publicité Digitale",
    description: "Campagnes publicitaires ciblées sur Facebook, Instagram, Google Ads pour maximiser votre retour sur investissement.",
  },
  {
    icon: Globe,
    title: "Création de Sites Web",
    description: "Sites vitrines et e-commerce modernes, responsives et optimisés pour convertir vos visiteurs en clients.",
  },
  {
    icon: PenTool,
    title: "Design Graphique",
    description: "Identité visuelle, logos, flyers, bannières et tout support graphique pour renforcer votre image de marque.",
  },
  {
    icon: BarChart3,
    title: "Stratégie Digitale",
    description: "Plans marketing personnalisés basés sur l'analyse de données pour atteindre vos objectifs business.",
  },
  {
    icon: Users,
    title: "Community Management",
    description: "Gestion professionnelle de vos réseaux sociaux pour engager votre communauté et fidéliser vos clients.",
  },
  {
    icon: Camera,
    title: "Création de Contenu",
    description: "Photos, vidéos, rédaction et contenus créatifs qui captent l'attention et racontent votre histoire.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-gradient-glow blur-3xl opacity-30" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Nos <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Des solutions complètes pour dominer l'espace digital
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 group hover:shadow-glow transition-all duration-500 hover:-translate-y-1"
            >
              <div className="bg-gradient-brand w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <service.icon size={28} className="text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
