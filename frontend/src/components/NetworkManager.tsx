'use client';

import { useState, useEffect } from 'react';
import { networkService, peerService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Plus } from 'lucide-react';

export default function NetworkManager() {
  const [activePeers, setActivePeers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [searchUsername, setSearchUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);

  const fetchNetwork = async () => {
    // Don't attempt network calls without a valid token
    if (!localStorage.getItem('auth_token')) return;
    try {
      const [peersRes, contactsRes, groupsRes] = await Promise.all([
        peerService.fetchActivePeers(),
        networkService.fetchContactPeers(),
        networkService.fetchMyGroups(),
      ]);
      setActivePeers(peersRes.data || []);
      setContacts(contactsRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (err) {
      console.error('Failed to load network', err);
    }
  };

  useEffect(() => {
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 10000);
    // Also refresh immediately when user logs in
    window.addEventListener('authStatusChange', fetchNetwork);
    return () => {
      clearInterval(interval);
      window.removeEventListener('authStatusChange', fetchNetwork);
    };
  }, []);

  const handleAddContact = async (username: string) => {
    try {
      await networkService.addContact(username);
      setSearchUsername('');
      fetchNetwork();
    } catch (err) {
      console.error('Add contact failed', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedForGroup.length === 0) return;
    try {
      await networkService.createGroup(groupName, selectedForGroup);
      setGroupName('');
      setSelectedForGroup([]);
      fetchNetwork();
    } catch (err) {
      console.error('Create group failed', err);
    }
  };

  const toggleGroupSelection = (username: string) => {
    setSelectedForGroup(prev => 
      prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Search & Contacts */}
      <Card className="border-none shadow-xl bg-white dark:bg-[#111113] rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="text-primary" /> Contacts</CardTitle>
          <CardDescription>Add people to interact securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search username to add..." 
              value={searchUsername} 
              onChange={e => setSearchUsername(e.target.value)} 
              className="bg-slate-50 dark:bg-zinc-900 rounded-xl"
            />
            <Button onClick={() => handleAddContact(searchUsername)} disabled={!searchUsername} className="rounded-xl bg-primary text-black font-bold">Add</Button>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="font-bold text-sm text-zinc-500">Your Active Contacts</h4>
            {contacts.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No contacts currently online.</p>
            ) : (
              contacts.map(c => (
                <div key={c.peerId} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between border border-emerald-500/20">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {c.peerId}
                  </span>
                  <span className="text-xs text-zinc-500">{c.ipAddress}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Groups */}
      <Card className="border-none shadow-xl bg-white dark:bg-[#111113] rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> Mesh Groups</CardTitle>
          <CardDescription>Bundle contacts for WebRTC broadcasting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Input 
              placeholder="New Group Name" 
              value={groupName} 
              onChange={e => setGroupName(e.target.value)} 
              className="bg-slate-50 dark:bg-zinc-900 rounded-xl"
            />
            
            <div className="flex flex-wrap gap-2">
              {contacts.map(c => (
                <button 
                  key={c.peerId}
                  onClick={() => toggleGroupSelection(c.peerId)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${selectedForGroup.includes(c.peerId) ? 'bg-primary text-black' : 'bg-slate-100 dark:bg-zinc-800 text-zinc-500'}`}
                >
                  {c.peerId}
                </button>
              ))}
            </div>

            <Button onClick={handleCreateGroup} disabled={!groupName || selectedForGroup.length === 0} className="rounded-xl w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Create Group
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="font-bold text-sm text-zinc-500">Your Groups</h4>
            {groups.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No groups defined yet.</p>
            ) : (
              groups.map(g => (
                <div key={g.id} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="font-black text-primary">{g.name}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
