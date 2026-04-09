'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { HierarchyContextBar } from './hierarchy-context-bar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils/cn';

interface MappingItem {
  id: string | number;
  sourceName: string;
  mappedName: string;
  status: 'Mapped' | 'Unmapped' | 'Pending';
}

interface MappingComponentProps {
  title: string;
  sourceLabel: string;
  targetLabel: string;
  items: MappingItem[];
  onSave?: (items: MappingItem[]) => void;
}

export function MappingComponent({
  title,
  sourceLabel,
  targetLabel,
  items: initialItems,
  onSave
}: MappingComponentProps) {
  const [items, setItems] = useState<MappingItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const { activeCompany } = useCompany();
  const { toast } = useToast();

  const filteredItems = items.filter(item => 
    item.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mappedName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMappingChange = (id: string | number, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, mappedName: value, status: value ? 'Mapped' : 'Unmapped' } : item
    ));
  };

  const handleSave = () => {
    if (onSave) onSave(items);
    toast({
      title: "Success",
      description: `${title} saved successfully (Prototype)`,
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Mappings
        </Button>
      </div>

      <HierarchyContextBar />

      <Card>
        <CardHeader className="pb-3 text-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder={`Search ${sourceLabel}...`} 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3 border-b">{sourceLabel}</th>
                  <th className="px-4 py-3 border-b">{targetLabel} (Business Central)</th>
                  <th className="px-4 py-3 border-b w-[150px]">Status</th>
                  <th className="px-4 py-3 border-b w-[100px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">{item.sourceName}</td>
                    <td className="px-4 py-4">
                      <Input 
                        placeholder={`Select or enter BC ${targetLabel}`}
                        value={item.mappedName}
                        onChange={(e) => handleMappingChange(item.id, e.target.value)}
                        className="h-9"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-semibold",
                        item.status === 'Mapped' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                      No items found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3 items-start">
        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">Prototype Note:</p>
          <p>This screen simulates the mapping between VMS legacy entities and Business Central's Chart of Accounts/Dimensions. In the final version, the "Target" list will be dynamically fetched from the BC API based on the selected company context.</p>
        </div>
      </div>
    </div>
  );
}
