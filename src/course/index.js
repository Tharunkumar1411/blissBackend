const client = require('./../middleware/conection');


exports.getCourseDetails = async(req, res) => {
    try {
      client.query('SELECT * FROM courses', (err, result) => {
        if (err) {
          console.error('Error executing query', err.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log('Query result:', result.rows);
        return res.status(200).json(result.rows);
      });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}