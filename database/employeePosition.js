const express = require("express");
const router = express.Router();
const db = require("./db");



router.post("/", (req, res) => {
    const { employeeId, positionId } = req.body;
  
    const query = `INSERT INTO employee_position (Employee_id, Position_id) VALUES (?, ?)`;
  
    db.query(query, [employeeId, positionId], (err, result) => {
      if (err) {
        console.error("Error al insertar employee_position:", err);
        return res.status(500).send("Error al asignar posición al empleado");
      }
  
      res.status(201).send("Posición asignada al empleado con éxito");
    });
});


module.exports = router;