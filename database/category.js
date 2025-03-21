const express = require("express");
const router = express.Router();
const db = require("./db");

// POST para crear una nueva categoría
router.post("/", (req, res) => {
    const { name, description } = req.body;
  
    if (!name || !description) {
      return res.status(400).send("Por favor, completa todos los campos.");
    }
  
    const query = `INSERT INTO category (name, description) VALUES (?, ?)`;
  
    db.query(query, [name, description], (err, result) => {
      if (err) {
        return res.status(500).send("Error al crear categoría");
      }
  
      res.status(201).send("Categoría creada con éxito");
    });
  });
  


  // GET para obtener todas las categorías
router.get("/", (req, res) => {
    const query = `SELECT * FROM category`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener categorías:", err);
        return res.status(500).send("Error al obtener categorías");
      }
  
      res.status(200).json(results);
    });
  });
  
  
module.exports = router;