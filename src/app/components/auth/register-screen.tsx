import { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Lock, User, Users, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';

export type UserRole = 'student' | 'teacher' | 'admin';

interface RegisterScreenProps {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    group?: string;
    role: UserRole;
  }) => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({
  onRegister,
  onNavigateToLogin,
}: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    group: '',
    role: 'student' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const groups = ['ИС-21', 'ИС-22', 'ПИ-21', 'ПИ-22', 'КС-21', 'КС-22'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите ФИО';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'ФИО должно содержать минимум 3 символа';
    }

    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.role === 'student' && !formData.group) {
      newErrors.group = 'Выберите группу';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        group: formData.role === 'student' ? formData.group : undefined,
        role: formData.role,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Регистрация
          </h1>
          <p className="text-gray-600">
            Создайте аккаунт для доступа к расписанию
          </p>
        </div>

        {/* Форма регистрации */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Роль пользователя */}
            <div className="space-y-3">
              <Label>Роль</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value as UserRole)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="student"
                    id="student"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Студент</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="teacher"
                    id="teacher"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="teacher"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Препод.</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="admin"
                    id="admin"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="admin"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Админ</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* ФИО */}
            <div className="space-y-2">
              <Label htmlFor="name">ФИО</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Иванов Иван Иванович"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Группа (только для студентов) */}
            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="group">Группа</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.group}
                    onValueChange={(value) => handleInputChange('group', value)}
                  >
                    <SelectTrigger className={`pl-10 ${errors.group ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Выберите группу" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.group && (
                  <p className="text-sm text-red-600">{errors.group}</p>
                )}
              </div>
            )}

            {/* Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Кнопка регистрации */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Создать аккаунт
            </Button>
          </form>

          {/* Разделитель */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">или</span>
            </div>
          </div>

          {/* Ссылка на вход */}
          <div className="text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Войти
              </button>
            </p>
          </div>
        </div>

        {/* Футер */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Колледж Информационных Систем
        </p>
      </div>
    </div>
  );
}