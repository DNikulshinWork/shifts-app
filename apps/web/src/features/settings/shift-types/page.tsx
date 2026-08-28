'use client';

import { useState } from 'react';
import { useShiftTypes, useDeleteShiftType } from '@/shared/hooks';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ShiftTypeForm } from '@/features/settings/ui/ShiftTypeForm';

export default function ShiftTypesPage() {
  const { data: shiftTypes = [], isLoading, error } = useShiftTypes();
  const deleteMutation = useDeleteShiftType();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот тип смены?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Тип смены удалён'),
        onError: () => toast.error('Ошибка при удалении'),
      });
    }
  };

  if (isLoading) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-destructive">Ошибка загрузки</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Типы смен</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый тип смены</DialogTitle>
            </DialogHeader>
            <ShiftTypeForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success('Тип смены создан');
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {shiftTypes.map((type) => (
          <Card key={type.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-lg font-medium">
                {type.emoji} {type.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {type.durationHours}ч · {type.category}
              </span>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(type.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Редактировать тип смены</DialogTitle>
                  </DialogHeader>
                  <ShiftTypeForm
                    initialData={type}
                    onSuccess={() => {
                      setEditingId(null);
                      toast.success('Тип смены обновлён');
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(type.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
