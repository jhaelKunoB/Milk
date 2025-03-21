const express = require("express");
const router = express.Router();
const db = require("./db");

// Crear empleado
router.post("/", (req, res) => { // Cambiar "/employees" por "/"
  const { name, lastName, ci, phone, email, birthDate, currentSalary } = req.body;
  const query1 = `INSERT INTO person(name, lastName, ci, phone, email, birthDate) VALUES (?, ?, ?, ?, ?, ?)`;
  const query2 = `INSERT INTO employee (Person_id, currentSalary) VALUES (?, ?)`;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send("Error al iniciar la transacción");
    }

    db.query(query1, [name, lastName, ci, phone, email, birthDate], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send("Error al crear persona");
        });
      }

      const personId = result.insertId;

      db.query(query2, [personId, currentSalary], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send("Error al crear empleado");
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("Error al confirmar la transacción");
            });
          }

          res.status(201).send("Empleado creado con éxito");
        });
      });
    });
  });
});

// Obtener empleados
router.get("/", (req, res) => { // Cambiar "/employees" por "/"
  const query = "SELECT * FROM employee";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error al obtener empleados");
    } else {
      res.json(results);
    }
  });
});

// Actualizar empleado
router.put("/:id", (req, res) => { // Cambiar "/employees/:id" por "/:id"
  const { id } = req.params;
  const { name, lastName, ci, phone, email, birthDate, currentSalary } = req.body;
  const now = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 19).replace("T", " ");
  
  const query1 = `UPDATE person SET name = ?, lastName = ?, ci = ?, phone = ?, email = ?, birthDate = ?, lastUpdate = ? WHERE id = ?`;
  const query2 = `UPDATE employee SET currentSalary = ? WHERE Person_id = ?`;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send("Error al iniciar la transacción");
    }

    db.query(query1, [name, lastName, ci, phone, email, birthDate, now, id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send("Error al actualizar persona");
        });
      }

      db.query(query2, [currentSalary, id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send("Error al actualizar empleado");
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("Error al confirmar la transacción");
            });
          }

          res.status(200).send("Empleado actualizado con éxito");
        });
      });
    });
  });
});

// Eliminar empleado
router.delete("/:id", (req, res) => { // Cambiar "/employees/:id" por "/:id"
  const { id } = req.params;
  const query = "UPDATE person SET status = 0 WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send("Error al eliminar empleado");
    } else {
      res.send("Empleado eliminado con éxito");
    }
  });
});

router.get("/details", (req, res) => {
    const query = `
      SELECT 
        e.Person_id,
        p.name AS employeeName,
        p.lastName AS employeeLastName,
        p.ci AS employeeCI,
        p.phone AS employeePhone,
        p.email AS employeeEmail,
        p.birthDate AS employeeBirthDate,
        e.currentSalary,
        w.idWorkPermit AS workPermitId,
        w.description AS workPermitDescription,
        w.status AS workPermitStatus,
        pay.id AS paymentId,
        pay.ammount AS paymentAmount,
        pay.disccount AS paymentDiscount,
        pay.bonus AS paymentBonus,
        pay.status AS paymentStatus,
        att.idAttendence AS attendenceId,
        att.description AS attendenceDescription,
        att.time AS attendenceTime,
        att.status AS attendenceStatus,
        pos.idPosition AS positionId,
        pos.description AS positionDescription,
        pos.status AS positionStatus
      FROM employee e
      JOIN person p ON e.Person_id = p.id
      LEFT JOIN workpermit w ON e.Person_id = w.employee_Person_id
      LEFT JOIN payment pay ON e.Person_id = pay.employee_Person_id
      LEFT JOIN attendence att ON e.Person_id = att.employee_Person_id
      LEFT JOIN employee_position ep ON e.Person_id = ep.Employee_id
      LEFT JOIN position pos ON ep.Position_id = pos.idPosition
      WHERE p.status = 1
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener detalles del empleado:", err);
        return res.status(500).send("Error al obtener detalles del empleado");
      }
  
      const employees = {};
  
      results.forEach(row => {
        const personId = row.Person_id;
  
        if (!employees[personId]) {
          employees[personId] = {
            Person_id: personId,
            employeeName: row.employeeName,
            employeeLastName: row.employeeLastName,
            employeeCI: row.employeeCI,
            employeePhone: row.employeePhone,
            employeeEmail: row.employeeEmail,
            employeeBirthDate: row.employeeBirthDate,
            currentSalary: row.currentSalary,
            workPermits: [],
            payments: [],
            attendences: [],
            positions: []  // Añadido para posiciones
          };
        }
  
        // Añadir permisos de trabajo
        if (row.workPermitId) {
          employees[personId].workPermits.push({
            idWorkPermit: row.workPermitId,
            description: row.workPermitDescription,
            status: row.workPermitStatus
          });
        }
  
        // Añadir pagos
        if (row.paymentId) {
          employees[personId].payments.push({
            id: row.paymentId,
            amount: row.paymentAmount,
            discount: row.paymentDiscount,
            bonus: row.paymentBonus,
            status: row.paymentStatus
          });
        }
  
        // Añadir registros de asistencia
        if (row.attendenceId) {
          employees[personId].attendences.push({
            idAttendence: row.attendenceId,
            description: row.attendenceDescription,
            time: row.attendenceTime,
            status: row.attendenceStatus
          });
        }
  
        // Añadir posiciones
        if (row.positionId) {
          // Verificar si la posición ya fue añadida
          const positionExists = employees[personId].positions.some(
            pos => pos.idPosition === row.positionId
          );
  
          if (!positionExists) {
            employees[personId].positions.push({
              idPosition: row.positionId,
              description: row.positionDescription,
              status: row.positionStatus
            });
          }
        }
      });
  
      res.json(Object.values(employees));
    });
  });
  
  

module.exports = router;
