'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Preset, ApplyMode } from '@shifts/types';
import { useApplyPreset } from '@/shared/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Label } from '@/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

const applySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)'),
  mode: z.enum(['overwrite', 'fill-empty', 'continue']),
});

type ApplyFormData = {
  startDate: string;
  endDate: string;
  mode: ApplyMode;
};

interface ApplyPresetDialogProps {
  preset: Preset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export function ApplyPresetDialog({
  preset,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: ApplyPresetDialogProps) {
  const applyMutation = useApplyPreset();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      mode: 'overwrite',
    },
  });

  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);
    try {
      await applyMutation.mutateAsync({
        preset,
        startDate: data.startDate,
        endDate: data.endDate,
        mode: data.mode,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Apply preset error:', error);
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Применить пресет: {preset.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Начальная дата</Label>
            <Input id="startDate" type="date" {...register('startDate')} />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Конечная дата</Label>
            <Input id="endDate" type="date" {...register('endDate')} />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-sm text-destructive">
              Начальная дата не может быть позже конечной
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="mode">Режим применения</Label>
            <Select
              defaultValue="overwrite"
              onValueChange={(value) =>
                register('mode').onChange({ target: { value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите режим" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overwrite">
                  Перезаписать все смены
                </SelectItem>
                <SelectItem value="fill-empty">
                  Заполнить только пустые дни
                </SelectItem>
                <SelectItem value="continue">
                  Продолжить последовательность
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.mode && (
              <p className="text-sm text-destructive">{errors.mode.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Применить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
