'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthForm() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await login(username, password);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register(username, password);
    if (res.success) {
      // automatically log them in after registration
      await login(username, password);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-[#111113] ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-3xl overflow-hidden p-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">Login</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-black">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access the Dashboard.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
              </div>
              {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold rounded-xl mt-4 bg-primary text-primary-foreground">
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-black">Create Account</CardTitle>
              <CardDescription>Join to start transferring files securely.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <Input id="reg-username" value={username} onChange={e => setUsername(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
              </div>
              {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold rounded-xl mt-4 bg-primary text-primary-foreground">
                {loading ? 'Creating...' : 'Register'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
