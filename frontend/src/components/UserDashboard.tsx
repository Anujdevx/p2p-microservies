'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Trash2, UserPlus } from 'lucide-react';

export default function UserDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch people', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email) return;
    try {
      await userService.createUser(newUser);
      setNewUser({ name: '', email: '' });
      setOpen(false);
      fetchUsers();
    } catch (err) { }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      fetchUsers();
    } catch (err) { }
  };

  return (
    <Card className="border-none shadow-2xl bg-white dark:bg-[#111113] ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-3xl overflow-hidden">
      <CardHeader className="bg-primary p-8 flex flex-col md:flex-row md:items-center justify-between text-[#09090b]">
        <div>
          <CardTitle className="text-3xl flex items-center gap-3 font-black">
            <Users className="h-8 w-8 text-[#09090b] opacity-80" /> Team Members
          </CardTitle>
          <CardDescription className="text-[#09090b]/80 mt-2 text-base font-bold">See everyone who is a part of your team, and easily add new people.</CardDescription>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="mt-6 md:mt-0 bg-[#09090b] text-primary hover:bg-black h-12 px-6 rounded-xl font-black shadow-lg transition-all hover:-translate-y-1">
              <UserPlus className="mr-2 h-5 w-5" /> Invite a Person
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl dark:bg-[#111113]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add a new person</DialogTitle>
              <DialogDescription className="text-base">We just need their name and email.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">Full Name</Label>
                <Input id="name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="h-12 bg-slate-50 text-lg rounded-xl" placeholder="E.g. John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-base">Email Address</Label>
                <Input id="email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="h-12 bg-slate-50 text-lg rounded-xl" placeholder="john@example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-primary hover:bg-orange-600 h-14 text-lg w-full rounded-xl text-[#09090b] font-black transition-all shadow-xl">Add Person to Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-8">
        {loading ? (
          <div className="flex justify-center p-12 animate-pulse text-slate-400 font-medium text-lg">Gathering people...</div>
        ) : users.length === 0 ? (
          <div className="text-center p-16 text-slate-500 border-3 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No people yet</h3>
            <p className="text-lg">Invite your first team member by clicking the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-zinc-50 dark:bg-[#1a1a1d] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-primary transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-[#09090b] text-xl font-black shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{user.name}</h3>
                    <p className="text-zinc-500 font-medium">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
