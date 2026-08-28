'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreatePreset, Preset } from '@shifts/types';
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
} from '@/shared/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface PresetFormProps {
  initialData?: Preset;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormValues = {
  name: string;
  sequence: { id: string }[];
};

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  sequence: z
    .array(z.object({ id: z.string().uuid() }))
    .min(1, 'Добавьте хотя бы один тип смены'),
});

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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      sequence: initialData?.sequence.map((id) => ({ id })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sequence',
  });

  const addShiftType = () => {
    if (shiftTypes.length > 0) {
      append({ id: shiftTypes[0].id });
    }
  };

  const updateSequenceItem = (index: number, value: string) => {
    setValue(`sequence.${index}.id`, value);
  };

  const onSubmit = async (data: FormValues) => {
    const payload: CreatePreset = {
      name: data.name,
      sequence: data.sequence.map((item) => item.id),
    };
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Preset form error:', error);
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
                onValueChange={(value) => {
                  if (value !== null) {
                    updateSequenceItem(index, value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <span>
                    {sequence[index]
                      ? (() => {
                          const found = shiftTypes.find(
                            (t) => t.id === sequence[index]
                          );
                          return found
                            ? `${found.emoji} ${found.name}`
                            : 'Выберите тип смены';
                        })()
                      : 'Выберите тип смены'}
                  </span>
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
