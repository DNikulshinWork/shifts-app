'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePresetSchema, CreatePreset, Preset } from '@shifts/types';
import {
  useCreatePreset,
  useUpdatePreset,
  useShiftTypes,
} from '@/shared/hooks';
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
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface PresetFormProps {
  initialData?: Preset;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PresetForm({
  initialData,
  onSuccess,
  onCancel,
}: PresetFormProps) {
  const createMutation = useCreatePreset();
  const updateMutation = useUpdatePreset();
  const { data: shiftTypes = [] } = useShiftTypes();

  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePreset>({
    resolver: zodResolver(CreatePresetSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          sequence: initialData.sequence,
        }
      : {
          name: '',
          sequence: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sequence',
  });

  const sequence = watch('sequence');

  const addShiftType = () => {
    if (shiftTypes.length > 0) {
      append(shiftTypes[0].id);
    }
  };

  const updateSequence = (index: number, value: string) => {
    const newSequence = [...sequence];
    newSequence[index] = value;
    setValue('sequence', newSequence);
  };

  const onSubmit = async (data: CreatePreset) => {
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      toast.error(isEdit ? 'Ошибка обновления' : 'Ошибка создания');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название пресета</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Последовательность смен</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <Select
                value={sequence[index] || ''}
                onValueChange={(value) => updateSequence(index, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите тип смены" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.emoji} {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addShiftType}
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить тип смены
        </Button>
        {errors.sequence && (
          <p className="text-sm text-destructive">{errors.sequence.message}</p>
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
