import { Clock, MapPin, User } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

export interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  room: string;
  teacher: string;
  group: string;
  type: 'lecture' | 'practice' | 'lab';
}

interface ScheduleCardProps {
  item: ScheduleItem;
}

export function ScheduleCard({ item }: ScheduleCardProps) {
  const typeColors = {
    lecture: 'bg-blue-50 border-blue-200 text-blue-700',
    practice: 'bg-green-50 border-green-200 text-green-700',
    lab: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const typeLabels = {
    lecture: 'Лекция',
    practice: 'Практика',
    lab: 'Лабораторная',
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900 flex-1 leading-tight">
            {item.subject}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${typeColors[item.type]} whitespace-nowrap`}
          >
            {typeLabels[item.type]}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{item.time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{item.room}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{item.teacher}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
