const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
    const query = `SELECT * FROM position`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener posiciones:", err);
        return res.status(500).send("Error al obtener posiciones");
      }
  
      res.json(results);
    });
});

  
router.post("/", (req, res) => {
    const { description, status } = req.body;
  
    const query = `INSERT INTO \`position\` (description, status) VALUES (?, ?)`;
  
    db.query(query, [description, status], (err, result) => {
      if (err) {
        console.error("Error al insertar posición:", err);
        return res.status(500).send("Error al crear posición");
      }
  
      res.status(201).send("Posición creada con éxito");
    });
});





router.delete("/", (req, res) => {
    const { employeeId, positionId } = req.body;
  
    const query = `DELETE FROM employee_position WHERE Employee_id = ? AND Position_id = ?`;
  
    db.query(query, [employeeId, positionId], (err, result) => {
      if (err) {
        console.error("Error al eliminar employee_position:", err);
        return res.status(500).send("Error al eliminar la asignación de posición");
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send("No se encontró la asignación especificada");
      }
  
      res.status(200).send("Asignación eliminada con éxito");
    });
});
  
  

  
module.exports = router;