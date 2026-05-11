import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Trash2 } from "lucide-react";

interface Factor {
  id: string;
  friendly_name?: string;
  status: string;
}

const MfaSection = () => {
  const { toast } = useToast();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []) as Factor[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startEnroll = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `DLM-${Date.now()}` });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolling(true);
  };

  const verifyEnroll = async () => {
    if (!factorId || !code) return;
    setLoading(true);
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chalErr || !chal) {
      setLoading(false);
      toast({ title: "Erreur", description: chalErr?.message || "Challenge échoué", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: chal.id, code });
    setLoading(false);
    if (error) {
      toast({ title: "Code invalide", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "2FA activée", description: "Votre compte est protégé par l'authentification à deux facteurs." });
    setEnrolling(false);
    setQr(null);
    setSecret(null);
    setFactorId(null);
    setCode("");
    refresh();
  };

  const cancelEnroll = async () => {
    if (factorId) await supabase.auth.mfa.unenroll({ factorId });
    setEnrolling(false);
    setQr(null);
    setSecret(null);
    setFactorId(null);
    setCode("");
  };

  const removeFactor = async (id: string) => {
    if (!confirm("Désactiver la 2FA pour ce compte ?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "2FA désactivée" });
      refresh();
    }
  };

  const verified = factors.filter((f) => f.status === "verified");
  const hasMfa = verified.length > 0;

  return (
    <div className="glass rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        {hasMfa ? <ShieldCheck className="text-green-400" /> : <Shield className="text-muted-foreground" />}
        <div>
          <h3 className="font-display text-lg font-bold">Authentification à deux facteurs (2FA)</h3>
          <p className="text-xs text-muted-foreground">
            {hasMfa ? "Activée — votre compte est protégé." : "Non activée — recommandée pour les comptes admin."}
          </p>
        </div>
      </div>

      {hasMfa && !enrolling && (
        <div className="space-y-2">
          {verified.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-background/40 rounded-lg p-3">
              <span className="text-sm">{f.friendly_name || "Application TOTP"}</span>
              <Button size="sm" variant="ghost" onClick={() => removeFactor(f.id)} className="text-destructive">
                <Trash2 size={14} className="mr-1" /> Retirer
              </Button>
            </div>
          ))}
        </div>
      )}

      {!hasMfa && !enrolling && (
        <Button onClick={startEnroll} disabled={loading} className="bg-gradient-brand hover:opacity-90">
          <Shield size={16} className="mr-1" /> Activer la 2FA
        </Button>
      )}

      {enrolling && qr && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scannez ce QR code avec Google Authenticator, Authy ou 1Password, puis saisissez le code à 6 chiffres.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="bg-white p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: qr }} />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground">Clé manuelle :</p>
              <code className="block bg-background/40 p-2 rounded text-xs break-all">{secret}</code>
              <Label htmlFor="totp-code" className="mt-2">Code à 6 chiffres</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
              <div className="flex gap-2">
                <Button onClick={verifyEnroll} disabled={loading || code.length !== 6} className="bg-gradient-brand">
                  Vérifier et activer
                </Button>
                <Button variant="ghost" onClick={cancelEnroll}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MfaSection;
