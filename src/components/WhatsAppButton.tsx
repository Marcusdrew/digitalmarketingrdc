import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "243896064088";
const MESSAGE = "Bonjour Digital Marketing RDC ! Je souhaite en savoir plus sur vos services.";

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Nous contacter sur WhatsApp"
    >
      <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground text-sm font-medium px-3 py-2 rounded-lg shadow-card whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Discuter sur WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
