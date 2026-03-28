import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - would integrate with backend
    alert("Message envoyé ! Nous vous répondrons rapidement.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-glow blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Contactez-<span className="text-gradient">nous</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Prêt à booster votre présence digitale ? Parlons de votre projet !
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display text-2xl font-bold mb-6">Discutons de votre projet</h3>
              <p className="text-muted-foreground leading-relaxed">
                Que vous ayez un projet en tête ou que vous souhaitiez simplement en savoir plus sur nos services, n'hésitez pas à nous contacter.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: Mail, label: "digitalmarketingrdc@gmail.com" },
                { icon: Phone, label: "+243 XXX XXX XXX" },
                { icon: MapPin, label: "Kinshasa, RD Congo" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="bg-gradient-brand w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-primary-foreground" />
                  </div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-8 space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nom complet</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Décrivez votre projet..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-brand text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-glow flex items-center justify-center gap-2"
            >
              Envoyer le message
              <Send size={18} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
