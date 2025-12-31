import express from "express";
import sequelize from "./config/database.mjs";
import session from "express-session";
import bcryptjs from "bcryptjs";
import { errors } from "celebrate";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.mjs";
/* import swaggerSpec from "./docs/swagger.js";
import swaggerUi from "swagger-ui-express"; */
import { errorHandler } from "./helpers/statusCode.mjs";
import Usuarios from "./models/usuarios.mjs";
import rol from "./models/rol.mjs";
import config from "./models/configuracion.mjs";
import dataClientes from "./routes/data/clientes.mjs";
import dataDasboard from "./routes/data/dashboard.mjs";
import dataRol from "./routes/data/rol.mjs";
import dataReferencia from "./routes/data/referencias.mjs";
import dataInventario from "./routes/data/inventario.mjs";
import dataBodega from "./routes/data/bodega.mjs";
import dataMateria from "./routes/data/materia.mjs";
import dataInsumos from "./routes/data/insumos.mjs";
import dataSession from "./routes/data/registroSesiones.mjs";
import dataResponsable from "./routes/data/responsable.mjs";
import dataUsuarios from "./routes/data/usuariosRoutes.mjs";
import dataProveedores from "./routes/data/proveedores.mjs";
import dataProveedoresInsumos from "./routes/data/proveedoresInsumos.mjs";
import dataOrdenProduccion from "./routes/data/orderProduccion.mjs";
import dataProduccion from "./routes/data/produccion.mjs";
import dataControlAlistamiento from "./routes/data/controlAlistamiento.mjs";
import dataCortes from "./routes/data/registroAreaCorte.mjs";
import dataCuarto from "./routes/data/registroCuartos.mjs";
import dataEmpaques from "./routes/data/registroAreaEmpaque.mjs";
import dataFrituras from "./routes/data/registroAreaFritura.mjs";
import dataRecepcion from "./routes/data/registroRecepcion.mjs";
import dataRcepcionOp from "./routes/data/registrRecepcionOp.mjs";
import dataTemperatura from "./routes/data/registroTemperatura.mjs";
import dataVerificacion from "./routes/data/verificacionPesoempaque.mjs";
import configuracion from "./routes/data/configuracion.mjs";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

dotenv.config();
const app = express();

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(errorHandler);

app.use(
  cors({
    credentials: true,
  })
);
app.set("trust proxy", true);

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || "secret",
});

redisClient.connect().catch(console.error);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 7200000,
    },
  })
);

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log(" Conectado a Redis");
});

app.use("/data/cliente", dataClientes);
app.use("/data/dashboard", dataDasboard);
app.use("/data/fritura", dataFrituras);
app.use("/data/empaque", dataEmpaques);
app.use("/data/bodega", dataBodega);
app.use("/data/materia", dataMateria);
app.use("/data/inventario", dataInventario);
app.use("/data/insumos", dataInsumos);
app.use("/data/verficarempaques", dataVerificacion);
app.use("/data/rol", dataRol);
app.use("/data/referencias", dataReferencia);
app.use("/data/historial", dataSession);
app.use("/data/empleados", dataResponsable);
app.use("/data/usuarios", dataUsuarios);
app.use("/data/proveedor", dataProveedores);
app.use("/data/proveedorInsumos", dataProveedoresInsumos);
app.use("/data/cuarto", dataCuarto);
app.use("/data/corte", dataCortes);
app.use("/data/recepcion", dataRecepcion);
app.use("/data/recepcionop", dataRcepcionOp);
app.use("/data/encargo", dataOrdenProduccion);
app.use("/data/produccion", dataProduccion);
app.use("/data/temperatura", dataTemperatura);
app.use("/config/encargo", configuracion);
app.use("/data/alistamiento", dataControlAlistamiento);
app.use("/auth", authRoutes);

wss.on("connection", (ws) => {
  console.log("Cliente WebSocket conectado");
  ws.send(JSON.stringify({ type: "welcome", msg: "Conexión WS establecida" }));
});

// Función de ayuda para emitir a todos los clientes conectados
export function broadcastWS(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(data);
  });
}

