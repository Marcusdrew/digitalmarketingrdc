import logo from "@/assets/logo-dlm.jpeg";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Digital Marketing RDC" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display font-bold text-gradient">Digital Marketing RDC</span>
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
