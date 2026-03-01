import { useState, useMemo } from 'react';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Badge } from '@/app/components/ui/badge';
import {
  LessonUpsertPayload,
  ScheduleItem,
  ScheduleReferenceData,
} from '@/app/types/schedule';
import { AddEditLessonDialog } from '@/app/components/admin/add-edit-lesson-dialog';

interface ScheduleTableProps {
  scheduleData: Record<string, ScheduleItem[]>;
  searchQuery: string;
  filterType: 'group' | 'teacher';
  onEdit: (lessonId: string, lesson: LessonUpsertPayload) => Promise<void>;
  onDelete: (lessonId: string) => Promise<void>;
  referenceData: ScheduleReferenceData;
}

const DAY_NAMES: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

export function ScheduleTable({
  scheduleData,
  searchQuery,
  filterType,
  onEdit,
  onDelete,
  referenceData,
}: ScheduleTableProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<ScheduleItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const allLessons = useMemo(() => {
    const lessons: ScheduleItem[] = [];

    Object.values(scheduleData).forEach((dayLessons) => {
      dayLessons.forEach((lesson) => {
        lessons.push(lesson);
      });
    });

    return lessons;
  }, [scheduleData]);

  const filteredLessons = useMemo(() => {
    if (!searchQuery) return allLessons;

    const query = searchQuery.toLowerCase();

    return allLessons.filter((lesson) => {
      if (filterType === 'group') {
        return lesson.group.toLowerCase().includes(query);
      }

      return lesson.teacher.toLowerCase().includes(query);
    });
  }, [allLessons, searchQuery, filterType]);

  const handleDeleteClick = (lessonId: string) => {
    setLessonToDelete(lessonId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lessonToDelete) {
      await onDelete(lessonToDelete);
      setLessonToDelete(null);
    }

    setDeleteConfirmOpen(false);
  };

  const handleEditClick = (lesson: ScheduleItem) => {
    setEditingLesson(lesson);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async (lessonId: string, lesson: LessonUpsertPayload) => {
    await onEdit(lessonId, lesson);
    setIsEditDialogOpen(false);
    setEditingLesson(null);
  };

  const typeColors = {
    lecture: 'bg-blue-50 text-blue-700 border-blue-200',
    practice: 'bg-green-50 text-green-700 border-green-200',
    lab: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const typeLabels = {
    lecture: 'Лекция',
    practice: 'Практика',
    lab: 'Лаб. работа',
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Расписание занятий</h2>
            <Badge variant="secondary" className="ml-2">
              {filteredLessons.length} {filteredLessons.length === 1 ? 'занятие' : 'занятий'}
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>День недели</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead>Преподаватель</TableHead>
                <TableHead>Аудитория</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? 'Занятия не найдены. Попробуйте изменить поисковый запрос.'
                      : 'Расписание пусто. Добавьте первое занятие.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{DAY_NAMES[lesson.day]}</TableCell>
                    <TableCell>{lesson.time}</TableCell>
                    <TableCell className="font-medium">{lesson.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[lesson.type]}>
                        {typeLabels[lesson.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{lesson.group}</TableCell>
                    <TableCell>{lesson.teacher}</TableCell>
                    <TableCell>{lesson.room}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(lesson)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(lesson.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить это занятие? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingLesson && (
        <AddEditLessonDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditSave}
          initialData={editingLesson}
          referenceData={referenceData}
        />
      )}
    </>
  );
}
