'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Preset, ApplyMode } from '@shifts/types';
import { useApplyPreset, useShiftTypes } from '@/shared/hooks';
import { previewPreset, Conflict } from '@/shared/lib/applyPreset';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  const { data: shiftTypes = [] } = useShiftTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [previewData, setPreviewData] = useState<{
    totalDays: number;
    occupiedDays: number;
    emptyDays: number;
  } | null>(null);
  const [conflictAction, setConflictAction] = useState<
    'overwrite' | 'skip' | 'cancel'
  >('overwrite');

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
  const mode = useWatch({ control, name: 'mode' });

  const handlePreview = async () => {
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate))
      return;

    setIsPreviewing(true);
    try {
      const result = await previewPreset({
        preset,
        startDate,
        endDate,
        mode,
      });
      setConflicts(result.conflicts);
      setPreviewData({
        totalDays: result.totalDays,
        occupiedDays: result.occupiedDays,
        emptyDays: result.emptyDays,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Ошибка при предпросмотре');
    } finally {
      setIsPreviewing(false);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);
    try {
      await applyMutation.mutateAsync({
        preset,
        startDate: data.startDate,
        endDate: data.endDate,
        mode: data.mode,
        onConflictResolve: async () => conflictAction,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Apply error:', error);
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Применить пресет: {preset.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-sm text-destructive">
              Начальная дата не может быть позже конечной
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="mode">Режим применения</Label>
            <Select
              value={mode}
              onValueChange={(value) => {
                if (value !== null) {
                  register('mode').onChange({ target: { value } });
                }
              }}
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

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isPreviewing}
            >
              {isPreviewing ? 'Загрузка...' : 'Предпросмотр'}
            </Button>
          </div>

          {previewData && (
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              <div>
                Всего дней:{' '}
                <span className="font-medium">{previewData.totalDays}</span>
              </div>
              <div>
                Свободных дней:{' '}
                <span className="font-medium text-green-600">
                  {previewData.emptyDays}
                </span>
              </div>
              <div>
                Занятых дней:{' '}
                <span className="font-medium text-orange-600">
                  {previewData.occupiedDays}
                </span>
              </div>
              {conflicts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="font-medium text-destructive">
                    Обнаружены конфликты:
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {conflicts.map((c) => {
                      const type = shiftTypes.find(
                        (t) => t.id === c.proposedTypeId
                      );
                      const label = type
                        ? `${type.emoji} ${type.name}`
                        : c.proposedTypeId.slice(0, 4) + '...';
                      return (
                        <div
                          key={c.date}
                          className="text-xs flex justify-between"
                        >
                          <span>
                            {format(parseISO(c.date), 'd MMM', { locale: ru })}
                          </span>
                          <span>занято → {label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <Label>Действие при конфликтах:</Label>
                    <Select
                      value={conflictAction}
                      onValueChange={(value) => {
                        if (value !== null) {
                          setConflictAction(value);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overwrite">
                          Перезаписать все
                        </SelectItem>
                        <SelectItem value="skip">
                          Пропустить занятые дни
                        </SelectItem>
                        <SelectItem value="cancel">
                          Отменить применение
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Применение...' : 'Применить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
