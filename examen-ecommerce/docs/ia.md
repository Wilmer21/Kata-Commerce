# Gobernanza y Auditoría de Inteligencia Artificial — Kata E-Commerce

## 1. Principios de Gobernanza y Políticas de Uso

Este proyecto implementa una metodología de **Desarrollo Asistido por IA con Gobernanza Estricta (Human-in-the-Loop)**. La Inteligencia Artificial actúa como acelerador y copiloto técnico, pero bajo las siguientes directrices inquebrantables:

1. **Autoridad Humana y Criterio Técnico**: Ninguna sugerencia arquitectónica o de código generada por la IA se incorpora sin previa evaluación, justificación técnica y aprobación explícita del desarrollador.
2. **Cero Tolerancia a Alucinaciones**:
   * No se aceptan paquetes npm innecesarios o inexistentes.
   * Se prohíbe el uso de `any` o conversiones de tipos forzadas (`as unknown as T`) inducidas por la IA para eludir errores del compilador.
3. **Verificación Automatizada Obligatoria**: Todo cálculo financiero, regla de negocio y validación de stock generada con asistencia de IA debe contar con pruebas unitarias que garanticen cobertura $\ge$ 80% y validación de casos límite.
4. **Trazabilidad y Honestidad**: Las decisiones, sugerencias aceptadas y, especialmente, las **sugerencias rechazadas** quedan registradas en este documento con evidencia verificable.

---

## 2. Prompts Estructurados y Subagentes Utilizados

### 2.1. Prompt Estructurado para el Motor de Descuentos
Utilizado para obligar al asistente a razonar sobre casos borde antes de implementar código:
```text
Rol: Diseñador de Algoritmos Financieros y TDD en TypeScript Estricto.
Entrada:
  - Subtotal original en centavos.
  - Reglas: Categoría Tecnología (10%), Volumen > 100 USD (5%), Cupón WELCOME2E26 (15%).
  - Límite máximo: 35% del subtotal original.
Instrucción:
  Diseña una función pura que ejecute la cascada de descuentos respetando precedencia.
  No utilices tipos flotantes. Emplea enteros en centavos y Math.round en puntos únicos.
  Genera primero la matriz de pruebas con todos los casos borde:
  1) subtotal 0, 2) subtotal exactamente $100.00, 3) subtotal $100.01, 4) cupón inválido/expirado,
  5) suma de descuentos < 35%, 6) suma de descuentos = 35%, 7) suma de descuentos > 35%.
```

### 2.2. Definición del Subagente Auditor
* **Nombre**: `Code-Quality-And-Coverage-Auditor`
* **Responsabilidad**:
  * Inspeccionar el código en busca de operadores `any` o castings inseguros.
  * Auditar que la cobertura de código en capas críticas cumpla el umbral mínimo del 80%.
  * Detectar operaciones aritméticas sobre números decimales no convertidos a centavos.
  * Validar que los endpoints del backend no confíen en datos monetarios provistos por el frontend.

---

## 3. Bitácora de Co-Creación y Auditoría Humana

A continuación se documenta el registro cronológico y real de las interacciones, propuestas de la IA y resoluciones del desarrollador.

