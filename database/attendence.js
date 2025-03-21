const express = require("express");
const router = express.Router();
const db = require("./db");


router.get("/", (req, res) => {
    const query = `SELECT * FROM attendence`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener asistencias:", err);
        return res.status(500).send("Error al obtener asistencias");
      }
  
      res.json(results);
    });
});


router.post("/", (req, res) => {
    const { description, idEmployee } = req.body;
  
    const query = `INSERT INTO attendence (description, time, employee_Person_id) VALUES (?, CURRENT_TIMESTAMP, ?)`;
  
    db.query(query, [description, idEmployee], (err, result) => {
      if (err) {
        console.error("Error al insertar asistencia:", err);
        return res.status(500).send("Error al crear asistencia");
      }
  
      res.status(201).send("Asistencia creada con éxito");
    });
});
  
  

  
module.exports = router;