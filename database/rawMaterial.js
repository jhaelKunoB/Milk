const express = require("express");
const router = express.Router();
const db = require("./db");


// POST para crear un nuevo raw material
router.post("/", (req, res) => { 
    const { name, type, quantity, unitOfMeasurement, expirationDate } = req.body;
  
    if (!name || !type || !quantity || !unitOfMeasurement || !expirationDate) {
      return res.status(400).send("Por favor, completa todos los campos.");
    }
  
    const query = `
      INSERT INTO rawMaterial (name, type, quantity, unitOfMeasurement, enterDate, expirationDate)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `;
  
    db.beginTransaction(err => {
      if (err) {
        return res.status(500).send("Error al iniciar la transacción");
      }
  
      db.query(query, [name, type, quantity, unitOfMeasurement, expirationDate], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send("Error al crear raw material");
          });
        }
  
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("Error al confirmar la transacción");
            });
          }
  
          res.status(201).send("Raw material creado con éxito");
        });
      });
    });
  });




  // GET para obtener todos los raw materials activos (estado = 1)
router.get("/", (req, res) => {
    const query = `
      SELECT * FROM rawMaterial
      WHERE status = 1
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Error al obtener raw materials");
      }
  
      res.status(200).json(results);
    });
  });

  
  module.exports = router;