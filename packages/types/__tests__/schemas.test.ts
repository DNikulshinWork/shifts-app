import { describe, it, expect } from 'vitest';
import {
  ShiftTypeSchema,
  CreateShiftTypeSchema,
  UpdateShiftTypeSchema,
  ShiftSchema,
  CreateShiftSchema,
  UpdateShiftSchema,
  PresetSchema,
  CreatePresetSchema,
  UpdatePresetSchema,
  PresetMetaSchema,
  CreatePresetMetaSchema,
  UpdatePresetMetaSchema,
} from '../src';

describe('ShiftTypeSchema', () => {
  const validType = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Day',
    color: '#ff0000',
    emoji: '☀️',
    durationHours: 12,
    category: 'day',
  };

  it('should validate a valid shift type', () => {
    expect(() => ShiftTypeSchema.parse(validType)).not.toThrow();
  });

  it('should reject invalid color', () => {
    const invalid = { ...validType, color: 'red' };
    expect(() => ShiftTypeSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid category', () => {
    const invalid = { ...validType, category: 'invalid' };
    expect(() => ShiftTypeSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid UUID for id', () => {
    const invalid = { ...validType, id: 'not-uuid' };
    expect(() => ShiftTypeSchema.parse(invalid)).toThrow();
  });
});

describe('CreateShiftTypeSchema', () => {
  it('should allow missing id, createdAt, updatedAt', () => {
    const data = {
      name: 'Night',
      color: '#0000ff',
      emoji: '🌙',
      durationHours: 8,
      category: 'night',
    };
    expect(() => CreateShiftTypeSchema.parse(data)).not.toThrow();
  });
});

describe('UpdateShiftTypeSchema', () => {
  it('should require id', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Updated',
    };
    expect(() => UpdateShiftTypeSchema.parse(data)).not.toThrow();
  });

  it('should allow partial fields', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      color: '#00ff00',
    };
    expect(() => UpdateShiftTypeSchema.parse(data)).not.toThrow();
  });

  it('should reject without id', () => {
    const data = { name: 'No ID' };
    expect(() => UpdateShiftTypeSchema.parse(data)).toThrow();
  });
});

describe('ShiftSchema', () => {
  const validShift = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: '123e4567-e89b-12d3-a456-426614174099',
    date: '2025-01-01',
    typeId: '123e4567-e89b-12d3-a456-426614174000',
    note: 'Test note',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should validate a valid shift', () => {
    expect(() => ShiftSchema.parse(validShift)).not.toThrow();
  });

  it('should allow missing userId', () => {
    const { userId, ...rest } = validShift;
    expect(() => ShiftSchema.parse(rest)).not.toThrow();
  });

  it('should reject invalid date format', () => {
    const invalid = { ...validShift, date: '01-01-2025' };
    expect(() => ShiftSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid UUID for typeId', () => {
    const invalid = { ...validShift, typeId: 'not-uuid' };
    expect(() => ShiftSchema.parse(invalid)).toThrow();
  });
});

describe('CreateShiftSchema', () => {
  it('should allow missing id, createdAt, updatedAt', () => {
    const data = {
      date: '2025-01-01',
      typeId: '123e4567-e89b-12d3-a456-426614174000',
      note: 'New shift',
    };
    expect(() => CreateShiftSchema.parse(data)).not.toThrow();
  });
});

describe('UpdateShiftSchema', () => {
  it('should require id', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      note: 'Updated note',
    };
    expect(() => UpdateShiftSchema.parse(data)).not.toThrow();
  });
});

describe('PresetSchema', () => {
  const validPreset = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    userId: '123e4567-e89b-12d3-a456-426614174099',
    name: 'Weekend',
    sequence: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  };

  it('should validate a valid preset', () => {
    expect(() => PresetSchema.parse(validPreset)).not.toThrow();
  });

  it('should reject empty sequence', () => {
    const invalid = { ...validPreset, sequence: [] };
    expect(() => PresetSchema.parse(invalid)).toThrow();
  });

  it('should allow missing userId', () => {
    const { userId, ...rest } = validPreset;
    expect(() => PresetSchema.parse(rest)).not.toThrow();
  });
});

describe('CreatePresetSchema', () => {
  it('should allow missing id, createdAt, updatedAt', () => {
    const data = {
      name: 'Night shifts',
      sequence: ['123e4567-e89b-12d3-a456-426614174000'],
    };
    expect(() => CreatePresetSchema.parse(data)).not.toThrow();
  });
});

describe('PresetMetaSchema', () => {
  const validMeta = {
    presetId: '123e4567-e89b-12d3-a456-426614174002',
    userId: '123e4567-e89b-12d3-a456-426614174099',
    referenceDate: '2025-01-01',
    referenceIndex: 0,
    lastAppliedAt: new Date().toISOString(),
    dirty: false,
  };

  it('should validate valid meta', () => {
    expect(() => PresetMetaSchema.parse(validMeta)).not.toThrow();
  });

  it('should allow missing userId and lastAppliedAt', () => {
    const { userId, lastAppliedAt, ...rest } = validMeta;
    expect(() => PresetMetaSchema.parse(rest)).not.toThrow();
  });

  it('should reject invalid referenceDate', () => {
    const invalid = { ...validMeta, referenceDate: '01-01-2025' };
    expect(() => PresetMetaSchema.parse(invalid)).toThrow();
  });
});

describe('CreatePresetMetaSchema', () => {
  it('should allow missing presetId', () => {
    const data = {
      referenceDate: '2025-01-01',
      referenceIndex: 0,
      dirty: false,
    };
    expect(() => CreatePresetMetaSchema.parse(data)).not.toThrow();
  });
});

describe('UpdatePresetMetaSchema', () => {
  it('should require presetId', () => {
    const data = {
      presetId: '123e4567-e89b-12d3-a456-426614174002',
      dirty: true,
    };
    expect(() => UpdatePresetMetaSchema.parse(data)).not.toThrow();
  });
});
