const express = require("express");
const bodyParser = require("body-parser");


const employeeRoutes = require("./database/employee");
const paymentRoutes = require("./database/payment");
const workPermitRoutes = require("./database/workpermits");
const attendenceRoutes = require("./database/attendence");
const positionRoutes = require("./database/position");
const employeePositionRoutes = require("./database/employeePosition");
const categoryRoutes = require("./database/category");
const productRoutes = require("./database/product");
const rawMaterialRoutes = require("./database/rawMaterial");
const productProductionRoutes = require("./database/productProduction");

const app = express();
app.use(bodyParser.json());

// Configurar rutas
app.use("/employees", employeeRoutes);
//
app.use("/payments", paymentRoutes);
//
app.use("/workpermits", workPermitRoutes);
//
app.use("/attendences", attendenceRoutes);
//
app.use("/positions", positionRoutes);
//
app.use("/employee-positions", employeePositionRoutes);
//
app.use("/categories", categoryRoutes);
//
app.use("/products", productRoutes);
//
app.use("/raw-materials", rawMaterialRoutes);
//
app.use("/product-production", productProductionRoutes);









app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});
