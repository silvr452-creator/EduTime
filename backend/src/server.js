import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHash, randomBytes } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { pool, query } from './db.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: 'backend/.env' });

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, savedHash) {
  const [salt] = savedHash.split(':');
  if (!salt) return false;
  return hashPassword(password, salt) === savedHash;
}

async function hasMxRecord(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;

  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

app.get('/api/health', async (_req, res) => {
  await query('SELECT 1');
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, group } = req.body;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ message: 'ФИО должно содержать минимум 3 символа' });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Некорректный формат email' });
  }

  if (!(await hasMxRecord(email))) {
    return res.status(400).json({ message: 'У email домена отсутствует почтовый сервер (MX)' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Некорректная роль' });
  }

  if (role === 'student' && !group) {
    return res.status(400).json({ message: 'Для студента необходимо выбрать группу' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userExists = await client.query('SELECT id FROM app_user WHERE email = $1', [email.toLowerCase()]);
    if (userExists.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }

    const roleRow = await client.query('SELECT id FROM role WHERE role_name = $1', [role]);
    if (!roleRow.rowCount) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'Роль не найдена в БД' });
    }

    const username = email.toLowerCase();
    const passwordHash = hashPassword(password);
    const createdUser = await client.query(
      `INSERT INTO app_user (role_id, username, password_hash, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [roleRow.rows[0].id, username, passwordHash, email.toLowerCase()],
    );

    const userId = createdUser.rows[0].id;
    let userGroup = null;

    if (role === 'student') {
      const groupRow = await client.query(
        'INSERT INTO groups (group_name) VALUES ($1) ON CONFLICT (group_name) DO UPDATE SET group_name = EXCLUDED.group_name RETURNING id, group_name',
        [group],
      );

      userGroup = groupRow.rows[0].group_name;

      await client.query(
        'INSERT INTO student (group_id, user_id, full_name) VALUES ($1, $2, $3)',
        [groupRow.rows[0].id, userId, name.trim()],
      );
    }

    if (role === 'teacher') {
      await client.query(
        'INSERT INTO teacher (user_id, full_name) VALUES ($1, $2)',
        [userId, name.trim()],
      );
    }

    await client.query('COMMIT');

    console.log(`[Pseudo email] Отправлено письмо подтверждения на ${email.toLowerCase()}`);

    return res.status(201).json({
      message: 'Регистрация успешна. Письмо отправлено (псевдо).',
      user: {
        name: name.trim(),
        email: email.toLowerCase(),
        role,
        group: userGroup,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Некорректный email' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Некорректный пароль' });
  }

  const result = await query(
    `SELECT
      u.id,
      u.email,
      u.password_hash AS "passwordHash",
      r.role_name AS role,
      t.full_name AS "teacherName",
      s.full_name AS "studentName",
      g.group_name AS "groupName"
    FROM app_user u
    JOIN role r ON r.id = u.role_id
    LEFT JOIN teacher t ON t.user_id = u.id
    LEFT JOIN student s ON s.user_id = u.id
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE u.email = $1`,
    [email.toLowerCase()],
  );

  if (!result.rowCount) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const user = result.rows[0];

  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const displayName = user.teacherName ?? user.studentName ?? 'Администратор';

  res.json({
    user: {
      name: displayName,
      email: user.email,
      role: user.role,
      group: user.groupName,
    },
  });
});

app.get('/api/schedule/reference-data', async (_req, res) => {
  const [subjects, teachers, groups, classrooms] = await Promise.all([
    query('SELECT id, subject_name AS "subjectName" FROM subject ORDER BY subject_name'),
    query('SELECT id, full_name AS "fullName" FROM teacher ORDER BY full_name'),
    query('SELECT id, group_name AS "groupName" FROM groups ORDER BY group_name'),
    query('SELECT id, room_number AS "roomNumber" FROM classroom ORDER BY room_number'),
  ]);

  res.json({
    subjects: subjects.rows,
    teachers: teachers.rows,
    groups: groups.rows,
    classrooms: classrooms.rows,
  });
});

const lessonSelect = `
SELECT
  l.id,
  l.day,
  l.lesson_type AS "lessonType",
  to_char(l.start_time, 'HH24:MI') AS "startTime",
  to_char(l.end_time, 'HH24:MI') AS "endTime",
  l.subject_id AS "subjectId",
  s.subject_name AS "subjectName",
  l.teacher_id AS "teacherId",
  t.full_name AS "teacherFullName",
  l.group_id AS "groupId",
  g.group_name AS "groupName",
  l.classroom_id AS "classroomId",
  c.room_number AS "roomNumber"
FROM lesson l
JOIN subject s ON s.id = l.subject_id
JOIN teacher t ON t.id = l.teacher_id
JOIN groups g ON g.id = l.group_id
JOIN classroom c ON c.id = l.classroom_id
`;

app.get('/api/schedule/lessons', async (_req, res) => {
  const result = await query(`${lessonSelect} ORDER BY l.day, l.start_time`);
  res.json(result.rows);
});

app.post('/api/schedule/lessons', async (req, res) => {
  const { day, lessonType, startTime, endTime, subjectId, teacherId, groupId, classroomId } = req.body;
  const created = await query(
    `INSERT INTO lesson (day, lesson_type, start_time, end_time, subject_id, teacher_id, group_id, classroom_id)
     VALUES ($1, $2::lesson_type, $3::time, $4::time, $5, $6, $7, $8)
     RETURNING id`,
    [day, lessonType, startTime, endTime, subjectId, teacherId, groupId, classroomId],
  );

  const result = await query(`${lessonSelect} WHERE l.id = $1`, [created.rows[0].id]);
  res.status(201).json(result.rows[0]);
});

app.put('/api/schedule/lessons/:id', async (req, res) => {
  const { id } = req.params;
  const { day, lessonType, startTime, endTime, subjectId, teacherId, groupId, classroomId } = req.body;

  await query(
    `UPDATE lesson
     SET day = $1,
         lesson_type = $2::lesson_type,
         start_time = $3::time,
         end_time = $4::time,
         subject_id = $5,
         teacher_id = $6,
         group_id = $7,
         classroom_id = $8
     WHERE id = $9`,
    [day, lessonType, startTime, endTime, subjectId, teacherId, groupId, classroomId, id],
  );

  const result = await query(`${lessonSelect} WHERE l.id = $1`, [id]);
  res.json(result.rows[0]);
});

app.delete('/api/schedule/lessons/:id', async (req, res) => {
  await query('DELETE FROM lesson WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(port, () => {
  console.log(`EduTime backend API running on http://localhost:${port}/api`);
});
