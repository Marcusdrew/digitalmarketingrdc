import { motion } from "framer-motion";
import { Target, Eye, TrendingUp } from "lucide-react";
import logo from "@/assets/logo-dlm.jpeg";

const AboutSection = () => {
  return (
    <section id="apropos" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Qui sommes-<span className="text-gradient">nous ?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Une équipe passionnée au service de votre croissance digitale
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass rounded-2xl p-8 flex items-center justify-center">
              <img src={logo} alt="Digital Marketing RDC" className="w-64 h-64 rounded-2xl object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-muted-foreground text-lg leading-relaxed">
              <strong className="text-foreground">DLM (Digital Marketing RDC)</strong> est une agence de marketing digital et de communication basée à Kinshasa, en République Démocratique du Congo, spécialisée dans la visibilité et la performance des entreprises locales.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Nous accompagnons les marques de Kinshasa et de toute la RDC dans leur croissance grâce à des solutions digitales modernes : gestion des réseaux sociaux (community management), création de contenus visuels et vidéos, création de site web et stratégies marketing sur mesure.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Notre objectif : aider chaque entreprise congolaise à attirer plus de clients, améliorer son image et structurer sa présence en ligne de manière professionnelle.
            </p>
          </motion.div>
        </div>

        {/* Vision & Objectifs */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Notre Mission",
              description: "Aider chaque entreprise à attirer plus de clients, améliorer son image et structurer sa présence en ligne de manière professionnelle.",
            },
            {
              icon: Eye,
              title: "Notre Vision",
              description: "Se positionner comme une agence jeune, dynamique et ambitieuse, avec une vision orientée vers l'expansion et l'innovation dans le domaine du digital.",
            },
            {
              icon: TrendingUp,
              title: "Nos Objectifs",
              description: "Augmenter la visibilité digitale de nos clients, générer un ROI mesurable et construire des communautés engagées autour de leurs marques.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-8 group hover:shadow-glow transition-shadow duration-500"
            >
              <div className="bg-gradient-brand w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <item.icon size={24} className="text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
