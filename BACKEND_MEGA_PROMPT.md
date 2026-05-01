# Mega Prompt Para Construir El Backend De GymOS

Copiá este prompt en la IA que vayas a usar para construir el backend.

---

Quiero que actúes como un **staff-level backend architect + senior TypeScript engineer** y construyas el backend de un SaaS llamado **GymOS**, un panel de administración para gimnasios. No quiero un backend con olor a prototipo o a vibecodeo evidente. Quiero una implementación con estructura profesional, decisiones justificadas, boundaries claros, código mantenible y buenas prácticas reales de producto SaaS.

## Contexto del producto

GymOS es un SaaS B2B para gimnasios. El producto no es una landing ni una app fitness consumer; es un sistema operativo de gestión para dueños, gerentes, recepcionistas e instructores.

El front ya existe y define los casos de uso base. El backend debe responder a estos dominios:

- autenticación de staff
- gestión de socios
- gestión de membresías y planes
- pagos y deuda operativa
- check-in de recepción
- agenda de clases
- reservas y lista de espera
- reportes de negocio
- comunicaciones a socios
- configuración de sucursales y staff
- auditoría y trazabilidad

## Base obligatoria

Tomá como fuente de verdad funcional estos archivos del proyecto:

- `gymos-admin-panel.html`
- `SPEC.md`
- `BACKEND_ARCHITECTURE.md`

Leelos antes de generar código. No inventes funcionalidades que contradigan esos documentos.

## Objetivo técnico

Construí un backend con esta estrategia:

- arquitectura `modular monolith`
- `TypeScript`
- `NestJS + Fastify`
- `PostgreSQL`
- `Redis`
- `BullMQ`
- `Drizzle ORM` con migraciones versionadas
- API REST versionada en `/api/v1`
- OpenAPI/Swagger

No uses microservicios. No uses una arquitectura distribuida prematura. El sistema debe quedar listo para escalar, pero sin sobreingeniería.

## Estándares arquitectónicos

Quiero que respetes estas reglas:

1. Organizar por módulos de dominio, no por tipo de archivo global.
2. Cada módulo debe tener capas `domain`, `application`, `infrastructure`, `presentation`.
3. Los controllers deben ser finos.
4. La lógica de negocio no puede vivir en controllers, DTOs ni repositories.
5. Los repositories acceden a datos, pero no toman decisiones de negocio.
6. Las transacciones deben vivir en casos de uso o application services.
7. Los side effects lentos van a jobs asincrónicos.
8. El sistema debe ser multi-tenant ready desde el día 1.
9. Toda entidad de negocio debe quedar scopeada por `tenant_id`.
10. Las acciones sensibles deben escribirse en `audit_logs`.

## Módulos que quiero

Quiero estos módulos mínimos:

- `iam`
- `tenants`
- `branches`
- `staff`
- `members`
- `memberships`
- `billing`
- `checkins`
- `scheduling`
- `communications`
- `reporting`
- `notifications`
- `audit`

## Flujos críticos del negocio

El backend tiene que modelar correctamente estos flujos:

### 1. Login de staff

- email + password
- JWT access token corto
- refresh token con rotación
- recuperación de contraseña

### 2. Alta y edición de socios

- datos personales
- documento
- email
- teléfono
- contacto de emergencia
- notas internas

### 3. Gestión de membresías

- crear membresía
- renovar membresía
- upgrade o downgrade
- congelar membresía
- detectar estados: `active`, `warning`, `expired`, `frozen`

### 4. Check-in

Este es el flujo más importante.

El endpoint de check-in debe:

- buscar socio por nombre, documento o teléfono
- validar elegibilidad de acceso
- devolver respuesta rápida
- registrar intento de check-in
- registrar check-in exitoso o denegado
- ser idempotente
- emitir eventos internos
- dejar side effects pesados fuera de la respuesta síncrona

### 5. Clases y reservas

- crear sesiones de clase
- asignar instructor
- validar cupo
- reservar lugar
- manejar waitlist
- promover al primero cuando se libera un lugar

### 6. Reportes

- dashboard con KPIs
- agregados diarios y mensuales
- no recalcular todo sobre tablas transaccionales en cada request

## Reglas de ingeniería

Quiero que el código parezca mantenido por un equipo serio. Por eso:

