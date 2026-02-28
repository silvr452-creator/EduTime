import { Search, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export interface FilterState {
  group: string;
  teacher: string;
  room: string;
}

interface ScheduleFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  groups: string[];
  teachers: string[];
  rooms: string[];
}

export function ScheduleFilters({
  filters,
  onFilterChange,
  groups,
  teachers,
  rooms,
}: ScheduleFiltersProps) {
  const hasActiveFilters = filters.group || filters.teacher || filters.room;

  const handleClearFilters = () => {
    onFilterChange({ group: '', teacher: '', room: '' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Фильтры</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Группа</label>
          <Select
            value={filters.group}
            onValueChange={(value) =>
              onFilterChange({ ...filters, group: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все группы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все группы</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Преподаватель</label>
          <Select
            value={filters.teacher}
            onValueChange={(value) =>
              onFilterChange({ ...filters, teacher: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все преподаватели" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все преподаватели</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Аудитория</label>
          <Select
            value={filters.room}
            onValueChange={(value) =>
              onFilterChange({ ...filters, room: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все аудитории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все аудитории</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room} value={room}>
                  {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
}
