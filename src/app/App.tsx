import { useState } from 'react';
import { LoginScreen } from '@/app/components/auth/login-screen';
import { RegisterScreen, UserRole } from '@/app/components/auth/register-screen';
import { DashboardScreen } from '@/app/components/dashboard/dashboard-screen';
import { AdminDashboard } from '@/app/components/admin/admin-dashboard';
import { TeacherDashboard } from '@/app/components/teacher/teacher-dashboard';
import { toast, Toaster } from 'sonner';
import { ScheduleItem } from '@/app/components/schedule-card';

type Screen = 'login' | 'register' | 'dashboard';

interface User {
  name: string;
  email: string;
  group?: string;
  role: UserRole;
}

// Mock данные для расписания
const initialSchedule: Record<string, ScheduleItem[]> = {
  monday: [
    {
      id: '1',
      subject: 'Математический анализ',
      time: '08:30 - 10:00',
      room: 'Ауд. 301',
      teacher: 'Иванова А.П.',
      group: 'ИС-21',
      type: 'lecture',
    },
    {
      id: '2',
      subject: 'Программирование',
      time: '10:15 - 11:45',
      room: 'Ауд. 205',
      teacher: 'Петров В.С.',
      group: 'ИС-21',
      type: 'lab',
    },
    {
      id: '3',
      subject: 'Английский язык',
      time: '12:00 - 13:30',
      room: 'Ауд. 412',
      teacher: 'Смирнова О.Л.',
      group: 'ИС-21',
      type: 'practice',
    },
    {
      id: '4',
      subject: 'Физическая культура',
      time: '13:45 - 15:15',
      room: 'Спортзал',
      teacher: 'Козлов Д.И.',
      group: 'ИС-21',
      type: 'practice',
    },
  ],
  tuesday: [
    {
      id: '5',
      subject: 'Базы данных',
      time: '08:30 - 10:00',
      room: 'Ауд. 308',
      teacher: 'Сидоров М.Н.',
      group: 'ИС-21',
      type: 'lecture',
    },
    {
      id: '6',
      subject: 'Базы данных',
      time: '10:15 - 11:45',
      room: 'Ауд. 210',
      teacher: 'Сидоров М.Н.',
      group: 'ИС-21',
      type: 'lab',
    },
    {
      id: '7',
      subject: 'Веб-технологии',
      time: '12:00 - 13:30',
      room: 'Ауд. 205',
      teacher: 'Петров В.С.',
      group: 'ИС-21',
      type: 'practice',
    },
  ],
  wednesday: [
    {
      id: '8',
      subject: 'Операционные системы',
      time: '08:30 - 10:00',
      room: 'Ауд. 315',
      teacher: 'Волкова Е.А.',
      group: 'ИС-21',
      type: 'lecture',
    },
    {
      id: '9',
      subject: 'Математический анализ',
      time: '10:15 - 11:45',
      room: '��уд. 301',
      teacher: 'Иванова А.П.',
      group: 'ИС-21',
      type: 'practice',
    },
    {
      id: '10',
      subject: 'Программирование',
      time: '12:00 - 13:30',
      room: 'Ауд. 205',
      teacher: 'Петров В.С.',
      group: 'ИС-21',
      type: 'lecture',
    },
  ],
  thursday: [
    {
      id: '11',
      subject: 'Компьютерные сети',
      time: '08:30 - 10:00',
      room: 'Ауд. 320',
      teacher: 'Морозов И.К.',
      group: 'ИС-21',
      type: 'lecture',
    },
    {
      id: '12',
      subject: 'Компьютерные сети',
      time: '10:15 - 11:45',
      room: 'Ауд. 215',
      teacher: 'Морозов И.К.',
      group: 'ИС-21',
      type: 'lab',
    },
    {
      id: '13',
      subject: 'Английский язык',
      time: '12:00 - 13:30',
      room: 'Ауд. 412',
      teacher: 'Смирнова О.Л.',
      group: 'ИС-21',
      type: 'practice',
    },
  ],
  friday: [
    {
      id: '14',
      subject: 'Алгоритмы и структуры данных',
      time: '08:30 - 10:00',
      room: 'Ауд. 305',
      teacher: 'Новиков П.Р.',
      group: 'ИС-21',
      type: 'lecture',
    },
    {
      id: '15',
      subject: 'Алгоритмы и структуры данных',
      time: '10:15 - 11:45',
      room: 'Ауд. 210',
      teacher: 'Новиков П.Р.',
      group: 'ИС-21',
      type: 'lab',
    },
    {
      id: '16',
      subject: 'Операционные системы',
      time: '12:00 - 13:30',
      room: 'Ауд. 215',
      teacher: 'Волкова Е.А.',
      group: 'ИС-21',
      type: 'lab',
    },
  ],
  saturday: [
    {
      id: '17',
      subject: 'Проектная деятельность',
      time: '08:30 - 10:00',
      room: 'Ауд. 405',
      teacher: 'Петров В.С.',
      group: 'ИС-21',
      type: 'practice',
    },
    {
      id: '18',
      subject: 'Физическая культура',
      time: '10:15 - 11:45',
      room: 'Спортзал',
      teacher: 'Козлов Д.И.',
      group: 'ИС-21',
      type: 'practice',
    },
  ],
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [scheduleData, setScheduleData] = useState(initialSchedule);

  const handleLogin = (email: string, password: string) => {
    // Симуляция входа - определяем роль по email
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

  const navigateToRegister = () => {
    setCurrentScreen('register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleUpdateSchedule = (newSchedule: Record<string, ScheduleItem[]>) => {
    setScheduleData(newSchedule);
    toast.success('Расписание успешно обновлено!');
  };

  return (
    <>
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={navigateToRegister}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onNavigateToLogin={navigateToLogin}
        />
      )}

      {currentScreen === 'dashboard' && user && (
        <>
          {user.role === 'admin' && (
            <AdminDashboard
              userName={user.name}
              onLogout={handleLogout}
              scheduleData={scheduleData}
              onUpdateSchedule={handleUpdateSchedule}
            />
          )}

          {user.role === 'teacher' && (
            <TeacherDashboard
              userName={user.name}
              onLogout={handleLogout}
              scheduleData={scheduleData}
            />
          )}

          {user.role === 'student' && user.group && (
            <DashboardScreen
              userName={user.name}
              userGroup={user.group}
              onLogout={handleLogout}
            />
          )}
        </>
      )}

      <Toaster position="top-right" richColors />
    </>
  );
}