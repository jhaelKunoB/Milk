const express = require("express");
const router = express.Router();
const db = require("./db");


router.post("/", (req, res) => {
    const { ammount, disccount, bonus, date, status, idPerson } = req.body;
    const query = `INSERT INTO payment (ammount, disccount, bonus, date, status, employee_Person_id) VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(query, [ammount, disccount, bonus, date, status, idPerson], (err, result) => {
      if (err) {
        console.error("Error al insertar el pago:", err);
        return res.status(500).send("Error al registrar el pago");
      }
      res.status(201).send("Pago registrado con éxito");
    });

});

router.get("/", (req, res) => {
    const query = `SELECT * FROM payment`;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener pagos:", err);
        return res.status(500).send("Error al obtener pagos");
      }
      
      res.json(results);
    });
});
  
  
module.exports = router;