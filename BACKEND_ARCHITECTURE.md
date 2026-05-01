# GymOS Backend Architecture

## 1. Lectura del producto a partir del front

Tomando como base [gymos-admin-panel.html](/C:/Users/Gime/Desktop/gymBro/gymos-admin-panel.html) y [SPEC.md](/C:/Users/Gime/Desktop/gymBro/SPEC.md), GymOS no es un simple CRUD de socios. El backend tiene que soportar un SaaS operativo para gimnasios con foco fuerte en:

- autenticacion de staff
- multi-sucursal
- roles y permisos
- socios y perfiles completos
- membresias, renovaciones, upgrades y congelamientos
- pagos, deuda y facturacion operativa
- check-in de recepcion con respuesta en tiempo real
- agenda de clases, cupos, reservas y lista de espera
- comunicaciones segmentadas
- reportes con KPIs y agregaciones historicas
- auditoria de acciones sensibles

El flujo mas critico del sistema es `check-in`, y el segundo flujo mas sensible es `membresias + pagos + renovaciones`.

## 2. Decisiones de arquitectura

### Recomendacion principal

Arrancar con un **modular monolith** en TypeScript, no con microservicios.

Esto es lo mas profesional para esta etapa porque:

- reduce complejidad operacional
- permite boundaries claros por dominio
- mantiene una sola fuente de verdad transaccional
- acelera iteracion sin perder calidad
- deja preparada una futura extraccion de servicios si el producto escala

### Estilo arquitectonico

Combinar:

- `Modular Monolith`
- `Clean Architecture` por modulo
- `DDD tactico liviano`
- `Event-driven internally` para side effects

No conviene hacer hexagonal ultra academica ni microservicios prematuros. Conviene una arquitectura que un equipo chico o mediano pueda mantener bien.

## 3. Stack sugerido

### Backend

- `TypeScript`
- `NestJS` con `Fastify`
- `PostgreSQL`
- `Redis`
- `BullMQ` para jobs
- `Drizzle ORM` con migraciones SQL versionadas
- `Zod` para validaciones compartidas o `class-validator` si queres seguir 100% Nest
- `OpenAPI / Swagger`

### Infra y operacion

- `Docker`
- `Docker Compose` para local
- `S3-compatible storage` para logos, avatares y adjuntos
- `Sentry` para errores
- `OpenTelemetry` para trazas
- `Prometheus + Grafana` o equivalente para metricas

### Testing

- `Vitest` o `Jest`
- tests unitarios
- tests de integracion por modulo
- tests e2e para flujos criticos

## 4. Principios que deben gobernar el backend

1. El sistema debe ser **multi-tenant ready** desde el dia 1.
2. La logica de negocio no vive en controllers.
3. Ningun modulo puede leer tablas ajenas salteando contratos internos.
4. Toda accion sensible debe dejar rastro auditable.
5. Los flujos operativos deben ser idempotentes.
6. Los reportes no deben romper las tablas transaccionales.
7. El check-in debe estar optimizado para latencia baja.
8. Los side effects lentos deben ir a jobs asincronicos.
9. El dominio manda; el framework no organiza la logica por nosotros.
10. El sistema debe degradar bien ante errores parciales.

## 5. Modelo SaaS recomendado

### Tenancy

Usar un modelo `pooled` con aislamiento por `tenant_id`, preparado para evolucionar a `mixed`.

Cada gimnasio cliente del SaaS es un `tenant`.

Dentro de cada tenant existen:

- `branches` o sucursales
- `staff_users`
- `members`
- `plans`
- `memberships`
- `classes`
- `reservations`
- `payments`

### Aislamiento

Todas las tablas de negocio deben tener:

- `id`
- `tenant_id`
- `created_at`
- `updated_at`
- `created_by` cuando aplique

Y cuando corresponda tambien:

- `branch_id`
- `deleted_at` para soft delete selectivo
- `version` para optimistic locking en registros sensibles

## 6. Modulos del backend

### 6.1 IAM

Responsabilidad:

- login
- refresh tokens
- recovery password
- sesiones
- invitaciones a staff
- politicas de acceso

Entidades:

- `users`
- `roles`
- `permissions`
- `user_roles`
- `sessions`
- `password_reset_tokens`

### 6.2 Tenants y sucursales

Responsabilidad:

- alta de tenant
- configuracion general del gimnasio
- sucursales
- horarios
- branding

Entidades:

- `tenants`
- `branches`
- `business_hours`
- `holiday_overrides`
- `tenant_settings`

### 6.3 Staff

Responsabilidad:

- gestion de empleados
- invitaciones
- estados
- asignacion a sucursal

Entidades:

- `staff_profiles`
- `staff_branch_assignments`

### 6.4 Members

Responsabilidad:

- alta y edicion de socios
- datos personales
- emergencia
- tags o segmentos
- estado operativo del socio

Entidades:

- `members`
- `member_contacts`
- `member_emergency_contacts`
- `member_notes`
- `member_tags`

### 6.5 Memberships

