const express = require("express");
const router = express.Router();
const db = require("./db");


// POST para crear una nueva producción con lote
router.post("/", (req, res) => {
  const { productsProductions, startDate, endDate } = req.body;

  if (!Array.isArray(productsProductions) || productsProductions.length === 0 || !startDate || !endDate) {
      return res.status(400).send("Por favor, completa todos los campos correctamente.");
  }

  const queryInsertBatch = `
    INSERT INTO productionBatch (startDate, endDate)
    VALUES (?, ?)
  `;

  db.beginTransaction(err => {
      if (err) {
          return res.status(500).send("Error al iniciar la transacción.");
      }

      // Insertar productionBatch primero
      db.query(queryInsertBatch, [startDate, endDate], (err, batchResult) => {
          if (err) {
              return db.rollback(() => {
                  res.status(500).send("Error al crear el lote de producción.");
              });
          }
          
          const productionBatchId = batchResult.insertId; // Obtener el ID generado
  
          const queryInsertProductProduction = `
            INSERT INTO productProduction (partNumber, enterDate, quantity, price, expirationDate, product_idProduct, productionBatch_idProductionBatch)
            VALUES (?, CURRENT_DATE, ?, ?, ?, ?, ?)
          `;

          const productInserts = productsProductions.map(({ partNumber, quantity, price, expirationDate, product_idProduct }) => {
              return new Promise((resolve, reject) => {
                  db.query(
                      queryInsertProductProduction,
                      [partNumber, quantity, price, expirationDate, product_idProduct, productionBatchId],
                      (err) => {
                          if (err) return reject(err);
                          resolve();
                      }
                  );
              });
          });

          Promise.all(productInserts)
              .then(() => {
                  db.commit(err => {
                      if (err) {
                          return db.rollback(() => {
                              res.status(500).send("Error al confirmar la transacción.");
                          });
                      }
                      res.status(201).send("Producción y lote creados con éxito.");
                  });
              })
              .catch(err => {
                  db.rollback(() => {
                      res.status(500).send("Error al registrar los productos en la producción.");
                  });
              });
      });
  });
});



// GET para obtener todas las producciones activas con materias primas como lista de objetos
router.get("/", (req, res) => {
    const query = `
      SELECT pp.idProductProduction, pp.partNumber, pp.enterDate, pp.quantity, pp.price, pp.expirationDate,
             pp.product_idProduct, pp.productionBatch_idProductionBatch, pb.startDate, pb.endDate,
             rm.idRawMaterial, rm.name AS rawMaterialName, rm.type AS rawMaterialType, rm.quantity AS rawMaterialQuantity, rm.unitOfMeasurement AS rawMaterialUnit
      FROM productProduction pp
      INNER JOIN productionBatch pb ON pp.productionBatch_idProductionBatch = pb.idProductionBatch
      LEFT JOIN productProductionRawMaterial pprm
        ON pp.idProductProduction = pprm.productProduction_idProductProduction
      LEFT JOIN rawMaterial rm
        ON pprm.rawMaterial_idRawMaterial = rm.idRawMaterial
      WHERE pp.status = 1
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error al obtener las producciones.");
      }
  
      // Agrupar resultados por producción
      const productions = results.reduce((acc, row) => {
        let production = acc.find(p => p.idProductProduction === row.idProductProduction);
  
        if (!production) {
          production = {
            idProductProduction: row.idProductProduction,
            partNumber: row.partNumber,
            enterDate: row.enterDate,
            quantity: row.quantity,
            price: row.price,
            expirationDate: row.expirationDate,
            product_idProduct: row.product_idProduct,
            productionBatch_idProductionBatch: row.productionBatch_idProductionBatch,
            startDate: row.startDate,
            endDate: row.endDate,
            rawMaterials: []
          };
          acc.push(production);
        }
  
        if (row.idRawMaterial) {
          production.rawMaterials.push({
            idRawMaterial: row.idRawMaterial,
            name: row.rawMaterialName,
            type: row.rawMaterialType,
            quantity: row.rawMaterialQuantity,
            unitOfMeasurement: row.rawMaterialUnit
          });
        }
  
        return acc;
      }, []);
  
      res.status(200).json(productions);
    });
  });
  

 
module.exports = router;