import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: 'backend/.env' });

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  await query('SELECT 1');
  res.json({ ok: true });
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
