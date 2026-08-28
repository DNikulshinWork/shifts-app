'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shift, ShiftType } from '@shifts/types';
import {
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useShiftTypes,
} from '@/shared/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const shiftSchema = z.object({
  typeId: z.string().uuid('Выберите тип смены'),
  note: z.string().max(500).optional(),
});

type ShiftFormData = {
  typeId: string;
  note?: string;
};

interface ShiftDialogProps {
  date: string;
  shift?: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftDialog({
  date,
  shift,
  open,
  onOpenChange,
}: ShiftDialogProps) {
  const { data: shiftTypes = [] } = useShiftTypes();
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const deleteMutation = useDeleteShift();

  const isEdit = !!shift;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      typeId: shift?.typeId || '',
      note: shift?.note || '',
    },
  });

  const selectedTypeId = useWatch({ control, name: 'typeId' });

  const onSubmit = async (data: ShiftFormData) => {
    try {
      if (isEdit && shift) {
        await updateMutation.mutateAsync({
          id: shift.id,
          payload: { typeId: data.typeId, note: data.note || '' },
        });
        toast.success('Смена обновлена');
      } else {
        await createMutation.mutateAsync({
          date,
          typeId: data.typeId,
          note: data.note || '',
        });
        toast.success('Смена создана');
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Shift form error:', error);
      toast.error(isEdit ? 'Ошибка обновления' : 'Ошибка создания');
    }
  };

  const handleDelete = async () => {
    if (!shift) return;
    if (!confirm('Удалить эту смену?')) return;
    try {
      await deleteMutation.mutateAsync(shift.id);
      toast.success('Смена удалена');
      onOpenChange(false);
    } catch (error) {
      console.error('Delete shift error:', error);
      toast.error('Ошибка удаления');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать смену' : 'Создать смену'} –{' '}
            {format(new Date(date), 'd MMMM yyyy', { locale: ru })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Тип смены</Label>
            <Select
              value={selectedTypeId}
              onValueChange={(value) => {
                if (value !== null) {
                  setValue('typeId', value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((type: ShiftType) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.emoji} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeId && (
              <p className="text-sm text-destructive">
                {errors.typeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Заметка</Label>
            <Input
              id="note"
              {...register('note')}
              placeholder="Опционально..."
            />
            {errors.note && (
              <p className="text-sm text-destructive">{errors.note.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Удалить
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
