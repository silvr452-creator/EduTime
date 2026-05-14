import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const DAYS = [
  { id: 'monday', label: 'Пн', fullLabel: 'Понедельник' },
  { id: 'tuesday', label: 'Вт', fullLabel: 'Вторник' },
  { id: 'wednesday', label: 'Ср', fullLabel: 'Среда' },
  { id: 'thursday', label: 'Чт', fullLabel: 'Четверг' },
  { id: 'friday', label: 'Пт', fullLabel: 'Пятница' },
  { id: 'saturday', label: 'Сб', fullLabel: 'Суббота' },
];

interface WeekNavigationProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
}

export function WeekNavigation({
  selectedDay,
  onDayChange,
}: WeekNavigationProps) {
  const currentIndex = DAYS.findIndex((day) => day.id === selectedDay);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onDayChange(DAYS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < DAYS.length - 1) {
      onDayChange(DAYS[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Расписание</h2>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === DAYS.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Desktop view - all days */}
      <div className="hidden md:grid md:grid-cols-6 gap-2">
        {DAYS.map((day) => (
          <button
            key={day.id}
            onClick={() => onDayChange(day.id)}
            className={`px-4 py-3 rounded-lg transition-all ${
              selectedDay === day.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="text-xs opacity-80">{day.label}</div>
            <div className="text-sm font-medium mt-1">{day.fullLabel}</div>
          </button>
        ))}
      </div>

      {/* Mobile view - single day with navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-center">
          <div className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-center">
            <div className="text-sm opacity-90">
              {DAYS[currentIndex]?.label}
            </div>
            <div className="text-lg font-semibold mt-1">
              {DAYS[currentIndex]?.fullLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
