# Подключение к реальной БД (через backend API)

Фронтенд теперь берёт расписание из backend API, а не из моков.

## 1) Переменная окружения
Создайте `.env` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Где `VITE_API_BASE_URL` — адрес вашего backend, который работает с реальной БД.

## 2) Контракт API
Фронтенд ожидает такие эндпоинты:

- `GET /lessons` → `ScheduleItem[]`
- `POST /lessons` → созданный `ScheduleItem`
- `PUT /lessons/:id` → обновлённый `ScheduleItem`
- `DELETE /lessons/:id` → `204 No Content`

## 3) Формат `ScheduleItem`

```ts
{
  id: string;
  day: string; // monday..saturday
  subject: string;
  time: string;
  room: string;
  teacher: string;
  group: string;
  type: 'lecture' | 'practice' | 'lab';
}
```

## 4) Пример SQL-таблицы (PostgreSQL)

```sql
create table lessons (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  subject text not null,
  time text not null,
  room text not null,
  teacher text not null,
  "group" text not null,
  type text not null check (type in ('lecture', 'practice', 'lab'))
);
```

> Важно: поле `group` в SQL лучше экранировать как `"group"`, т.к. это служебное слово.
