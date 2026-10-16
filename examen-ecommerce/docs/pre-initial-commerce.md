# Pre-initial Commerce — Contexto inicial de desarrollo

## Propósito

Este documento registra el contexto y las instrucciones iniciales utilizadas para orientar el desarrollo asistido por IA del MVP de checkout de e-commerce.

El objetivo no es delegar íntegramente la resolución de la prueba a un asistente, sino utilizarlo como herramienta de apoyo para analizar los requisitos, explorar alternativas arquitectónicas, identificar riesgos y proponer una estrategia de implementación verificable.


## Naturaleza del documento

Este archivo contiene el contexto inicial y las instrucciones proporcionadas al asistente de IA para apoyar el desarrollo del comercio electrónico.

Los requisitos funcionales provienen del enunciado de la prueba. Las tecnologías, los patrones de diseño, la estructura del proyecto y las estrategias de implementación son propuestas iniciales que deben evaluarse antes de convertirse en decisiones definitivas.

El desarrollo se realizará de forma incremental. El asistente podrá proponer alternativas, identificar riesgos y generar código, pero cada decisión relevante deberá revisarse según los requisitos, la mantenibilidad, la complejidad y los resultados de las pruebas.

Las decisiones finales, sus justificaciones y las intervenciones del desarrollador quedarán documentadas en docs/arquitectura.md y docs/ia.md.

## Origen de los requisitos

Los requisitos funcionales y técnicos parten del enunciado de la prueba técnica Full Stack: Core E-Commerce con Sistema de Descuentos Acumulativos.

A partir de estos requisitos, se definió un contexto de trabajo para el asistente, con énfasis en la separación de responsabilidades, la precisión de los cálculos, la consistencia del inventario, las pruebas automatizadas y la trazabilidad de las decisiones.

## Criterios de trabajo

- Evaluar las propuestas de la IA antes de incorporarlas al proyecto.
- Justificar las decisiones arquitectónicas con base en los requisitos y las restricciones de tiempo.
- Mantener las reglas de negocio independientes de la infraestructura.
- Verificar mediante pruebas los cálculos, las validaciones y los casos límite.
- Registrar las sugerencias aceptadas, modificadas o rechazadas cuando exista evidencia del proceso.
- No considerar una funcionalidad terminada hasta haber revisado su implementación y las pruebas correspondientes.

## Alcance del documento

El prompt que aparece a continuación corresponde al contexto inicial de trabajo. Sus propuestas no deben interpretarse automáticamente como decisiones finales ni como funcionalidades implementadas.

Las decisiones definitivas, los resultados de las pruebas y las intervenciones humanas se documentarán en `docs/arquitectura.md` y `docs/ia.md`, según corresponda.

---

## Prompt inicial utilizado

### 1. Tu rol dentro del proyecto

Actúa como un **arquitecto de software senior y desarrollador Full Stack**, con experiencia en diseño de sistemas modulares, TypeScript estricto, APIs REST, patrones de diseño, pruebas automatizadas y gobernanza de Inteligencia Artificial.

Tu responsabilidad es acompañarme en la construcción de una solución funcional para una prueba técnica de selección laboral.

No debes limitarte a generar código. Debes ayudarme a tomar decisiones de ingeniería justificadas, identificar riesgos, revisar las implementaciones, proponer pruebas y prepararme para defender técnicamente cada decisión ante un panel evaluador.

**Regla fundamental:** el objetivo no es escribir la mayor cantidad de código ni construir una aplicación innecesariamente compleja. El objetivo es entregar un MVP confiable, modular, testeable, funcional y fácil de explicar en una sustentación de 20 minutos.

Asume que soy un desarrollador con experiencia en frontend, React, TypeScript y Node.js, y conocimientos de backend. Explica los conceptos complejos cuando sea necesario, pero no simplifiques las decisiones técnicas importantes.

### 2. Descripción del proyecto

Debemos construir una aplicación de checkout para un e-commerce que permita:

- Consultar productos preconfigurados.
- Agregar y eliminar productos del carrito.
- Visualizar el subtotal original en tiempo real.
- Aplicar un cupón promocional.
- Calcular descuentos acumulativos respetando un orden de precedencia.
- Visualizar el desglose de cada descuento, el ahorro total y el valor final.
- Validar el stock desde el backend.
- Procesar y persistir órdenes.
- Informar visualmente cuando se alcance el límite máximo de descuento.
- Demostrar una arquitectura modular y patrones de diseño explícitos.
- Conseguir al menos un 80 % de cobertura de pruebas en las capas lógicas relevantes.
- Documentar el uso de IA y demostrar que el desarrollador auditó y corrigió sus sugerencias.


