import { useEffect, useState } from 'react';
import { LoginScreen } from '@/app/components/auth/login-screen';
import { RegisterScreen, UserRole } from '@/app/components/auth/register-screen';
import { DashboardScreen } from '@/app/components/dashboard/dashboard-screen';
import { AdminDashboard } from '@/app/components/admin/admin-dashboard';
import { TeacherDashboard } from '@/app/components/teacher/teacher-dashboard';
import { toast, Toaster } from 'sonner';
import { ScheduleItem } from '@/app/types/schedule';
import { createEmptySchedule, toScheduleMap } from '@/app/lib/schedule-utils';
import {
  createLesson,
  fetchLessons,
  removeLesson,
  updateLesson,
} from '@/app/services/schedule-service';

type Screen = 'login' | 'register' | 'dashboard';

interface User {
  name: string;
  email: string;
  group?: string;
  role: UserRole;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem[]>>(
    createEmptySchedule()
  );
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const lessons = await fetchLessons();
        setScheduleData(toScheduleMap(lessons));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить расписание';
        toast.error(`Ошибка загрузки расписания: ${message}`);
      } finally {
        setScheduleLoading(false);
      }
    };

    load();
  }, []);

  const handleLogin = (email: string, password: string) => {
    let role: UserRole = 'student';
    let name = 'Иванов Иван Иванович';
    let group = 'ИС-21';

    if (email.includes('admin')) {
      role = 'admin';
      name = 'Администратор';
      group = undefined;
    } else if (email.includes('teacher') || email.includes('petrov')) {
      role = 'teacher';
      name = 'Петров В.С.';
      group = undefined;
    }

    const mockUser: User = {
      name,
      email,
      group,
      role,
    };

    setUser(mockUser);
    setCurrentScreen('dashboard');
    toast.success(`Добро пожаловать, ${mockUser.name}!`);
  };

  const handleRegister = (userData: {
    name: string;
    email: string;
    password: string;
    group?: string;
    role: UserRole;
  }) => {
    const newUser: User = {
      name: userData.name,
      email: userData.email,
      group: userData.group,
      role: userData.role,
    };

    setUser(newUser);
    setCurrentScreen('dashboard');
    toast.success(`Аккаунт успешно создан! Добро пожаловать, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    toast.success('Вы успешно вышли из системы');
  };

  const handleAddLesson = async (lesson: Omit<ScheduleItem, 'id'>) => {
    const created = await createLesson(lesson);
    setScheduleData((prev) => ({
      ...prev,
      [created.day]: [...(prev[created.day] ?? []), created],
    }));
    toast.success('Занятие добавлено');
  };

  const handleEditLesson = async (lesson: ScheduleItem) => {
    const updated = await updateLesson(lesson);
    setScheduleData((prev) => {
      const next: Record<string, ScheduleItem[]> = {};
      Object.keys(prev).forEach((day) => {
        next[day] = prev[day].filter((item) => item.id !== updated.id);
      });
      next[updated.day] = [...(next[updated.day] ?? []), updated];
      return next;
    });
    toast.success('Занятие обновлено');
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await removeLesson(lessonId);
    setScheduleData((prev) => {
      const next: Record<string, ScheduleItem[]> = {};
      Object.keys(prev).forEach((day) => {
        next[day] = prev[day].filter((item) => item.id !== lessonId);
      });
      return next;
    });
    toast.success('Занятие удалено');
  };

  return (
    <>
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'dashboard' && user && (
        <>
          {user.role === 'admin' && (
            <AdminDashboard
              userName={user.name}
              onLogout={handleLogout}
              scheduleData={scheduleData}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          )}

          {user.role === 'teacher' && (
            <TeacherDashboard
              userName={user.name}
              onLogout={handleLogout}
              scheduleData={scheduleData}
              isLoading={scheduleLoading}
            />
          )}

          {user.role === 'student' && user.group && (
            <DashboardScreen
              userName={user.name}
              userGroup={user.group}
              onLogout={handleLogout}
              scheduleData={scheduleData}
              isLoading={scheduleLoading}
            />
          )}
        </>
      )}

      <Toaster position="top-right" richColors />
    </>
  );
}
