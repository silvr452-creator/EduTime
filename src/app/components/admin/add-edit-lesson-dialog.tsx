import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  LessonType,
  LessonUpsertPayload,
  ScheduleItem,
  ScheduleReferenceData,
  WeekDay,
} from '@/app/types/schedule';

interface AddEditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: ((lesson: LessonUpsertPayload) => void | Promise<void>) |
    ((lessonId: string, lesson: LessonUpsertPayload) => void | Promise<void>);
  initialData?: ScheduleItem;
  referenceData: ScheduleReferenceData;
}

const DAYS: Array<{ value: WeekDay; label: string }> = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
];

const LESSON_TYPES: Array<{ value: LessonType; label: string }> = [
  { value: 'lecture', label: 'Лекция' },
  { value: 'practice', label: 'Практика' },
  { value: 'lab', label: 'Лабораторная работа' },
];

const parseTimeRange = (timeRange: string) => {
  const [startTime = '', endTime = ''] = timeRange.split('-').map((part) => part.trim());
  return { startTime, endTime };
};

export function AddEditLessonDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  referenceData,
}: AddEditLessonDialogProps) {
  const [formData, setFormData] = useState<LessonUpsertPayload>({
    day: 'monday',
    startTime: '',
    endTime: '',
    subjectId: 0,
    teacherId: 0,
    groupId: 0,
    classroomId: 0,
    type: 'lecture',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        day: initialData.day,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        subjectId: initialData.subjectId,
        teacherId: initialData.teacherId,
        groupId: initialData.groupId,
        classroomId: initialData.classroomId,
        type: initialData.type,
      });
      setErrors({});
      return;
    }

    const defaultSubject = referenceData.subjects[0]?.id ?? 0;
    const defaultTeacher = referenceData.teachers[0]?.id ?? 0;
    const defaultGroup = referenceData.groups[0]?.id ?? 0;
    const defaultClassroom = referenceData.classrooms[0]?.id ?? 0;

    setFormData({
      day: 'monday',
      startTime: '',
      endTime: '',
      subjectId: defaultSubject,
      teacherId: defaultTeacher,
      groupId: defaultGroup,
      classroomId: defaultClassroom,
      type: 'lecture',
    });
    setErrors({});
  }, [initialData, open, referenceData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startTime.trim()) newErrors.startTime = 'Введите время начала';
    if (!formData.endTime.trim()) newErrors.endTime = 'Введите время окончания';
    if (!formData.subjectId) newErrors.subjectId = 'Выберите предмет';
    if (!formData.teacherId) newErrors.teacherId = 'Выберите преподавателя';
    if (!formData.groupId) newErrors.groupId = 'Выберите группу';
    if (!formData.classroomId) newErrors.classroomId = 'Выберите аудиторию';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (initialData) {
      await (onSave as (lessonId: string, lesson: LessonUpsertPayload) => Promise<void>)(
        initialData.id,
        formData
      );
    } else {
      await (onSave as (lesson: LessonUpsertPayload) => Promise<void>)(formData);
    }

    onOpenChange(false);
  };

  const handleTimeRangeChange = (value: string) => {
    const parsed = parseTimeRange(value);
    setFormData((prev) => ({ ...prev, ...parsed }));
    if (errors.startTime || errors.endTime) {
      setErrors((prev) => ({ ...prev, startTime: '', endTime: '' }));
    }

    onOpenChange(false);
  };

  const handleSelectNumber = (field: keyof LessonUpsertPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as LessonType }));
  };

  const timeRange =
    formData.startTime && formData.endTime
      ? `${formData.startTime} - ${formData.endTime}`
      : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Редактировать занятие' : 'Добавить занятие'}</DialogTitle>
          <DialogDescription>
            Форма использует реальные справочники БД (предметы, группы, преподаватели, аудитории).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">День недели</Label>
              <Select value={formData.day} onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value as WeekDay }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeRange">Время (формат: 08:30 - 10:00)</Label>
              <Input
                id="timeRange"
                placeholder="08:30 - 10:00"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className={errors.startTime || errors.endTime ? 'border-red-500' : ''}
              />
              {(errors.startTime || errors.endTime) && (
                <p className="text-sm text-red-600">{errors.startTime || errors.endTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Предмет</Label>
              <Select
                value={formData.subjectId ? String(formData.subjectId) : ''}
                onValueChange={(value) => handleSelectNumber('subjectId', value)}
              >
                <SelectTrigger className={errors.subjectId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип занятия</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Группа</Label>
              <Select
                value={formData.groupId ? String(formData.groupId) : ''}
                onValueChange={(value) => handleSelectNumber('groupId', value)}
              >
                <SelectTrigger className={errors.groupId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.groups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.groupId && <p className="text-sm text-red-600">{errors.groupId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Преподаватель</Label>
              <Select
                value={formData.teacherId ? String(formData.teacherId) : ''}
                onValueChange={(value) => handleSelectNumber('teacherId', value)}
              >
                <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && <p className="text-sm text-red-600">{errors.teacherId}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="room">Аудитория</Label>
              <Select
                value={formData.classroomId ? String(formData.classroomId) : ''}
                onValueChange={(value) => handleSelectNumber('classroomId', value)}
              >
                <SelectTrigger className={errors.classroomId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите аудиторию" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.classrooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classroomId && <p className="text-sm text-red-600">{errors.classroomId}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {initialData ? 'Сохранить изменения' : 'Добавить занятие'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
