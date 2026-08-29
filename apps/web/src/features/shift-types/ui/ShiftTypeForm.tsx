'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateShiftTypeSchema,
  CreateShiftType,
  ShiftType,
} from '@shifts/types';
import { useCreateShiftType, useUpdateShiftType } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Label } from '@/shared/ui';
import { toast } from 'sonner';

interface ShiftTypeFormProps {
  initialData?: ShiftType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ShiftTypeForm({
  initialData,
  onSuccess,
  onCancel,
}: ShiftTypeFormProps) {
  const createMutation = useCreateShiftType();
  const updateMutation = useUpdateShiftType();

  const isEdit = !!initialData;

  const defaultValues: CreateShiftType = initialData
    ? {
        name: initialData.name,
        color: initialData.color,
        emoji: initialData.emoji || '',
        durationHours: initialData.durationHours,
        category: initialData.category,
      }
    : {
        name: '',
        color: '#000000',
        emoji: '',
        durationHours: 12,
        category: 'day',
      };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateShiftType>({
    resolver: zodResolver(CreateShiftTypeSchema),
    defaultValues,
  });

  const onSubmit = async (data: CreateShiftType) => {
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Shift type form error:', error);
      toast.error(isEdit ? 'Ошибка обновления' : 'Ошибка создания');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Цвет</Label>
        <Input id="color" type="color" {...register('color')} />
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emoji">Эмодзи</Label>
        <Input id="emoji" {...register('emoji')} placeholder="🌙" />
        {errors.emoji && (
          <p className="text-sm text-destructive">{errors.emoji.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationHours">Длительность (часов)</Label>
        <Input
          id="durationHours"
          type="number"
          {...register('durationHours', { valueAsNumber: true })}
        />
        {errors.durationHours && (
          <p className="text-sm text-destructive">
            {errors.durationHours.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Категория</Label>
        <select
          id="category"
          {...register('category')}
          className="w-full border rounded-md p-2"
        >
          <option value="day">День</option>
          <option value="night">Ночь</option>
          <option value="off">Выходной</option>
        </select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