### 3. Stack tecnológico - evaluación de tecnologías

Antes de inicializar el proyecto, analiza las tecnologías candidatas considerando los requisitos de la prueba, el tiempo disponible, la complejidad operativa, la facilidad de testing y la mantenibilidad.

### 3.1 Frontend
- TypeScript con modo estricto.
- Evaluar React con Vite frente a Next.js.
- Seleccionar una sola alternativa y justificar la decisión.
- Elegir una estrategia de estado apropiada para el catálogo, el carrito y el checkout.
- Utilizar Vitest y React Testing Library cuando corresponda.

### 3.2 Backend
- Node.js y TypeScript.
- Evaluar Express frente a Fastify según las necesidades del MVP.
- Implementar una API REST con validación de datos en tiempo de ejecución.
- Seleccionar una estrategia de persistencia coherente con la integridad de las órdenes y el control de inventario.

### 3.3 Persistencia
Comparar SQLite con una alternativa en memoria, considerando las transacciones, la persistencia entre reinicios, la concurrencia y la facilidad de ejecución local.

### 3.4 Resultado esperado
Antes de escribir código, presentar:
1. Las alternativas evaluadas.
2. Las ventajas y desventajas de cada alternativa.
3. La opción recomendada y su justificación.
4. Las limitaciones conocidas.
5. Las decisiones pendientes de confirmación.

No instalar dependencias ni generar la estructura definitiva hasta completar este análisis y revisar la propuesta.

Node y TypeScript son una dupla fuerte y necesaria para el control y mejor mantenimiento, se menciona para que el desarrollo de backend se haga con lenguaje typescript pero con el entorno de node

Puedes proponer otro stack si existe una justificación técnica concreta, pero no cambies de tecnología sin explicar el beneficio.

Si eliges persistencia en memoria, documenta sus limitaciones: pérdida de información al reiniciar y problemas de consistencia entre múltiples instancias. No presentes una implementación en memoria como persistencia durable.

Separa claramente las responsabilidades:

- Presentación e interacción del usuario.
- Estado del carrito.
- Contratos y tipos compartidos.
- Controladores HTTP.
- Servicios de aplicación.
- Motor de descuentos.
- Reglas individuales de descuento.
- Validación de stock.
- Persistencia de órdenes y productos.
- Pruebas automatizadas.

El motor de descuentos no debe depender de Express, React, la base de datos ni detalles de transporte HTTP.

Evita sobrearquitectura, capas vacías, abstracciones innecesarias y patrones implementados únicamente para mencionarlos en la documentación.

### 4. Reglas de negocio obligatorias

El backend es la autoridad para calcular los precios finales. El frontend puede mostrar una previsualización, pero no debe determinar unilateralmente el total que se cobra.

#### Regla 1: descuento de categoría

Si el carrito contiene productos de categoría `Tecnología`, aplica un 10 % de descuento únicamente sobre las unidades de esos productos.

Fórmula:

`descuentoCategoria = subtotalTecnologia * 0.10`

Los productos de otras categorías no deben recibir este descuento.

#### Regla 2: descuento por volumen

Después de aplicar el descuento de categoría, calcula el subtotal ajustado.

Si ese subtotal es estrictamente superior a 100 USD, aplica un 5 % de descuento adicional sobre todo el carrito ajustado.

Si el subtotal es exactamente 100 USD, no se aplica el descuento por volumen.

Fórmula:

`subtotalAjustado = subtotalOriginal - descuentoCategoria`

`descuentoVolumen = subtotalAjustado > 100 ? subtotalAjustado * 0.05 : 0`

#### Regla 3: descuento por cupón

El cupón válido es `WELCOME2E26`, interpretado sin distinguir mayúsculas y minúsculas y eliminando espacios al principio y al final.

El código debe validarse en el backend contra la configuración de cupones registrados. Un cupón desconocido o expirado no debe conceder ningún descuento.

Si el cupón está activo, aplica un 15 % sobre el importe restante después de los descuentos anteriores.

Fórmula:

`subtotalAjustadoPorVolumen = subtotalAjustado - descuentoVolumen`

`descuentoCupon = cuponValido ? subtotalAjustadoPorVolumen * 0.15 : 0`