Responsabilidad:

- planes
- asignacion de membresias
- renovaciones
- upgrades
- downgrades
- congelamientos
- vencimientos

Entidades:

- `plans`
- `plan_features`
- `memberships`
- `membership_changes`
- `membership_freezes`

### 6.6 Billing

Responsabilidad:

- cargos
- pagos
- deuda
- comprobantes
- estado financiero del socio

Entidades:

- `invoices`
- `invoice_items`
- `payments`
- `payment_methods`
- `refunds`
- `account_balances`

### 6.7 Check-ins

Responsabilidad:

- validacion de acceso
- registro de ingreso
- denegaciones
- visitantes del dia
- feed operativo

Entidades:

- `checkins`
- `checkin_attempts`
- `visitor_passes`
- `access_policies`

### 6.8 Scheduling

Responsabilidad:

- agenda semanal
- clases
- instructores
- cupos
- reservas
- cancelaciones
- waitlist

Entidades:

- `class_templates`
- `class_sessions`
- `class_instructors`
- `reservations`
- `reservation_waitlist`
- `rooms`

### 6.9 Communications

Responsabilidad:

- plantillas
- campañas
- segmentacion
- envios inmediatos y programados

Entidades:

- `message_templates`
- `campaigns`
- `campaign_recipients`
- `scheduled_messages`

### 6.10 Reporting

Responsabilidad:

- KPIs del dashboard
- reportes operativos
- agregaciones por periodo
- exports

Entidades:

- `daily_metrics`
- `monthly_metrics`
- `report_snapshots`

### 6.11 Notifications

Responsabilidad:

- vencimientos
- deuda
- cumpleaños
- resumen semanal
- alertas internas

Entidades:

- `notification_rules`
- `notification_deliveries`
- `in_app_notifications`

### 6.12 Audit

Responsabilidad:

- trazabilidad completa
- acciones administrativas
- cambios de plan
- anulaciones
- accesos

Entidades:

- `audit_logs`
- `domain_events`

## 7. Boundaries de dominio

### Regla clave

Los modulos se hablan por `application services` y `domain events`, no por queries improvisadas a cualquier tabla.

### Ejemplos

- `CheckIns` puede consultar una vista de elegibilidad de membresia, pero no reimplementar reglas de membresias.
- `Billing` decide si una factura esta paga o pendiente.
- `Memberships` decide si una membresia esta activa, vencida, por vencer o congelada.
- `Reporting` consume eventos o tablas agregadas, no mete logica en vivo sobre todo el dominio cada vez.

## 8. Flujos criticos y como resolverlos

### Check-in

Secuencia recomendada:

1. Recepcion busca socio por nombre, documento o telefono.
2. Backend consulta `member summary` optimizado.
3. `CheckInService` pide a `MembershipEligibilityService` el estado del acceso.
4. Se crea `checkin_attempt`.
5. Si corresponde, se crea `checkin`.
6. Se emite evento `member.checked_in`.
7. Jobs secundarios actualizan feed, metricas y notificaciones.

Reglas:

- endpoint idempotente con `Idempotency-Key`
- respuesta sincronica chica y rapida
- side effects en background

### Alta o renovacion de membresia

Secuencia:

1. validar socio y tenant
2. validar plan y branch scope
3. detectar membresia activa previa
4. abrir transaccion
5. cerrar, renovar o mutar membresia existente segun regla
6. generar invoice o payment intent
7. guardar `membership_change`
8. emitir evento `membership.changed`

### Reserva de clase y waitlist

Secuencia:

1. validar elegibilidad del socio
2. lock transaccional sobre sesion de clase
3. si hay cupo, confirmar reserva
4. si no hay cupo, agregar a waitlist con posicion
5. al liberarse un lugar, job o accion manual promueve al primero

## 9. Esquema de datos de alto nivel

### Tablas base obligatorias

- `tenants`
- `branches`
- `users`
- `roles`
- `permissions`
- `members`
- `plans`
- `memberships`
- `membership_changes`
- `invoices`
- `payments`
- `class_sessions`
- `reservations`
- `reservation_waitlist`
- `checkins`
- `checkin_attempts`
- `campaigns`
- `audit_logs`

### Convenciones

- PK: `uuid`
- FK explicitas
- indices por `tenant_id`
- indices compuestos por `tenant_id + branch_id`
- indices funcionales para busqueda de socio
- constraints fuertes en base de datos

### Indices importantes

- `members(tenant_id, normalized_full_name)`
- `members(tenant_id, document_number)`
- `members(tenant_id, phone_normalized)`
- `memberships(tenant_id, member_id, status)`
- `checkins(tenant_id, branch_id, created_at desc)`
- `class_sessions(tenant_id, branch_id, starts_at)`
- `reservations(class_session_id, status)`

## 10. Lecturas y proyecciones para dashboard

No calcular el dashboard pesado en tiempo real cada vez.

Usar:

- tablas agregadas diarias
- jobs nocturnos o near-real-time
- vistas materializadas si hacen falta

