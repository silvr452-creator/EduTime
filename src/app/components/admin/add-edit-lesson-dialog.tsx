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
import { ScheduleItem } from '@/app/components/schedule-card';

interface AddEditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lesson: ScheduleItem) => void;
  initialData?: ScheduleItem;
}

const DAYS = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
];

const GROUPS = ['ИС-21', 'ИС-22', 'ПИ-21', 'ПИ-22', 'КС-21', 'КС-22'];

const TEACHERS = [
  'Иванова А.П.',
  'Петров В.С.',
  'Смирнова О.Л.',
  'Сидоров М.Н.',
  'Волкова Е.А.',
  'Морозов И.К.',
  'Новиков П.Р.',
  'Козлов Д.И.',
];

const ROOMS = [
  'Ауд. 205',
  'Ауд. 210',
  'Ауд. 215',
  'Ауд. 301',
  'Ауд. 305',
  'Ауд. 308',
  'Ауд. 315',
  'Ауд. 320',
  'Ауд. 405',
  'Ауд. 412',
  'Спортзал',
];

const LESSON_TYPES: Array<{ value: 'lecture' | 'practice' | 'lab'; label: string }> = [
  { value: 'lecture', label: 'Лекция' },
  { value: 'practice', label: 'Практика' },
  { value: 'lab', label: 'Лабораторная работа' },
];

export function AddEditLessonDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: AddEditLessonDialogProps) {
  const [formData, setFormData] = useState({
    day: 'monday',
    subject: '',
    time: '',
    group: '',
    teacher: '',
    room: '',
    type: 'lecture' as 'lecture' | 'practice' | 'lab',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        day: 'monday', // В реальном приложении нужно получать день из данных
        subject: initialData.subject,
        time: initialData.time,
        group: initialData.group,
        teacher: initialData.teacher,
        room: initialData.room,
        type: initialData.type,
      });
    } else {
      setFormData({
        day: 'monday',
        subject: '',
        time: '',
        group: '',
        teacher: '',
        room: '',
        type: 'lecture',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Введите название предмета';
    }

    if (!formData.time.trim()) {
      newErrors.time = 'Введите время занятия';
    }

    if (!formData.group) {
      newErrors.group = 'Выберите группу';
    }

    if (!formData.teacher) {
      newErrors.teacher = 'Выберите преподавателя';
    }

    if (!formData.room) {
      newErrors.room = 'Выберите аудиторию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const lesson: ScheduleItem = {
        id: initialData?.id || `lesson-${Date.now()}`,
        subject: formData.subject,
        time: formData.time,
        group: formData.group,
        teacher: formData.teacher,
        room: formData.room,
        type: formData.type,
      };

      onSave(lesson);
      onOpenChange(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Редактировать занятие' : 'Добавить занятие'}
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о занятии. Все поля обязательны для заполнения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* День недели */}
            <div className="space-y-2">
              <Label htmlFor="day">День недели</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => handleInputChange('day', value)}
              >
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

            {/* Время */}
            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                placeholder="08:30 - 10:00"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.time ? 'border-red-500' : ''}
              />
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* Предмет */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Предмет</Label>
              <Input
                id="subject"
                placeholder="Например: Математический анализ"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Тип занятия */}
            <div className="space-y-2">
              <Label htmlFor="type">Тип занятия</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange('type', value as 'lecture' | 'practice' | 'lab')
                }
              >
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

            {/* Группа */}
            <div className="space-y-2">
              <Label htmlFor="group">Группа</Label>
              <Select
                value={formData.group}
                onValueChange={(value) => handleInputChange('group', value)}
              >
                <SelectTrigger className={errors.group ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.group && (
                <p className="text-sm text-red-600">{errors.group}</p>
              )}
            </div>

            {/* Преподаватель */}
            <div className="space-y-2">
              <Label htmlFor="teacher">Преподаватель</Label>
              <Select
                value={formData.teacher}
                onValueChange={(value) => handleInputChange('teacher', value)}
              >
                <SelectTrigger className={errors.teacher ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  {TEACHERS.map((teacher) => (
                    <SelectItem key={teacher} value={teacher}>
                      {teacher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacher && (
                <p className="text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

            {/* Аудитория */}
            <div className="space-y-2">
              <Label htmlFor="room">Аудитория</Label>
              <Select
                value={formData.room}
                onValueChange={(value) => handleInputChange('room', value)}
              >
                <SelectTrigger className={errors.room ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите аудиторию" />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.room && (
                <p className="text-sm text-red-600">{errors.room}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