La validez del cupón debe evaluarse mediante una regla explícita y testeable.

#### Regla 4: límite absoluto del 35 %

El descuento total nunca puede superar el 35 % del subtotal original.

Fórmula:

`descuentoCalculado = descuentoCategoria + descuentoVolumen + descuentoCupon`

`descuentoMaximo = subtotalOriginal * 0.35`

`descuentoTotal = Math.min(descuentoCalculado, descuentoMaximo)`

`totalPagar = subtotalOriginal - descuentoTotal`

Si el descuento acumulado supera el máximo, el descuento efectivo debe limitarse al 35 % del subtotal original.

IMPORTANTE: el desglose debe ser coherente. Si el límite obliga a reducir el descuento, no muestres los descuentos individuales originales como si todos se hubieran aplicado íntegramente. Distingue entre descuentos calculados antes del límite y descuentos efectivamente aplicados. Define una estrategia de distribución del ajuste y documéntala.

El frontend debe mostrar una alerta persistente y distintiva cuando se alcance el límite:

"¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)"

Define de forma explícita si la alerta se activa cuando el descuento llega exactamente al 35 % o cuando el cálculo previo lo supera. Para cumplir el objetivo de detectar el tope, recomiendo activarla cuando el descuento calculado antes del límite sea igual o superior al máximo, siempre que el subtotal sea mayor que cero.

#### Precisión monetaria

No utilices operaciones de punto flotante sin una estrategia de precisión.

Evalúa el uso de centavos enteros o una biblioteca de precisión decimal. Define cómo se redondean los descuentos individuales, cómo se aplica el tope y cómo se garantiza que:

`totalPagar = subtotalOriginal - descuentoTotal`

Todos los importes deben ser consistentes entre frontend y backend.

### 5. Contratos de la API

Diseña contratos tipados y documentados.

Como mínimo, considera:

- `GET /api/products`: devuelve los productos disponibles.
- `POST /api/checkout`: valida el carrito, calcula los descuentos, descuenta el stock y registra la orden.
- `GET /api/orders/:id`: consulta una orden confirmada.

Puedes ajustar las rutas si tienes una razón clara.

El checkout debe recibir identificadores de productos, cantidades y el cupón opcional. No confíes en los precios, descuentos, totales ni stock enviados por el frontend.

La respuesta debe incluir:

- Identificador de la orden.
- Estado de la transacción.
- Subtotal original.
- Descuento de categoría.
- Descuento por volumen.
- Descuento por cupón.
- Descuento calculado antes del límite.
- Descuento total efectivamente aplicado.
- Porcentaje de ahorro efectivo.
- Límite alcanzado.
- Total a pagar.
- Detalle de los productos comprados.

Define interfaces o esquemas de validación para solicitudes y respuestas.

Los errores deben tener un formato consistente y códigos HTTP apropiados. Por ejemplo, stock insuficiente no debe generar una orden confirmada.

### 6. Consistencia del checkout

El procesamiento de una orden debe seguir un flujo coherente:

1. Validar la estructura de la solicitud.
2. Rechazar carritos vacíos, cantidades inválidas y productos desconocidos.
3. Comprobar el stock disponible.
4. Obtener los precios y categorías desde el backend.
5. Ejecutar el motor de descuentos.
6. Registrar la orden y actualizar el stock de manera consistente.
7. Retornar la confirmación con los totales definitivos.

Evita condiciones de carrera que permitan vender unidades inexistentes.

Si utilizas almacenamiento en memoria, implementa la consistencia que permita el alcance de la solución y documenta sus limitaciones. No afirmes que existe atomicidad concurrente si no está garantizada.

### 7. Patrones de diseño - Evaluación de arquitectura

Analiza la separación entre catálogo, carrito, reglas de descuentos, checkout, persistencia y gestión de inventario.

Identifica qué responsabilidades deben estar aisladas y propone una arquitectura proporcional al tamaño del MVP.

Evalúa, sin asumir que todos son necesarios:
- Strategy para las reglas de descuentos que requieran comportamientos intercambiables.
- Repository para desacoplar la lógica de negocio de la persistencia.
- Factory u otros patrones únicamente si resuelven un problema concreto.

Para cada patrón propuesto, explica:
1. Qué problema real resuelve.
2. Qué complejidad introduce.
3. Qué alternativa más sencilla existe.
4. Cómo se probaría.
5. Por qué vale la pena utilizarlo en este proyecto.

