import logo from "@/assets/logo-dlm.jpeg";
import { Facebook, Instagram } from "lucide-react";

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Digital Marketing RDC" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display font-bold text-gradient">Digital Marketing RDC</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/share/1CKVh6mr7M/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/digital_marketing_rdc?igsh=ODN0Njd1Y3kwbm1l&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@digital_marketing_rdc?_r=1&_t=ZN-95ILjxPEZvy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <TikTokIcon />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Digital Marketing RDC. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