Separar:

- `OLTP`: transaccional
- `read models`: dashboard, reportes, feeds

## 11. API design

### Estilo

- REST primero
- endpoints versionados `/api/v1`
- contratos estables
- payloads chicos y orientados a casos de uso

### Ejemplos de recursos

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/members`
- `GET /api/v1/members/:id`
- `POST /api/v1/members`
- `POST /api/v1/members/:id/checkins`
- `POST /api/v1/memberships`
- `POST /api/v1/memberships/:id/renew`
- `GET /api/v1/class-sessions`
- `POST /api/v1/class-sessions/:id/reservations`
- `POST /api/v1/class-sessions/:id/waitlist/:waitlistId/promote`
- `GET /api/v1/reports/dashboard`

### Contratos

- DTOs separados de entidades
- errores normalizados
- paginacion cursor-based en listas grandes
- filtros explicitos
- sorting whitelist

## 12. Seguridad

### Obligatorio

- hash de passwords con `argon2`
- JWT corto + refresh token rotado
- RBAC real, no checks dispersos
- tenant scoping centralizado
- rate limiting para auth y check-in search
- audit logs en acciones sensibles
- validacion estricta de input
- sanitizacion de exports

### Recomendado

- permisos por modulo y accion
- `request context` con `tenant_id`, `user_id`, `branch_scope`
- policy guards reutilizables

## 13. Observabilidad

### Logs estructurados

Todo log debe incluir:

- `request_id`
- `tenant_id`
- `user_id` si existe
- `branch_id` si existe
- `module`
- `action`

### Metricas clave

- latencia de login
- latencia de search member
- latencia de check-in
- errores por endpoint
- reservas confirmadas vs waitlist
- pagos fallidos
- jobs demorados

### Trazas

Especialmente para:

- auth
- memberships
- billing
- check-ins
- report jobs

## 14. Estrategia de jobs y eventos

Usar eventos de dominio internos:

- `member.created`
- `member.updated`
- `membership.created`
- `membership.changed`
- `payment.registered`
- `member.checked_in`
- `reservation.created`
- `waitlist.promoted`

Usar cola para:

- emails
- reminders
- recomputo de metricas
- exports
- conciliaciones
- syncs externos

## 15. Calidad de codigo

### Estructura por modulo

Cada modulo debe tener algo parecido a:

- `domain`
- `application`
- `infrastructure`
- `presentation`

### Reglas

- controllers finos
- services chicos y orientados a caso de uso
- repositories sin logica de negocio
- nada de helpers globales con logica escondida
- nada de funciones de 300 lineas
- naming consistente y ubicuo
- transacciones encapsuladas en casos de uso

## 16. Testing strategy

### Unit tests

Para:

- elegibilidad de membresia
- transiciones de estado
- pricing y renovaciones
- waitlist promotion

### Integration tests

Para:

- repositorios
- transacciones
- queries complejas
- permisos por tenant

### E2E

Minimo estos flujos:

- login staff
- crear socio
- crear/renovar membresia
- check-in activo
- check-in vencido
- reserva con cupo
- promotion de waitlist

## 17. Roadmap tecnico recomendado

### Fase 1

- auth
- tenants
- branches
- members
- memberships
- check-ins
- dashboard basico

### Fase 2

- billing
- class sessions
- reservations
- waitlist
- notifications

### Fase 3

- communications
- advanced reporting
- exports
- auditoria extendida

## 18. Lo que haria una empresa seria y lo que no

### Haria

- modular monolith con limites claros
- contratos y naming consistentes
- migraciones versionadas
- observabilidad desde el inicio
- auditoria en operaciones sensibles
- testing fuerte en flujos de negocio
- jobs para side effects
- read models para reportes

### No haria

- microservicios por moda
- meter toda la logica en controllers
- usar la base como “basurero” sin constraints
- mezclar auth, billing y memberships en un mismo service
- recalcular KPIs pesados a cada request
- esconder reglas de negocio en triggers oscuros

## 19. Fuentes de criterio usadas

Las decisiones de este documento se apoyan en:

- el producto definido en [gymos-admin-panel.html](/C:/Users/Gime/Desktop/gymBro/gymos-admin-panel.html)
- el detalle funcional de [SPEC.md](/C:/Users/Gime/Desktop/gymBro/SPEC.md)
- AWS Well-Architected SaaS Lens: [docs.aws.amazon.com](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html)
- Google Cloud Well-Architected Operational Excellence: [docs.cloud.google.com](https://docs.cloud.google.com/architecture/framework/operational-excellence)
- Twelve-Factor App: [12factor.net](https://www.12factor.net/)

## 20. Conclusion

La arquitectura correcta para GymOS hoy no es una red de microservicios. Es un backend de `modular monolith`, multi-tenant ready, con boundaries de dominio fuertes, eventos internos, jobs asincronicos, buena observabilidad y una base relacional muy bien modelada.

Eso te da algo mucho mas profesional: un sistema que se siente diseñado, no solo generado.
