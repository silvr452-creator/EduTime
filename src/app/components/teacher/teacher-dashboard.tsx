import { useState, useMemo } from 'react';
import { WeekNavigation } from '@/app/components/week-navigation';
import { ScheduleCard, ScheduleItem } from '@/app/components/schedule-card';
import { BookOpen, LogOut, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';

interface TeacherDashboardProps {
  userName: string;
  onLogout: () => void;
  scheduleData: Record<string, ScheduleItem[]>;
}

export function TeacherDashboard({
  userName,
  onLogout,
  scheduleData,
}: TeacherDashboardProps) {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Получить занятия преподавателя
  const teacherLessons = useMemo(() => {
    const daySchedule = scheduleData[selectedDay] || [];
    return daySchedule.filter((item) => item.teacher === userName);
  }, [scheduleData, selectedDay, userName]);

  // Получить уникальные группы преподавателя
  const teacherGroups = useMemo(() => {
    const allLessons = Object.values(scheduleData).flat();
    const myLessons = allLessons.filter((item) => item.teacher === userName);
    return Array.from(new Set(myLessons.map((item) => item.group))).sort();
  }, [scheduleData, userName]);

  // Фильтрация по группе
  const filteredSchedule = useMemo(() => {
    if (selectedGroup === 'all') return teacherLessons;
    return teacherLessons.filter((item) => item.group === selectedGroup);
  }, [teacherLessons, selectedGroup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Моё расписание
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Преподаватель
                </p>
              </div>
            </div>

            {/* Меню пользователя */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-gray-500 font-normal">
                      Преподаватель
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-6">
          {/* Навигация по дням недели */}
          <WeekNavigation
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
          />

          {/* Фильтр по группе */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 max-w-xs space-y-2">
                <Label>Фильтр по группе</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все группы</SelectItem>
                    {teacherGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredSchedule.length > 0 && (
                <div className="text-sm text-gray-600">
                  Найдено занятий: {filteredSchedule.length}
                </div>
              )}
            </div>
          </div>

          {/* Расписание */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
            {filteredSchedule.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchedule.map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Занятий не найдено
                </h3>
                <p className="text-gray-600">
                  В этот день у вас нет занятий
                  {selectedGroup !== 'all' && ' с выбранной группой'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
