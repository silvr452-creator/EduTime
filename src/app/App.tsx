import { useEffect, useState } from 'react';
import { LoginScreen } from '@/app/components/auth/login-screen';
import { RegisterScreen, UserRole } from '@/app/components/auth/register-screen';
import { DashboardScreen } from '@/app/components/dashboard/dashboard-screen';
import { AdminDashboard } from '@/app/components/admin/admin-dashboard';
import { TeacherDashboard } from '@/app/components/teacher/teacher-dashboard';
import { toast, Toaster } from 'sonner';
import {
  LessonUpsertPayload,
  ScheduleItem,
  ScheduleReferenceData,
} from '@/app/types/schedule';
import { createEmptySchedule, toScheduleMap } from '@/app/lib/schedule-utils';
import {
  createLesson,
  fetchLessons,
  fetchReferenceData,
  removeLesson,
  updateLesson,
} from '@/app/services/schedule-service';
import { loginUser, registerUser } from '@/app/services/auth-service';

type Screen = 'login' | 'register' | 'dashboard';

interface User {
  name: string;
  email: string;
  group?: string;
  role: UserRole;
}

const emptyReferenceData: ScheduleReferenceData = {
  subjects: [],
  teachers: [],
  groups: [],
  classrooms: [],
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem[]>>(
    createEmptySchedule()
  );
  const [referenceData, setReferenceData] = useState<ScheduleReferenceData>(
    emptyReferenceData
  );
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lessons, refs] = await Promise.all([
          fetchLessons(),
          fetchReferenceData(),
        ]);

        setScheduleData(toScheduleMap(lessons));
        setReferenceData(refs);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Не удалось загрузить данные';
        toast.error(`Ошибка загрузки: ${message}`);
      } finally {
        setScheduleLoading(false);
      }
    };

    load();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      setCurrentScreen('dashboard');
      toast.success(`Добро пожаловать, ${loggedInUser.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка авторизации';
      toast.error(message);
    }
  };

  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
    group?: string;
    role: UserRole;
  }) => {
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      setCurrentScreen('dashboard');
      toast.success(`Аккаунт успешно создан! Добро пожаловать, ${newUser.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка регистрации';
      toast.error(message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    toast.success('Вы успешно вышли из системы');
  };

  const handleAddLesson = async (lesson: LessonUpsertPayload) => {
    const created = await createLesson(lesson);
    setScheduleData((prev) => ({
      ...prev,
      [created.day]: [...(prev[created.day] ?? []), created],
    }));
    toast.success('Занятие добавлено');
  };

  const handleEditLesson = async (
    lessonId: string,
    lesson: LessonUpsertPayload
  ) => {
    const updated = await updateLesson(lessonId, lesson);
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
              referenceData={referenceData}
              isLoading={scheduleLoading}
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