- usá nombres explícitos, no nombres vagos
- evitá archivos gigantes
- evitá funciones de más de 60-80 líneas salvo justificación real
- no uses helpers mágicos globales
- no mezcles lógica de negocio con infraestructura
- no dupliques reglas en varios módulos
- documentá decisiones complejas con comentarios breves
- mantené DTOs separados de entidades de dominio
- agregá validaciones reales de input
- agregá constraints reales a nivel DB
- agregá índices relevantes
- modelá errores de negocio con clases o códigos claros

## Reglas anti-vibecode

Quiero que evites patrones típicos de código generado sin criterio:

- no crear servicios god-object tipo `AppService` o `GymService`
- no meter todos los casos de uso en un solo módulo
- no usar controladores obesos con mucha lógica inline
- no hacer copy-paste de validaciones
- no hacer `any`
- no usar nombres genéricos tipo `data`, `item`, `temp`, `managerService2`
- no escribir respuestas inconsistentes entre endpoints
- no dejar TODOs vacíos como parte central de la implementación
- no dejar mocks hardcodeados si el objetivo es producción

## Calidad y operabilidad

Quiero que el proyecto salga con:

- `.env.example`
- configuración por ambiente
- logger estructurado
- `request_id`
- healthcheck
- manejo consistente de errores
- rate limiting en auth
- tests unitarios en reglas críticas
- tests de integración en repositorios o casos de uso críticos
- tests e2e para login, membresía y check-in

## Multi-tenancy

Diseñá el sistema como SaaS B2B multi-tenant.

Reglas:

- cada gimnasio cliente es un tenant
- cada tenant puede tener múltiples sucursales
- cada request autenticado debe resolver `tenant_id`
- nunca mezclar datos entre tenants
- agregar índices por `tenant_id`
- cuando aplique, también usar `branch_id`

## Tablas mínimas esperadas

Esperá modelar algo cercano a esto:

- `tenants`
- `branches`
- `users`
- `roles`
- `permissions`
- `staff_profiles`
- `members`
- `plans`
- `memberships`
- `membership_changes`
- `membership_freezes`
- `invoices`
- `invoice_items`
- `payments`
- `checkin_attempts`
- `checkins`
- `class_sessions`
- `reservations`
- `reservation_waitlist`
- `campaigns`
- `audit_logs`

## Entregables que quiero de vos

Quiero que trabajes en este orden:

1. Leer y resumir el dominio del producto según los archivos.
2. Proponer la estructura de carpetas exacta del backend.
3. Definir el modelo de datos principal.
4. Crear el bootstrap del proyecto.
5. Implementar primero los módulos `iam`, `members`, `memberships` y `checkins`.
6. Exponer endpoints REST bien diseñados.
7. Crear migraciones.
8. Agregar seeds mínimos para desarrollo.
9. Escribir tests de los flujos críticos.
10. Explicar brevemente las decisiones tomadas.

## Forma de trabajar

No me des solo teoría. Quiero implementación real.

Si hay una decisión con tradeoff, elegí la opción más razonable para un SaaS serio mantenido por un equipo pequeño o mediano.

Si una parte conviene dejar preparada pero no completa, dejala bien diseñada y explícitamente marcada como extensión futura, nunca como parche improvisado.

## Criterio de calidad

Las decisiones deben reflejar estas ideas:

- claridad operativa
- coherencia de dominio
- buen modelado de datos
- escalabilidad razonable
- observabilidad
- mantenibilidad
- seguridad
- velocidad en flujos críticos

## Referencia de criterio

Tomá como inspiración de ingeniería:

- SaaS multi-tenant bien diseñado
- Well-Architected SaaS thinking
- operational excellence
- twelve-factor app

Pero aterrizalo al producto GymOS, no me des arquitectura genérica copiada.

## Formato de respuesta que quiero

Cuando empieces:

1. resumí el dominio detectado
2. mostrame la arquitectura propuesta
3. listá la estructura de carpetas
4. después empezá a generar el código

Si tenés que asumir algo, hacé la asunción más razonable y seguí.

Tu prioridad no es “hacerlo rápido”, sino hacerlo con criterio profesional.

---

## Versión corta para usar como prompt de continuación

Seguimos con el backend de GymOS. Mantené la arquitectura modular monolith en TypeScript con NestJS, Postgres, Redis, BullMQ y Drizzle. Respetá el documento `BACKEND_ARCHITECTURE.md`, no rompas boundaries de dominio, no metas lógica en controllers, y priorizá calidad real de código, multi-tenancy, auditabilidad, observabilidad y tests en los flujos de `auth`, `memberships` y `checkins`.
