const express = require("express");
const router = express.Router();
const db = require("./db");


// GET para obtener todos los lotes de producción con sus productos asociados y detalles del producto
router.get("/", (req, res) => {
    const query = `
      SELECT 
        pb.idProductionBatch, pb.startDate, pb.endDate, pb.status, pb.lastUpdate, pb.resgisterDate,
        pp.idProductProduction, pp.partNumber, pp.enterDate, pp.quantity, pp.price, pp.expirationDate, pp.status AS productionStatus,
        p.idProduct, p.name AS productName, p.code AS productCode, p.quantity AS productStock, p.unitOfMeasurement AS productUnit
      FROM productionBatch pb
      LEFT JOIN productProduction pp ON pb.idProductionBatch = pp.productionBatch_idProductionBatch
      LEFT JOIN product p ON pp.product_idProduct = p.idProduct
   
    `;

     //   WHERE pb.status = 1
  
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error al obtener los lotes de producción.");
      }
  
      // Agrupar los resultados por batch
      const batches = results.reduce((acc, row) => {
        let batch = acc.find(b => b.idProductionBatch === row.idProductionBatch);
  
        if (!batch) {
          batch = {
            idProductionBatch: row.idProductionBatch,
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            lastUpdate: row.lastUpdate,
            resgisterDate: row.resgisterDate,
            productions: []
          };
          acc.push(batch);
        }
  
        if (row.idProductProduction) {
          batch.productions.push({
            idProductProduction: row.idProductProduction,
            partNumber: row.partNumber,
            enterDate: row.enterDate,
            quantity: row.quantity,
            price: row.price,
            expirationDate: row.expirationDate,
            status: row.productionStatus,
            product: {
              idProduct: row.idProduct,
              name: row.productName,
              code: row.productCode,
              stock: row.productStock,
              unitOfMeasurement: row.productUnit
            }
          });
        }
  
        return acc;
      }, []);
  
      res.status(200).json(batches);
    });
  });





//Actualizar productBach
router.put("/", (req, res) => {
    //const { id } = req.params; // ID del lote de producción
    const { idBatch,  status } = req.body; // Nuevo estado a actualizar

    if (status === undefined) {
        return res.status(400).send("El campo 'status' es obligatorio.");
    }

    const queryUpdateBatch = `
        UPDATE productionBatch
        SET status = ?, lastUpdate = NOW()
        WHERE idProductionBatch = ?
    `;

    const queryUpdateProductProduction = `
        UPDATE productProduction
        SET status = ?, lastUpdate = NOW()
        WHERE productionBatch_idProductionBatch = ?
    `;

    db.beginTransaction(err => {
        if (err) {
            return res.status(500).send("Error al iniciar la transacción.");
        }

        // Actualizar productionBatch
        db.query(queryUpdateBatch, [status, idBatch], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(500).send("Error al actualizar el estado del lote de producción o lote no encontrado.");
                });
            }

            // Actualizar productProduction relacionado
            db.query(queryUpdateProductProduction, [status, idBatch], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).send("Error al actualizar el estado de los productos relacionados.");
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send("Error al confirmar la transacción.");
                        });
                    }
                    res.status(200).send("Estado actualizado correctamente en ambas tablas.");
                });
            });
        });
    });
});


  
  module.exports = router;