Evita implementar patrones por cumplir una lista o crear abstracciones sin una necesidad demostrable. Documenta las decisiones y los compromisos técnicos en `docs/arquitectura.md`.

### 8. Tipado y calidad de código

Utiliza TypeScript estricto de extremo a extremo.

Evita `any`, conversiones forzadas injustificadas, duplicación de contratos y tipos ambiguos.

Modela explícitamente:
- Producto.
- Categoría de producto.
- Ítem del carrito.
- Cupón.
- Descuento individual.
- Resultado del motor de descuentos.
- Orden.
- Detalle de la orden.
- Errores de dominio.
- Solicitudes y respuestas HTTP.

Valida los datos externos en tiempo de ejecución: TypeScript por sí solo no valida solicitudes HTTP.

No confíes en que un dato es correcto únicamente porque tiene un tipo declarado.

### 9. Estrategia de pruebas

Define una estrategia de pruebas que cubra las reglas de negocio, los errores esperados, la integridad de las órdenes y los flujos principales de la interfaz.

Prioriza:
1. Pruebas unitarias del motor de descuentos.
2. Pruebas de integración del checkout, la persistencia y la validación del inventario.
3. Pruebas de los flujos principales del frontend.
4. Casos límite, entradas inválidas y fallos de persistencia.
5. Concurrencia y atomicidad cuando la estrategia de persistencia seleccionada lo requiera y permita verificarlas.

Mantén el objetivo de cobertura mínima del 80 % establecido para la prueba. No confundas cobertura de líneas con calidad de las pruebas: verifica que los casos comprueben resultados y reglas de negocio.

Clasifica los escenarios como obligatorios, recomendados o dependientes de la arquitectura. No declares que una prueba pasó si no se ha ejecutado y registra los resultados reales.

### 10. Gobernanza de Inteligencia Artificial: docs/ia.md

La capacidad para gobernar el uso de IA. La documentación debe ser honesta, concreta y verificable.

Incluye:

1. Un prompt estructurado o skill diseñado para automatizar una tarea específica, por ejemplo, generar casos de prueba a partir de las reglas de negocio.
2. Un agente o subagente con rol y reglas explícitas, por ejemplo, un auditor de TypeScript, seguridad y cobertura.
3. Una bitácora de co-creación que identifique qué partes fueron sugeridas por IA y cuáles fueron diseñadas, revisadas o corregidas manualmente.
4. Al menos dos ejemplos reales de sugerencias de IA que se rechazaron o corrigieron por motivos técnicos.
5. Evidencia de la revisión humana: pruebas ejecutadas, cambios realizados y justificación de las decisiones.

No inventes porcentajes de código generado por IA, conversaciones, prompts ejecutados ni errores que supuestamente corregimos.

Si todavía no tenemos evidencia real, crea una estructura de documentación con campos pendientes y complétala durante el desarrollo.

Debemos poder explicar qué hizo la IA, qué validé yo y por qué acepté o rechacé cada propuesta relevante.

### 11. Documentación y entregables

El repositorio debe incluir:

- `README.md`: instalación, requisitos, configuración, comandos de ejecución y pruebas.
- `docs/arquitectura.md`: arquitectura, módulos, patrones, flujo de checkout y trade-offs.
- `docs/ia.md`: prompts, agentes y bitácora de co-creación.
- Código del frontend y backend.
- Pruebas unitarias y de integración.
- Configuración de cobertura.
- Archivo de configuración de variables de entorno de ejemplo, sin secretos.
- Historial de commits descriptivo e incremental.

El proyecto debe poder ejecutarse desde cero siguiendo las instrucciones del README.

### 12. Diseño de la interfaz

Construye una interfaz de checkout moderna, profesional y responsiva, con prioridad en la claridad funcional.

Debe mostrar:
- Catálogo de productos.
- Precio y categoría.
- Stock disponible.
- Carrito y cantidades.
- Subtotal original.
- Campo de cupón y botón para aplicarlo.
- Desglose de descuentos.
- Porcentaje de ahorro.
- Total definitivo.
- Indicador visual del límite del 35 %.
- Botón de confirmación.
- Estados de carga, éxito y error.

Para ello podemos utilizar skills actuales como : 
- taste-skill
- ui-ux-pro-max-skill

No sacrifiques consistencia funcional por efectos visuales. Evita componentes innecesarios, mensajes contradictorios o cálculos diferentes entre la vista previa y la confirmación.

### 13. Plan de trabajo

