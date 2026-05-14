# Гид по кодовой базе для новичка

## 1) Что это за проект
Это SPA на **React + TypeScript + Vite** для работы с расписанием колледжа с тремя ролями: студент, преподаватель, администратор.

- Точка входа: `src/main.tsx`
- Корневой компонент: `src/app/App.tsx`
- UI и стили: Tailwind + shadcn/Radix компоненты (`src/app/components/ui/*`)

## 2) Как устроено приложение

### Маршрутизация (state-based)
В проекте нет `react-router`: экран переключается вручную через `currentScreen` в `App.tsx`.

- `login` → экран входа
- `register` → экран регистрации
- `dashboard` → один из 3 дашбордов по роли

### Роли и экраны
- **Студент**: `DashboardScreen`
- **Преподаватель**: `TeacherDashboard`
- **Админ**: `AdminDashboard`

Роль авторизации пока моковая (по email), но данные расписания уже приходят из API.

## 3) Данные и состояние

### Единый источник данных
Расписание (`scheduleData`) и справочники (`referenceData`) загружаются в `App.tsx` из backend API и передаются во все экраны через props.

### API-слой
В `src/app/services/schedule-service.ts` сосредоточены:
- загрузка уроков `GET /schedule/lessons`
- загрузка справочников `GET /schedule/reference-data`
- CRUD уроков `POST/PUT/DELETE /schedule/lessons`

### Формат занятия
Единый тип `ScheduleItem` в `src/app/types/schedule.ts`.
Тип хранит как отображаемые поля (`subject`, `teacher`, `group`, `room`, `time`), так и FK-идентификаторы (`subjectId`, `teacherId`, `groupId`, `classroomId`) для работы с PostgreSQL-схемой.

## 4) Ключевые папки

```text
src/
  app/
    App.tsx                    # экранная логика + загрузка API данных
    services/
      schedule-service.ts      # HTTP-клиент расписания и справочников
    types/
      schedule.ts              # типы расписания и payload
    lib/
      schedule-utils.ts        # преобразование массива уроков в map по дням
    components/
      auth/                    # login/register
      dashboard/               # студент
      teacher/                 # преподаватель
      admin/                   # админ + CRUD
      ui/                      # переиспользуемые UI-компоненты
```

## 5) Что важно знать перед изменениями

1. Админская форма создания/редактирования использует **справочники БД** (предметы, группы, преподаватели, аудитории).
2. В запросы `POST/PUT` отправляются FK id, а в UI отображаются человекочитаемые имена из JOIN-ответов.
3. Для корректной работы нужен `VITE_API_BASE_URL`.
4. Контракт API и PostgreSQL DDL описаны в `docs/DB_SETUP.md`.

## 6) С чего изучать дальше (порядок)

1. `src/app/App.tsx` — загрузка данных и распределение по экранам.
2. `src/app/services/schedule-service.ts` — контракт API и маппинг DTO.
3. `src/app/components/admin/*` — CRUD и интеграция справочников.
4. `src/app/components/dashboard/*` и `teacher/*` — фильтрация и отображение.
5. `docs/DB_SETUP.md` — привязка к PostgreSQL по ER-модели.
