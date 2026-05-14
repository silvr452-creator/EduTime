# Подключение к PostgreSQL (по вашей ER-диаграмме)

Ниже контракт, к которому уже подготовлен фронтенд.

## 1) Переменная окружения фронтенда
Создайте `.env` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

`VITE_API_BASE_URL` — адрес backend API, который работает с PostgreSQL.

## 2) Что фронтенд ожидает от API

### 2.1 Справочники (из таблиц ER)
`GET /schedule/reference-data`

```json
{
  "subjects": [{ "id": 1, "subjectName": "Математика" }],
  "teachers": [{ "id": 1, "fullName": "Иванов И.И." }],
  "groups": [{ "id": 1, "groupName": "ИС-21" }],
  "classrooms": [{ "id": 1, "roomNumber": "301" }]
}
```

### 2.2 Расписание (Lesson + JOIN)
`GET /schedule/lessons`

```json
[
  {
    "id": 10,
    "day": "monday",
    "lessonType": "lecture",
    "startTime": "08:30",
    "endTime": "10:00",
    "subjectId": 1,
    "subjectName": "Математика",
    "teacherId": 2,
    "teacherFullName": "Петров В.С.",
    "groupId": 3,
    "groupName": "ИС-21",
    "classroomId": 4,
    "roomNumber": "301"
  }
]
```

### 2.3 CRUD занятий
- `POST /schedule/lessons`
- `PUT /schedule/lessons/:id`
- `DELETE /schedule/lessons/:id`

Тело для `POST/PUT`:

```json
{
  "day": "monday",
  "lessonType": "lecture",
  "startTime": "08:30",
  "endTime": "10:00",
  "subjectId": 1,
  "teacherId": 2,
  "groupId": 3,
  "classroomId": 4
}
```

## 3) PostgreSQL DDL по ER-диаграмме

```sql
CREATE TYPE lesson_day AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday');
CREATE TYPE lesson_type AS ENUM ('lecture','practice','lab');

CREATE TABLE role (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleName VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE app_user (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleId INT NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_user_role FOREIGN KEY (roleId) REFERENCES role(id)
);

CREATE TABLE groups (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  groupName VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE teacher (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  fullName VARCHAR(255) NOT NULL,
  CONSTRAINT fk_teacher_user FOREIGN KEY (userId) REFERENCES app_user(id)
);

CREATE TABLE student (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  groupId INT NOT NULL,
  userId INT NOT NULL UNIQUE,
  fullName VARCHAR(255) NOT NULL,
  CONSTRAINT fk_student_group FOREIGN KEY (groupId) REFERENCES groups(id),
  CONSTRAINT fk_student_user FOREIGN KEY (userId) REFERENCES app_user(id)
);

CREATE TABLE subject (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subjectName VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE classroom (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roomNumber VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE lesson (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subjectId INT NOT NULL,
  teacherId INT NOT NULL,
  groupId INT NOT NULL,
  classroomId INT NOT NULL,
  day lesson_day NOT NULL,
  lessonType lesson_type NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  CONSTRAINT fk_lesson_subject FOREIGN KEY (subjectId) REFERENCES subject(id),
  CONSTRAINT fk_lesson_teacher FOREIGN KEY (teacherId) REFERENCES teacher(id),
  CONSTRAINT fk_lesson_group FOREIGN KEY (groupId) REFERENCES groups(id),
  CONSTRAINT fk_lesson_classroom FOREIGN KEY (classroomId) REFERENCES classroom(id),
  CONSTRAINT chk_lesson_time CHECK (startTime < endTime)
);
```

## 4) Почему добавлен `day`
На UI расписание показывается по дням недели. Поэтому в таблицу `lesson` добавлено поле `day` (weekday).
Если хотите хранить расписание по датам, можно добавить `lessonDate DATE` и маппить в weekday на backend.
