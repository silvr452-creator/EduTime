# Гид по кодовой базе для новичка

## 1) Что это за проект
Это SPA на **React + TypeScript + Vite** для работы с расписанием колледжа с тремя ролями: студент, преподаватель, администратор.

- Точка входа: `src/main.tsx`
- Корневой компонент: `src/app/App.tsx`
- UI и стили: Tailwind + shadcn/Radix компоненты (`src/app/components/ui/*`)

## 2) Как устроено приложение

### Маршрутизация (по сути state-based)
В проекте нет `react-router`: экран переключается вручную через `currentScreen` в `App.tsx`.

- `login` → экран входа
- `register` → экран регистрации
- `dashboard` → один из 3 дашбордов по роли

### Роли и экраны
- **Студент**: `DashboardScreen`
- **Преподаватель**: `TeacherDashboard`
- **Админ**: `AdminDashboard`

Роль пока вычисляется мок-логикой (по email) в `handleLogin`.

## 3) Данные и состояние

### Текущее состояние
Главные данные расписания живут в состоянии `scheduleData` в `App.tsx`.

Важно: в студентском экране (`DashboardScreen`) используется локальный `mockSchedule`, а не `scheduleData` из `App.tsx`. То есть изменения админа не попадут в студентский дашборд автоматически.

### Формат занятия
Единый тип `ScheduleItem` определён в `src/app/components/schedule-card.tsx`:
- `id`, `subject`, `time`, `room`, `teacher`, `group`, `type`

## 4) Ключевые папки

```text
src/
  app/
    App.tsx                    # экранная «роутинг»-логика и общий state
    components/
      auth/                    # login/register
      dashboard/               # студент
      teacher/                 # преподаватель
      admin/                   # админ
      ui/                      # переиспользуемые UI-компоненты
      schedule-card.tsx        # карточка и тип ScheduleItem
      schedule-filters.tsx     # фильтры
      week-navigation.tsx      # выбор дня недели
  styles/
    index.css                  # подключение общих стилей
    theme.css                  # css-переменные и базовые токены темы
```

## 5) Что важно знать перед изменениями

1. **Есть дублирование мок-данных** между `App.tsx` и `DashboardScreen`.
2. **День занятия в админ-форме пока не используется полноценно**: поле `day` есть, но при сохранении в `ScheduleItem` не попадает.
3. **Нет API-слоя**: всё на клиентском состоянии.
4. **Нет глобального router/state manager**: навигация и состояние локальные.

## 6) С чего изучать дальше (порядок)

1. `src/app/App.tsx` — понять поток экранов и ролей.
2. `src/app/components/auth/*` — как устроены формы и валидация.
3. `src/app/components/dashboard/*`, `teacher/*`, `admin/*` — поведение по ролям.
4. `src/app/components/admin/schedule-table.tsx` и `add-edit-lesson-dialog.tsx` — CRUD-операции расписания.
5. `src/app/components/ui/*` — библиотека компонентов.
6. `vite.config.ts` и `src/styles/theme.css` — alias, тема, базовые стили.

## 7) Практичный next step (для развития проекта)

- Вынести расписание в единый источник (например, контекст или store), чтобы все роли видели одинаковые данные.
- Добавить нормальный `day` в модель записи и учитывать его при создании/редактировании.
- После этого подключить backend API и заменить мок-логику входа/данных.