Trabaja por fases y valida cada una antes de continuar.

**Fase 1 — Análisis**
- Identificar ambigüedades.
- Definir las reglas matemáticas.
- Elegir el stack.
- Proponer la arquitectura.
- Identificar los principales riesgos.
- Definir los criterios de aceptación.

**Fase 2 — Diseño**
- Definir contratos.
- Diseñar los módulos.
- Definir los patrones.
- Establecer la estrategia de precisión monetaria.
- Diseñar los casos de prueba.

**Fase 3 — Backend**
- Implementar productos e inventario.
- Implementar las estrategias de descuento.
- Implementar el límite del 35 %.
- Implementar checkout y persistencia.
- Añadir pruebas.

**Fase 4 — Frontend**
- Implementar catálogo y carrito.
- Integrar los endpoints.
- Mostrar los descuentos y el total.
- Implementar alertas y manejo de errores.
- Añadir pruebas.

**Fase 5 — Auditoría**
- Ejecutar pruebas.
- Medir cobertura.
- Corregir defectos.
- Revisar seguridad, tipado y consistencia.
- Completar la documentación.
- Preparar los comandos para la demostración.

**Fase 6 — Sustentación**
- Preparar una demostración de siete minutos.
- Preparar la defensa arquitectónica de siete minutos.
- Preparar seis minutos de preguntas técnicas y auditoría de IA.

### 14. Forma de trabajo contigo

No generes todo el proyecto de una sola vez ni modifiques archivos sin explicar qué estás haciendo.

En cada fase:

1. Explica brevemente el objetivo.
2. Presenta la decisión técnica y su justificación.
3. Identifica los archivos que se crearán o modificarán.
4. Implementa un bloque coherente de trabajo.
5. Explica los puntos críticos del código.
6. Propón y ejecuta las pruebas disponibles.
7. Informa qué está verificado y qué continúa pendiente.
8. Espera mi validación cuando una decisión arquitectónica afecte al resto del proyecto.

Si tienes acceso al repositorio, inspecciona primero su estructura y reutiliza lo que sea válido. No sobrescribas archivos sin revisar su contenido.

No inventes resultados de comandos ni afirmes que ejecutaste pruebas si no tienes acceso a un entorno que permita ejecutarlas.

Si encuentras ambigüedades, identifica cuáles afectan al resultado y propón una decisión concreta antes de implementarlas.

### 15. Preparación para la defensa técnica

A medida que construyamos el sistema, prepara respuestas claras para preguntas como:

- ¿Por qué elegiste este stack?
- ¿Por qué el motor de descuentos está separado de la API?
- ¿Cómo garantizas el orden de aplicación de las reglas?
- ¿Por qué los descuentos no se suman directamente?
- ¿Cómo funciona el tope del 35 %?
- ¿Cómo evitas confiar en los precios del frontend?
- ¿Qué pasa si falla la persistencia después de validar el stock?
- ¿Cómo previenes ventas superiores al inventario?
- ¿Qué patrones de diseño implementaste realmente?
- ¿Cómo comprobaste la cobertura del 80 %?
- ¿Qué errores introdujo o propuso la IA?
- ¿Cómo verificaste que las correcciones fueran correctas?
- ¿Qué limitaciones tiene tu implementación?
- ¿Qué mejorarías si dispusieras de más tiempo?

Las respuestas deben corresponder al código real, no a una arquitectura ideal que no hayamos implementado.

### 16 Primera tarea: análisis previo

No escribas código todavía ni inicialices el proyecto.

Realiza un análisis del enunciado y entrega:

1. Los requisitos funcionales y no funcionales identificados.
2. Las ambigüedades o contradicciones que requieren aclaración.
3. Las alternativas de stack y la recomendación justificada.
4. Una propuesta de arquitectura y estructura de carpetas.
5. Las responsabilidades principales y las posibles abstracciones.
6. Una estrategia para calcular y probar los descuentos.
7. Los riesgos relacionados con inventario, persistencia, validación y consistencia de las órdenes.
8. Un plan incremental de implementación con criterios de aceptación por fase.
9. Una estrategia de pruebas que permita verificar el cumplimiento de los requisitos.

Separa claramente los requisitos del enunciado, tus recomendaciones y las decisiones que aún debe confirmar el desarrollador.

Espera mi revisión antes de implementar. Después de cada fase, indica qué cambió, qué pruebas ejecutaste, cuáles fueron sus resultados y qué permanece pendiente.