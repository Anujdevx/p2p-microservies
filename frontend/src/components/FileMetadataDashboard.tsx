'use client';

import { useState, useEffect } from 'react';
import { fileMetadataService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, RefreshCw } from 'lucide-react';

interface FileMetadata {
  id: number;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  checksum: string;
  ownerId: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function FileMetadataDashboard() {
  const [metadata, setMetadata] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMetadata, setNewMetadata] = useState({
    fileName: '',
    fileType: '',
    fileSize: 0,
    ownerId: '',
    description: '',
  });

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const response = await fileMetadataService.getAllMetadata();
      setMetadata(response.data);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleCreate = async () => {
    try {
      await fileMetadataService.createMetadata({
        ...newMetadata,
        status: 'COMPLETED',
        checksum: 'auto-generated',
      });
      setNewMetadata({ fileName: '', fileType: '', fileSize: 0, ownerId: '', description: '' });
      fetchMetadata();
    } catch (error) {
      console.error('Failed to create metadata:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileMetadataService.deleteMetadata(fileId);
      fetchMetadata();
    } catch (error) {
      console.error('Failed to delete metadata:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'UPLOADING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            File Metadata Manager
          </CardTitle>
          <CardDescription>Track and manage file metadata across your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>File Name</Label>
              <Input
                value={newMetadata.fileName}
                onChange={(e) => setNewMetadata({ ...newMetadata, fileName: e.target.value })}
                placeholder="document.pdf"
              />
            </div>
            <div>
              <Label>File Type</Label>
              <Input
                value={newMetadata.fileType}
                onChange={(e) => setNewMetadata({ ...newMetadata, fileType: e.target.value })}
                placeholder="application/pdf"
              />
            </div>
            <div>
              <Label>File Size (bytes)</Label>
              <Input
                type="number"
                value={newMetadata.fileSize}
                onChange={(e) => setNewMetadata({ ...newMetadata, fileSize: parseInt(e.target.value) })}
                placeholder="1024000"
              />
            </div>
            <div>
              <Label>Owner ID</Label>
              <Input
                value={newMetadata.ownerId}
                onChange={(e) => setNewMetadata({ ...newMetadata, ownerId: e.target.value })}
                placeholder="user123"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={newMetadata.description}
                onChange={(e) => setNewMetadata({ ...newMetadata, description: e.target.value })}
                placeholder="Important document for project X"
              />
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full">
            Create Metadata Entry
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All File Metadata</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchMetadata} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metadata.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fileName}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{item.fileType}</TableCell>
                  <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                  <TableCell>{item.ownerId}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.fileId)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
