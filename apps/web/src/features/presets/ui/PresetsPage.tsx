'use client';

import { useState } from 'react';
import { usePresets, useDeletePreset, useShiftTypes } from '@/shared/hooks';
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
import { Pencil, Trash2, Plus, Play } from 'lucide-react';
import { PresetForm } from './PresetForm';
import { ApplyPresetDialog } from './ApplyPresetDialog';

export function PresetsPage() {
  const { data: presets = [], isLoading, error } = usePresets();
  const { data: shiftTypes = [] } = useShiftTypes();
  const deleteMutation = useDeletePreset();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [applyPresetId, setApplyPresetId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот пресет?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Пресет удалён'),
        onError: () => toast.error('Ошибка при удалении'),
      });
    }
  };

  const getShiftTypeLabel = (typeId: string) => {
    const type = shiftTypes.find((t) => t.id === typeId);
    return type ? `${type.emoji} ${type.name}` : typeId.slice(0, 4) + '...';
  };

  if (isLoading) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-destructive">Ошибка загрузки</div>;

  const selectedPreset = presets.find((p) => p.id === applyPresetId);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Пресеты смен</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать пресет
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новый пресет</DialogTitle>
            </DialogHeader>
            <PresetForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success('Пресет создан');
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {presets.map((preset) => {
          const displayTypes = preset.sequence.slice(0, 4);
          const remaining = preset.sequence.length - 4;

          return (
            <Card
              key={preset.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <h3 className="font-medium">{preset.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {displayTypes.map((typeId, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted px-2 py-0.5 rounded whitespace-nowrap"
                    >
                      {getShiftTypeLabel(typeId)}
                    </span>
                  ))}
                  {remaining > 0 && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5">
                      +{remaining}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {preset.sequence.length} типов смен
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApplyPresetId(preset.id)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Применить
                </Button>
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Редактировать пресет</DialogTitle>
                    </DialogHeader>
                    <PresetForm
                      initialData={preset}
                      onSuccess={() => toast.success('Пресет обновлён')}
                      onCancel={() => {}}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(preset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedPreset && (
        <ApplyPresetDialog
          preset={selectedPreset}
          open={!!applyPresetId}
          onOpenChange={(open) => !open && setApplyPresetId(null)}
          onSuccess={() => {
            setApplyPresetId(null);
            toast.success('Пресет применён');
          }}
          onError={() => toast.error('Ошибка при применении пресета')}
        />
      )}
    </div>
  );
}
