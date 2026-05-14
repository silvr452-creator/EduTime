import { useState, useMemo } from 'react';
import { WeekNavigation } from '@/app/components/week-navigation';
import {
  ScheduleFilters,
  FilterState,
} from '@/app/components/schedule-filters';
import { ScheduleCard } from '@/app/components/schedule-card';
import { ScheduleItem } from '@/app/types/schedule';
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

interface DashboardScreenProps {
  userName: string;
  userGroup: string;
  onLogout: () => void;
  scheduleData: Record<string, ScheduleItem[]>;
  isLoading?: boolean;
}

export function DashboardScreen({
  userName,
  userGroup,
  onLogout,
  scheduleData,
  isLoading = false,
}: DashboardScreenProps) {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [filters, setFilters] = useState<FilterState>({
    group: userGroup,
    teacher: '',
    room: '',
  });

  const { groups, teachers, rooms } = useMemo(() => {
    const allSchedules = Object.values(scheduleData).flat();
    const uniqueGroups = Array.from(new Set(allSchedules.map((item) => item.group))).sort();
    const uniqueTeachers = Array.from(new Set(allSchedules.map((item) => item.teacher))).sort();
    const uniqueRooms = Array.from(new Set(allSchedules.map((item) => item.room))).sort();

    return {
      groups: uniqueGroups,
      teachers: uniqueTeachers,
      rooms: uniqueRooms,
    };
  }, [scheduleData]);

  const filteredSchedule = useMemo(() => {
    const daySchedule = scheduleData[selectedDay] || [];

    return daySchedule.filter((item) => {
      if (filters.group && filters.group !== 'all' && item.group !== filters.group) return false;
      if (filters.teacher && filters.teacher !== 'all' && item.teacher !== filters.teacher) return false;
      if (filters.room && filters.room !== 'all' && item.room !== filters.room) return false;
      return true;
    });
  }, [scheduleData, selectedDay, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Расписание занятий</h1>
                <p className="text-sm text-gray-600 mt-0.5">Группа {userGroup}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-gray-500 font-normal">Группа {userGroup}</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-6">
          <WeekNavigation selectedDay={selectedDay} onDayChange={setSelectedDay} />

          <ScheduleFilters
            filters={filters}
            onFilterChange={setFilters}
            groups={groups}
            teachers={teachers}
            rooms={rooms}
          />

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
            {isLoading ? (
              <div className="text-center py-12 text-gray-600">Загрузка расписания...</div>
            ) : filteredSchedule.length > 0 ? (
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Занятий не найдено</h3>
                <p className="text-gray-600">Попробуйте изменить фильтры или выбрать другой день</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
