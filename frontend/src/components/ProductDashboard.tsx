'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Trash2, Plus, ArrowRight } from 'lucide-react';

export default function ProductDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  const fetchProducts = async () => {
    try {
      const res = await productService.getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await productService.createProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price)
      });
      setNewProduct({ name: '', price: '' });
      setOpen(false);
      fetchProducts();
    } catch (err) { }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) { }
  };

  return (
    <Card className="border-none shadow-2xl bg-white dark:bg-[#111113] ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-3xl overflow-hidden">
      <CardHeader className="bg-primary p-8 flex flex-col md:flex-row md:items-center justify-between text-[#09090b]">
        <div>
          <CardTitle className="text-3xl flex items-center gap-3 font-black">
            <ShoppingBag className="h-8 w-8 text-[#09090b] opacity-80" /> Store Items
          </CardTitle>
          <CardDescription className="text-[#09090b]/80 mt-2 text-base font-bold">Keep track of everything you have available to sell.</CardDescription>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="mt-6 md:mt-0 bg-[#09090b] text-primary hover:bg-black h-12 px-6 rounded-xl font-black shadow-lg transition-all hover:-translate-y-1">
              <Plus className="mr-2 h-5 w-5" /> Add a New Item
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl dark:bg-[#111113]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add an item to your store</DialogTitle>
              <DialogDescription className="text-base">What would you like to add today?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">What is the item called?</Label>
                <Input id="name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="h-12 bg-slate-50 text-lg rounded-xl" placeholder="E.g. Fresh Coffee Beans" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-base">How much does it cost?</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <Input id="price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="pl-8 h-12 bg-slate-50 text-lg rounded-xl" placeholder="12.99" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-primary hover:bg-orange-600 h-14 text-lg w-full rounded-xl text-[#09090b] font-black transition-all shadow-xl">Add It to Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-8">
        {loading ? (
          <div className="flex justify-center p-12 animate-pulse text-slate-400 font-medium text-lg">Loading your store items...</div>
        ) : products.length === 0 ? (
          <div className="text-center p-16 text-slate-500 border-3 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your store is empty</h3>
            <p className="text-lg">Click "Add a New Item" above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-zinc-50 dark:bg-[#1a1a1d] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-primary transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                     <Trash2 className="h-5 w-5" />
                   </Button>
                </div>
                <div className="w-16 h-16 bg-primary dark:bg-primary/20 text-[#09090b] dark:text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between mt-6">
                  <p className="text-3xl font-black text-primary">${product.price.toFixed(2)}</p>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
