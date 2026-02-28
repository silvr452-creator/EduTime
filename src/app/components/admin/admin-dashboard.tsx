import { useState } from 'react';
import { BookOpen, LogOut, User, Plus, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScheduleTable } from '@/app/components/admin/schedule-table';
import { AddEditLessonDialog } from '@/app/components/admin/add-edit-lesson-dialog';
import { ScheduleItem } from '@/app/types/schedule';
import { toast } from 'sonner';

interface AdminDashboardProps {
  userName: string;
  onLogout: () => void;
  scheduleData: Record<string, ScheduleItem[]>;
  onAddLesson: (lesson: Omit<ScheduleItem, 'id'>) => Promise<void>;
  onEditLesson: (lesson: ScheduleItem) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
}

export function AdminDashboard({
  userName,
  onLogout,
  scheduleData,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'group' | 'teacher'>('group');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddLesson = async (lesson: Omit<ScheduleItem, 'id'>) => {
    try {
      await onAddLesson(lesson);
      setIsAddDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось добавить занятие';
      toast.error(message);
    }
  };

  const handleEditLesson = async (lesson: ScheduleItem) => {
    try {
      await onEditLesson(lesson);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить занятие';
      toast.error(message);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await onDeleteLesson(lessonId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить занятие';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Панель администратора</h1>
                <p className="text-sm text-gray-600 mt-0.5">Управление расписанием</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-gray-500 font-normal">Администратор</p>
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
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={`Поиск по ${selectedFilter === 'group' ? 'группе' : 'преподавателю'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs
                  value={selectedFilter}
                  onValueChange={(value) => setSelectedFilter(value as 'group' | 'teacher')}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="group">По группе</TabsTrigger>
                    <TabsTrigger value="teacher">По преподавателю</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить занятие
              </Button>
            </div>
          </div>

          <ScheduleTable
            scheduleData={scheduleData}
            searchQuery={searchQuery}
            filterType={selectedFilter}
            onEdit={handleEditLesson}
            onDelete={handleDeleteLesson}
          />
        </div>
      </main>

      <AddEditLessonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddLesson}
      />
    </div>
  );
}