| Fecha / Fase | Propuesta de la IA | Evaluación Humana | Decisión | Justificación Técnica del Desarrollador |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1: Estructura** | Mover las carpetas `apps/` y `docs/` de `examen-ecommerce/` directamente a la raíz de `Kata-Commerce/`. | **Rechazada** | Mantener `examen-ecommerce/` tal como está. | El esqueleto inicial del repositorio fue entregado con esa estructura obligatoria. Mover archivos fuera de `examen-ecommerce/` violaría las restricciones del enunciado del examen. |
| **Fase 1: Manejo Numérico** | Utilizar enteros en centavos (`cents: number`) en lugar de floats de JavaScript para todo importe. | **Aprobada** | Adoptar enteros en centavos en todo el core y contratos de la API. | Evita el problema clásico de coma flotante IEEE 754 (`0.1 + 0.2 = 0.30000000000000004`), eliminando la necesidad de dependencias externas pesadas como `decimal.js`. |
| **Fase 1: Tope del 35%** | Utilizar distribución LIFO / por precedencia para el recorte del tope del 35% reportando `calculado` vs `aplicado`. | **Aprobada** | Implementar estrategia LIFO en el motor. | Respeta la precedencia de negocio. La distribución proporcional generaría decimales anómalos y rompería la promesa del cupón del 15%. |
| **Fase 1: Alerta del 35%** | Activar la alerta visual si `descuentoCalculado >= subtotalOriginal * 0.35` (con subtotal > 0). | **Aprobada** | Adoptar condición inclusiva ($\ge$). | Si el cliente alcanza exactamente el 35% de descuento, debe recibir la felicitación por haber alcanzado el tope máximo de ahorro. |
| **Fase 1: Persistencia** | Utilizar patrón Repository con implementación dual: SQLite (`better-sqlite3`) + InMemory. | **Aprobada** | Adoptar SQLite para ejecución y transacciones atómicas; InMemory para tests. | Garantiza atomicidad real en la deducción de inventario ante concurrencia, sin requerir Docker ni servicios externos para la evaluación. |
| **Fase 3: Gestor de Paquetes** | Ejecutar instalación inicial mediante `npm install`. | **Rechazada** | Utilizar exclusivamente `pnpm` (`pnpm install`, `pnpm approve-builds`). | El desarrollador corrigió la instrucción: *"no usemos npm usemos mejor pnpm que es mejor y mas seguro"*. Mayor velocidad, eficiencia y aislamiento estricto de dependencias. |
| **Fase 3: Seguridad de Repositorio** | No existía `.gitignore`, dejando expuestos `node_modules/`, `coverage/`, `.db` y `.env`. | **Aprobada e intervenida** | Creación de `.gitignore` exhaustivo y provisión de `.env.example` y `.env` local. | El desarrollador alertó sobre los paquetes pendientes para git: *"ayudame con algo mega importante, el .gitignore, tengo todas los paquetes para subir a git y eso no debe ser"*. Se blindó el repositorio. |

---

## 4. Ejemplos Reales de Corrección / Rechazo de Sugerencias de IA

### Caso 1: Rechazo de alteración de la estructura del repositorio
* **Sugerencia de la IA**: *"Recomiendo mover el contenido de `examen-ecommerce/` directamente a la raíz de `Kata-Commerce/` para evitar una carpeta anidada redundante"*.
* **Intervención del Desarrollador**: El desarrollador detuvo la reestructuración indicando: *"primero, no podemos mover nada, asi como esta el esqueleto es como lo piden"*.
* **Impacto**: Se protegió la integridad del proyecto frente a una simplificación ciega que hubiera quebrantado los requerimientos de entrega de la prueba.

### Caso 2: Rechazo de npm a favor de pnpm
* **Sugerencia / Acción de la IA**: Intento de instalar paquetes con `npm`.
* **Intervención del Desarrollador**: *"no usemos npm usemos mejor pnpm que es mejor y mas seguro"*.
* **Impacto**: Se configuró pnpm 11 y se autorizó explícitamente la compilación nativa de `better-sqlite3` con `pnpm approve-builds`, reduciendo huella en disco y aumentando la seguridad en la cadena de suministro.

### Caso 3: Corrección en captura de excepciones en useCartStore
* **Propuesta inicial de la IA**: La captura de errores en el checkout evaluaba estrictamente `err instanceof ApiError`, omitiendo errores nativos de conexión y red (`Error`).
* **Intervención / Corrección en Auditoría**: Se corrigió para evaluar `err instanceof Error`, garantizando que cualquier fallo de transporte o red muestre un mensaje claro en la UI en lugar de un mensaje genérico.

---

## 5. Matriz de Trazabilidad de Código Asistido

| Componente | Archivo | Asistencia de IA | Verificación / Corrección Humana | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Documentación** | `docs/arquitectura.md` | Generación del borrador técnico | Revisión de fórmulas y coherencia de centavos | Verificado |
| **Documentación** | `docs/ia.md` | Estructura de bitácora y políticas | Registro de decisiones reales y rechazos | Verificado |
| **Motor de Descuentos** | `apps/backend/src/domain/engine/...` | Implementación con patrón Strategy y LIFO | 17 tests unitarios en Vitest, 97.5% cobertura | **Verificado** |
| **Repositorios & Stock** | `apps/backend/src/infrastructure/...` | Implementación dual (SQLite + InMemory) | Transacciones atómicas contra sobreventa, 8 tests | **Verificado** |
| **API Express & Zod** | `apps/backend/src/infrastructure/http/...` | Enrutamiento Express, esquemas Zod y middleware de errores | 10 tests de integración con Supertest, 97.1% cobertura total | **Verificado** |
| **Frontend Checkout** | `apps/frontend/src/...` | Componentes React, Zustand store y testing library | 29 tests con React Testing Library, 96.26% cobertura | **Verificado** |
