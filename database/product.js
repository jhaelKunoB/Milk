const express = require("express");
const router = express.Router();
const db = require("./db");


// POST para crear un nuevo producto
router.post("/", (req, res) => { 
    const { name, code, quantity, unitOfMeasurement, category_idCategory } = req.body;
  
    const query1 = `
      INSERT INTO product (name, code, quantity, enterDate, unitOfMeasurement, category_idCategory)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
    `;
  
    db.beginTransaction(err => {
      if (err) {
        return res.status(500).send("Error al iniciar la transacción");
      }
  
      db.query(query1, [name, code, quantity, unitOfMeasurement, category_idCategory], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send("Error al crear producto");
          });
        }
  
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("Error al confirmar la transacción");
            });
          }
  
          res.status(201).send("Producto creado con éxito");
        });
      });
    });
});



// GET para obtener productos con estado 1
router.get("/", (req, res) => {
    const query = `
      SELECT * FROM product
      WHERE status = 1
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send("Error al obtener productos");
        }
        
        res.status(200).json(results);
    });
});



module.exports = router;