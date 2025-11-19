import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Sign In State
    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");

    // Register State
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
                toast({
                    title: "Welcome back!",
                    description: "You've successfully signed in.",
                });
                navigate("/");
            }
        } catch (error: any) {
            toast({
                title: "Error signing in",
                description: error.message,
                variant: "destructive",
            });
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
                    data: {
                        full_name: registerFullName,
                    },
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });

            if (error) throw error;

            if (data.user) {
                toast({
                    title: "Account created!",
                    description: "Welcome to PRP AI Agent. You can now sign in.",
                });
                navigate("/");
            }
        } catch (error: any) {
            toast({
                title: "Error creating account",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
            <Card className="w-full max-w-md border-[hsl(var(--border))]">
                <CardHeader className="space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center gold-glow">
                            <span className="text-3xl">🤖</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center text-[hsl(var(--foreground))]">
                        PRP AI Agent
                    </CardTitle>
                    <CardDescription className="text-center text-[hsl(var(--muted-foreground))]">
                        Your Interactive Mentor for Professional Readiness
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin">
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signin-email">Email</Label>
                                    <Input
                                        id="signin-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signInEmail}
                                        onChange={(e) => setSignInEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signin-password">Password</Label>
                                    <Input
                                        id="signin-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signInPassword}
                                        onChange={(e) => setSignInPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Full Name</Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={registerFullName}
                                        onChange={(e) => setRegisterFullName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;