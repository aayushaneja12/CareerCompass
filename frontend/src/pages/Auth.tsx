import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Compass, ArrowRight } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      if (error) throw error;
      if (data.user) {
        toast({ title: "Welcome back!", description: "You've successfully signed in." });
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Error signing in", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: { full_name: registerFullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      if (data.user) {
        toast({ title: "Account created!", description: "Welcome to CareerCompass." });
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Error creating account", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5 gold-glow">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            CareerCompass
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your AI-powered career readiness assistant
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-6 shadow-elegant">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="signin"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 font-medium"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm text-muted-foreground">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                  ) : (
                    <><span>Create Account</span><ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          SP Jain School of Global Management • Capstone Project
        </p>
      </div>
    </div>
  );
};

export default Auth;
