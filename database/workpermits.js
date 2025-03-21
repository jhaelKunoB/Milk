const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
    const query = `SELECT * FROM workpermit`;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener permisos de trabajo:", err);
        return res.status(500).send("Error al obtener permisos de trabajo");
      }
      
      res.json(results);
    });
});


router.post("/", (req, res) => {
    const { description, idEmployee, status } = req.body;
    
    const query = `INSERT INTO workpermit (description, employee_Person_id, status) VALUES (?, ?, ?)`;
    
    db.query(query, [description, idEmployee, status], (err, result) => {
      if (err) {
        console.error("Error al insertar permiso de trabajo:", err);
        return res.status(500).send("Error al crear permiso de trabajo");
      }
      
      res.status(201).send("Permiso de trabajo creado con éxito");
    });
});



router.put("/", (req, res) => {
    const { idWorkPermit, idEmployee, status } = req.body;
    const now = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  
    const query = `UPDATE workpermit
                   SET status = ?, lastUpdate = ?
                   WHERE idWorkPermit = ? AND employee_Person_id = ?`;
  
    db.query(query, [status, now, idWorkPermit, idEmployee], (err, result) => {
      if (err) {
        console.error("Error al actualizar el permiso de trabajo:", err);
        return res.status(500).send("Error al actualizar el permiso de trabajo");
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send("Permiso de trabajo no encontrado");
      }
  
      res.status(200).send("Permiso actualizado con éxito");
    });
});
  
  

module.exports = router;

  
