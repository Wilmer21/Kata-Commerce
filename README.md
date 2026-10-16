# 🛒 Kata-Commerce — Core E-Commerce & Motor de Descuentos Acumulativos

Bienvenido a **Kata-Commerce**, una solución modular y robusta para un sistema de checkout de comercio electrónico con **descuentos acumulativos en cascada**, control estricto de **inventario concurrente** y una **gobernanza asistida por Inteligencia Artificial** con trazabilidad y auditoría humana real.

---

## 📌 Decisiones Arquitectónicas Destacadas

1. **Precisión Financiera en Centavos (`Cents: number`)**: Se eliminaron los problemas clásicos de punto flotante de JavaScript (`0.1 + 0.2 = 0.30000000000000004`). Todos los cálculos monetarios se realizan con enteros en centavos y redondeos unificados.
2. **Motor de Descuentos Puro (Patrón Strategy)**: Las 4 reglas de negocio (10% Tecnología, 5% Volumen > $100, 15% Cupón `WELCOME2E26` y Tope 35% LIFO) están 100% desacopladas de Express, React y de la base de datos.
3. **Persistencia Transaccional (Patrón Repository Dual)**: 
   * **SQLite (`better-sqlite3`)**: Persistencia relacional local con transacciones ACID (`BEGIN IMMEDIATE`) que impiden sobreventa de stock en compras concurrentes.
   * **InMemory**: Implementación en memoria para ejecutar suites de prueba en milisegundos sin latencia de disco.
4. **Backend como Autoridad**: El frontend nunca impone precios ni totales; el backend valida stock y consulta los precios reales en la base de datos antes de calcular los importes definitivos.
5. **Cobertura de Pruebas Superior al 97%**: 43 pruebas automatizadas (unitarias y de integración) con Vitest y Supertest.

---

## 📂 Estructura del Proyecto

```text
Kata-Commerce/
├── .gitignore                     # Protección de node_modules, build, logs, db y .env
├── .env.example                   # Variables de entorno globales de ejemplo
├── README.md                      # Esta guía
└── examen-ecommerce/
    ├── docs/
    │   ├── arquitectura.md        # Especificación de módulos, contratos y patrones
    │   ├── ia.md                  # Bitácora de co-creación y auditoría de IA (Human-in-the-Loop)
    │   └── pre-initial-commerce.md# Requisitos y contexto inicial de desarrollo
    └── apps/
        ├── backend/               # API REST Express + TypeScript + SQLite
        │   ├── src/
        │   │   ├── domain/        # Modelos, tipos monetarios y Motor de Descuentos (Strategy)
        │   │   ├── application/   # CheckoutService y ProductService (Orquestación)
        │   │   ├── infrastructure/# SQLite, InMemory Repositories, Rutas Express y Esquemas Zod
        │   │   ├── app.ts         # Fábrica de Express
        │   │   └── server.ts      # Bootstrap del servidor
        │   └── tests/             # 43 pruebas (Unitarias e Integración HTTP)
        └── frontend/              # (En construcción - Fase 4)
```

---

## 🚀 Guía de Instalación y Ejecución del Backend

### 1. Requisitos Previos
* **Node.js**: Versión `22.x` (verificar con `node -v`).
* **pnpm**: Versión `11.x` o superior (verificar con `pnpm -v`).

### 2. Configuración Inicial
Navega a la carpeta del backend:
```bash
cd examen-ecommerce/apps/backend
```

Copia el archivo de variables de entorno de ejemplo:
```bash
cp .env.example .env
```
*(En Windows PowerShell: `Copy-Item .env.example .env`)*

Contenido por defecto de `.env`:
```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/ecommerce.db
CORS_ORIGIN=http://localhost:5173
```

### 3. Instalación de Dependencias
Instala los paquetes mediante `pnpm`:
```bash
pnpm install
```

> **Nota para pnpm 11**: Si es la primera vez que instalas dependencias nativas compiladas como `better-sqlite3`, ejecuta para autorizarlas:
> ```bash
> pnpm approve-builds --all
> ```

---

## 🗄️ Base de Datos SQLite y Datos Semilla

No necesitas instalar Docker ni configurar servidores de bases de datos externos. 

Al encender el servidor por primera vez:
1. SQLite creará automáticamente el archivo de base de datos en `./data/ecommerce.db`.
2. Creará las tablas `products` y `orders`.
3. Sembrará automáticamente el **catálogo inicial de 8 productos** con distintas categorías (`Tecnología`, `Hogar`, `Moda`, `Alimentos`) y stock preconfigurado para validar las reglas de descuento.

---

## 💻 Comandos del Backend

Dentro de `examen-ecommerce/apps/backend`:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo con recarga en caliente (`tsx watch`) en `http://localhost:3001`. |
| `pnpm db:init` | Inicializa y siembra la base de datos SQLite en `./data/ecommerce.db`. |
| `pnpm db:view` | **Explora directamente en la terminal el contenido real de la base de datos (productos y órdenes).** |
| `pnpm test` | Ejecuta las **43 pruebas** automatizadas en modo rápido con Vitest. |
| `pnpm test:coverage` | Corre la suite completa y genera el reporte de cobertura en terminal y en `coverage/index.html`. |
| `pnpm build` | Compila TypeScript en modo estricto hacia JavaScript en la carpeta `dist/`. |
| `pnpm start` | Corre el servidor compilado en producción con Node.js (`node dist/server.js`). |

---

## 🎨 Guía y Comandos del Frontend (React + Vite + Tailwind)

Navega a la carpeta del frontend:
```bash
cd examen-ecommerce/apps/frontend
```

Instala las dependencias:
```bash
pnpm install
```

### Comandos del Frontend

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia la aplicación React en `http://localhost:3000` con proxy automático hacia el backend. |
| `pnpm test` | Ejecuta las **29 pruebas** de componentes y store de Zustand con Vitest y React Testing Library. |
| `pnpm test:coverage` | Genera el reporte de cobertura del frontend (**96.26%**) en terminal y en `coverage/index.html`. |
| `pnpm build` | Compila TypeScript y empaqueta la aplicación de producción con Vite en la carpeta `dist/`. |
| `pnpm preview` | Previsualiza localmente el build de producción generado. |

---

## 📡 Endpoints de la API REST

* **`GET /api/health`**: Verificación de estado del servicio.
* **`GET /api/products`**: Lista todos los productos disponibles con categoría y stock actual.
* **`GET /api/products/:id`**: Consulta el detalle de un producto específico.
* **`POST /api/checkout`**: Valida carrito, ejecuta motor de descuentos, descuenta stock atómicamente y genera la orden.
* **`GET /api/orders`**: Lista las órdenes registradas en el sistema.
* **`GET /api/orders/:id`**: Consulta una orden específica por su identificador.

---

## 📖 Documentación Complementaria

* [Documento de Arquitectura](file:///c:/Users/hachi/Documents/KATA/Kata-Commerce/examen-ecommerce/docs/arquitectura.md): Diagramas de capas, fórmulas matemáticas de descuento y detalles de los patrones Strategy y Repository.
* [Gobernanza y Auditoría de IA](file:///c:/Users/hachi/Documents/KATA/Kata-Commerce/examen-ecommerce/docs/ia.md): Bitácora de co-creación con las intervenciones humanas y decisiones aprobadas/rechazadas.
