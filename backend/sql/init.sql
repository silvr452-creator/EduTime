CREATE TYPE lesson_day AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday');
CREATE TYPE lesson_type AS ENUM ('lecture','practice','lab');

CREATE TABLE role (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE app_user (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id INT NOT NULL REFERENCES role(id),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE teacher (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES app_user(id),
  full_name VARCHAR(255) NOT NULL
);

CREATE TABLE student (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL REFERENCES groups(id),
  user_id INT NOT NULL UNIQUE REFERENCES app_user(id),
  full_name VARCHAR(255) NOT NULL
);

CREATE TABLE subject (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE classroom (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE lesson (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES subject(id),
  teacher_id INT NOT NULL REFERENCES teacher(id),
  group_id INT NOT NULL REFERENCES groups(id),
  classroom_id INT NOT NULL REFERENCES classroom(id),
  day lesson_day NOT NULL,
  lesson_type lesson_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT chk_lesson_time CHECK (start_time < end_time)
);