sequelize
  .sync()
  .then(async () => {
    console.log("Conectado a la base de datos");
    server.listen(process.env.PORT || 3200, async () => {
      console.log(
        `Servidor HTTP+WS corriendo en puerto ${process.env.PORT || 3200}`
      );

      if ((await rol.count()) === 0) {
        try {
          await rol.bulkCreate([
            {
              id: 1,
              nombre: "Admin",
              descripcion: "Control total",
              estado: 2,
            },
            {
              id: 2,
              nombre: "Produccion",
              descripcion: "Control total de todos los módulos de produccion.",
              estado: 2,
            },
            {
              id: 3,
              nombre: "Recepcion",
              descripcion: "Encargado del area de recepción",
              estado: 2,
            },
            {
              id: 4,
              nombre: "Alistamiento",
              descripcion: "Encargada del Area de Alistamiento.",
              estado: 2,
            },
            {
              id: 5,
              nombre: "Corte",
              descripcion: "Encargado del area de producción",
              estado: 2,
            },
            {
              id: 6,
              nombre: "Fritura",
              descripcion: "Encargado del area de fritura",
              estado: 2,
            },
            {
              id: 7,
              nombre: "Empaque",
              descripcion: "Encargado del area de empaque",
              estado: 2,
            },
            {
              id: 8,
              nombre: "Cuartos",
              descripcion:
                "Encargado del registro de temperatura de los cuartos.",
              estado: 2,
            },
            {
              id: 9,
              nombre: "Productor",
              descripcion: "Encargado de administrador toda la produccion.",
              estado: 2,
            },
            {
              id: 10,
              nombre: "Gerente",
              descripcion: "Encargado de gestionar la parte Administrativa.",
              estado: 2,
            },
            {
              id: 11,
              nombre: "Pelador",
              descripcion: "Encargado de pelar las canastillas de platano.",
            },
            {
              id: 12,
              nombre: "RRHH",
              descripcion: "Encargada de la gestion de recursos humanos.",
              estado: 2,
            },
            {
              id: 13,
              nombre: "Empacador",
              descripcion: "Encargado de emapacar patacon.",
            },
            {
              id: 14,
              nombre: "Cortador",
              descripcion: "Encargado de cortar el platano pelado.",
            },
            {
              id: 15,
              nombre: "Fritador",
              descripcion: "Encargado de la fritura del platano.",
            },
            {
              id: 16,
              nombre: "Termometrista",
              descripcion: "Encargado de tomar la temperatura a los cuartos.",
            },
            {
              id: 17,
              nombre: "Desgajador",
              descripcion: "Encargado de desgajar el platano.",
            },
            {
              id: 18,
              nombre: "RecursosHumanos",
              descripcion: "Encargada del talento Humano.",
            },
            {
              id: 19,
              nombre: "Elaborador",
              descripcion: "Encargador de Elaborar toda la produccion.",
            },
            {
              id: 20,
              nombre: "Patinador",
              descripcion:
                "Encargado de Asiganar las castillas a las peladoras.",
            },
          ]);
          await config.bulkCreate([{ id: 1, orden_actual: null }]);
          await Usuarios.bulkCreate([
            {
              user_name: "AdminDashboard",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 1,
            },
            {
              user_name: "AdminProduccion",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 2,
            },
            {
              user_name: "AdminRecepcion",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 3,
            },
            {
              user_name: "AdminAlistamiento",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 4,
            },
            {
              user_name: "AdminCorte",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 5,
            },
            {
              user_name: "AdminFritura",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 6,
            },
            {
              user_name: "AdminEmpaque",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 7,
            },
            {
              user_name: "AdminCuartos",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 8,
            },
            {
              user_name: "ProductorContenedor",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 9,
            },
            {
              user_name: "Gerencia",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 10,
            },
            {
              user_name: "RecursosHumanos",
              password: await bcryptjs.hash("Admin11**", 12),
              id_rol: 12,
            },
          ]);
          console.log("Roles creados exitosamente");
        } catch (error) {
          console.error("Error creando roles:", error);
        }
      }
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});
/* 
app.get("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 */
app.use(errors());
