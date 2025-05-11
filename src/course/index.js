const client = require('./../middleware/conection');

exports.getCourseDetails = async(req, res) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.course_name,
                c.professor,
                TO_CHAR(c.start_date, 'YYYY-MM-DD') as start_date,
                TO_CHAR(c.end_date, 'YYYY-MM-DD') as end_date,
                c.total_assignments,
                COALESCE(json_agg(
                    json_build_object(
                        'id', a.id,
                        'title', a.title,
                        'due_date', TO_CHAR(a.due_date, 'YYYY-MM-DD'),
                        'status', a.status
                    )
                ) FILTER (WHERE a.id IS NOT NULL), '[]') as assignments
            FROM courses c
            LEFT JOIN assignments a ON c.id = a.course_id
            GROUP BY c.id
            ORDER BY c.id;
        `;

        client.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log('Query result:', result.rows);
            return res.status(200).json(result.rows);
        });
    } catch (error) {
        console.error("Error in getCourseDetails:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.addCourse = async(req, res) => {
    try {
        const { course_name, professor, start_date, end_date, total_assignments } = req.body;

        if (!course_name || !professor || !start_date || !end_date || !total_assignments) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['course_name', 'professor', 'start_date', 'end_date', 'total_assignments']
            });
        }

        // Convert dates to PostgreSQL format (YYYY-MM-DD)
        const formatDate = (dateStr) => {
            if (dateStr.includes('T')) {
                return dateStr.split('T')[0];
            }
            if (dateStr.includes('/')) {
                const [day, month, year] = dateStr.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return dateStr;
        };

        const formattedStartDate = formatDate(start_date);
        const formattedEndDate = formatDate(end_date);

        const getNextIdQuery = `
            SELECT COALESCE(MAX(id), 0) + 1 as next_id
            FROM courses;
        `;

        client.query(getNextIdQuery, (err, idResult) => {
            if (err) {
                console.error('Error getting next ID:', err.stack);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const nextId = idResult.rows[0].next_id;

            const insertQuery = `
                INSERT INTO courses (id, course_name, professor, start_date, end_date, total_assignments)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const values = [nextId, course_name, professor, formattedStartDate, formattedEndDate, total_assignments];

            client.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error inserting course:', err.stack);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                
                console.log('New course added:', result.rows[0]);
                return res.status(201).json({
                    message: 'Course added successfully',
                    course: result.rows[0]
                });
            });
        });
    } catch (error) {
        console.error("Error in addCourse:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Add new assignment
// Add assignment to a course
exports.addAssignment = async(req, res) => {
  try {
      const { course_id, title, due_date, status = 'pending' } = req.body;

      if (!course_id || !title || !due_date) {
          return res.status(400).json({
              error: 'Missing required fields',
              required: ['course_id', 'title', 'due_date']
          });
      }

      // Verify course exists
      const checkCourseQuery = 'SELECT id FROM courses WHERE id = $1';
      
      try {
          const courseResult = await client.query(checkCourseQuery, [course_id]);
          
          if (courseResult.rows.length === 0) {
              return res.status(404).json({ error: 'Course not found' });
          }
          
          // Format date
          const formatDate = (dateStr) => {
              if (!dateStr) return null;
              
              if (dateStr.includes('T')) {
                  return dateStr.split('T')[0];
              }
              if (dateStr.includes('/')) {
                  const [day, month, year] = dateStr.split('/');
                  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
              return dateStr;
          };

          const formattedDueDate = formatDate(due_date);

          // Insert assignment
          const insertQuery = `
              INSERT INTO assignments (course_id, title, due_date, status)
              VALUES ($1, $2, $3, $4)
              RETURNING *
          `;

          const values = [course_id, title, formattedDueDate, status];
          
          const result = await client.query(insertQuery, values);
          
          // Get the updated count of assignments for this course
          const countQuery = 'SELECT COUNT(*) FROM assignments WHERE course_id = $1';
          const countResult = await client.query(countQuery, [course_id]);
          
          // Update the total assignments count in the courses table if you're tracking it there
          // This assumes you have a totalAssignments column in your courses table
          // If not, you can just skip this part
          const updateCourseQuery = `
              UPDATE courses 
              SET total_assignments = $1
              WHERE id = $2
          `;
          
          await client.query(updateCourseQuery, [parseInt(countResult.rows[0].count), course_id]);
          
          console.log('New assignment added:', result.rows[0]);
          return res.status(201).json({
              message: 'Assignment added successfully',
              assignment: result.rows[0]
          });
          
      } catch (dbError) {
          console.error('Database error:', dbError.stack);
          return res.status(500).json({ error: 'Database Error', details: dbError.message });
      }
  } catch (error) {
      console.error("Error in addAssignment:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get assignments for a specific course
exports.getCourseAssignments = async(req, res) => {
  try {
      const { courseId } = req.query; // Check both params and query

      if (!courseId) {
          return res.status(400).json({ error: 'Course ID is required' });
      }

      console.log("Fetching assignments for course:", courseId);
      
      // First check if the course exists
      const courseCheckQuery = 'SELECT id, course_name FROM courses WHERE id = $1';
      
      try {
          const courseResult = await client.query(courseCheckQuery, [courseId]);
          
          if (courseResult.rows.length === 0) {
              return res.status(404).json({ error: 'Course not found' });
          }
          
          const query = `
              SELECT 
                  id,
                  course_id,
                  title,
                  TO_CHAR(due_date, 'YYYY-MM-DD') as due_date,
                  status
              FROM assignments
              WHERE course_id = $1
              ORDER BY due_date ASC, id ASC;
          `;

          const result = await client.query(query, [courseId]);
          
          return res.status(200).json({
              course: {
                  id: courseResult.rows[0].id,
                  course_name: courseResult.rows[0].course_name
              },
              assignments: result.rows,
              total: result.rows.length
          });
          
      } catch (dbError) {
          console.error('Database error:', dbError.stack);
          return res.status(500).json({ error: 'Database Error', details: dbError.message });
      }
  } catch (error) {
      console.error("Error in getCourseAssignments:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};