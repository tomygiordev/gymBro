# SPEC — GymOS: Panel de Administración de Gimnasio

## 1. Principios de Diseño y Experiencia

### Principios rectores

1. **Claridad operativa primero.** Cada pantalla está diseñada para que el staff tome decisiones en ≤3 segundos. La densidad informativa es alta, pero nunca saturada. Cada elemento tiene un propósito y una jerarquía inequívoca.

2. **Feedback inmediato en toda acción.** Cada click, cada ingreso de dato, cada confirmación devuelve respuesta visual instantánea. El personal de recepción no tiene tiempo de adivinar qué pasó.

3. **Dental del check-in como flujo rey.** La pantalla de recepción es el centro gravitacional del día a día. Todo acceso, búsqueda y confirmación está optimizado para operación con una mano, pantalla de fijo, sin fricción.

4. **Estética de confianza corporativa.** El diseño transmite profesionalismo y solidez — no es un app consumer fitness con colores vibrantes de gym-bro. Es el panel que usa un gerente para gestionar su negocio con seriedad.

5. **Consistencia rigurosa.** Un solo sistema de tokens define colores, espaciado, tipografía y componentes. Nada de decisiones in-situ. Si el token no existe, no se construye.

---

### Tono y personalidad

- **Profesional y confiable** — como un software bancario, pero con la energía justa del fitness.
- **Claro y denso** — información al frente, sin esconderse detrás de modales profundos.
- **Energético pero no ruidoso** — azul Airtable como base, con acentos de verde/rojo para estados semánticos. Sin gradientes llamativos ni decoración superflua.
- **Orientado a acción** — cada pantalla tiene un objetivo único y acciones claras. No hay duda sobre qué hacer a continuación.

### Diferenciación frente a competidores

La mayoría de gestores de gimnasio (Mindbody, GymPass Admin, Personica) pecan de:
- Interfaz cluttered con tabs infinitos
- Flujo de check-in que requiere 4+ clicks
- Dashboard genérico sin personalidad operativa
- Estados de error genéricos y poco informativos

**GymOS se diferencia por:**
- Check-in en 2 clicks desde la pantalla de recepción
- Dashboard con alertas accionables (no solo métricas pasivas)
- Perfil de socio con toda la info en un solo glance — sin navegación profunda
- Filtros persistentes en tablas que sobreviven la sesión
- Lista de espera con posición visible y promoción con un solo click

---

## 2. Sistema de Diseño (Ligero)

### Paleta de colores

```
/* Base — Airtable-inspired */
--color-bg:           #FFFFFF
--color-surface:      #F8FAFC
--color-border:       #E0E2E6
--color-text-primary: #181D26
--color-text-secondary: #333333
--color-text-muted:   rgba(4,14,32,0.69)
--color-accent:       #1B61C9      /* Airtable Blue — CTAs, links, acciones principales */
--color-accent-hover: #254FAD
--color-accent-light: rgba(27,97,201,0.08)

/* Estados semánticos */
--color-success:      #006400      /* Verde — membresía activa, check-in exitoso */
--color-success-bg:   #F0FDF4
--color-warning:      #B45309      /* Ámbar — membresía por vencer */
--color-warning-bg:   #FFFBEB
--color-danger:       #DC2626      /* Rojo — deuda, membresía vencida, error */
--color-danger-bg:    #FEF2F2
--color-info:         #1B61C9      /* Azul — información, badges informativos */
--color-frozen:       #7C3AED      /* Púrpura — membresía congelada */
--color-frozen-bg:    #F5F3FF

/* Sombras */
--shadow-sm:    0px 1px 2px rgba(0,0,0,0.05)
--shadow-md:    0px 0px 1px rgba(0,0,0,0.32), 0px 0px 2px rgba(0,0,0,0.08), 0px 1px 3px rgba(45,127,249,0.28), 0px 0px 0px 0.5px inset
--shadow-lg:    0px 4px 12px rgba(0,0,0,0.10), 0px 0px 0px 0.5px rgba(0,0,0,0.05) inset
```

### Tipografía

**Familia:** Haas (display + text). Fallback: `-apple-system, system-ui, Segoe UI, Roboto`

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display Hero | 48px | 400 | 1.15 | normal |
| Section Heading | 32px | 500 | 1.20 | normal |
| Card Title | 20px | 500 | 1.20 | 0.1px |
| Body | 15px | 400 | 1.40 | 0.15px |
| Body Medium | 14px | 500 | 1.30 | 0.08px |
| Button | 14px | 500 | 1.25 | 0.08px |
| Caption / Label | 12px | 400 | 1.25 | 0.2px |
| Table Header | 12px | 600 | 1.0 | 0.4px (uppercase) |
| KPI Number | 36px | 700 | 1.0 | -0.02em |

### Escala de espaciado y grilla

- **Base unit:** 4px
- **Grilla:** 12 columnas, gutter 24px, max-width 1440px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Border radius:** 2px (inputs/small), 8px (buttons), 12px (cards), 16px (modals), 24px (sections grandes)
- **Side panel width:** 420px
- **Tabla row height:** 48px
- **Sidebar navigation width:** 240px (collapsed: 64px)

### Iconografía

- **Librería:** Lucide Icons (outline, 24px, stroke-width 1.5)
- **Alternativa:** Heroicons (outline)
- **Nunca:** Font Awesome classic ni emojis como iconos

### Estados de componentes

| Estado | Descripción visual |
|--------|---------------------|
| Default | Estilo base sin modificaciones |
| Hover | Color ligeramente más oscuro (+8% darkness), cursor pointer |
| Focus | Outline azul 2px offset 2px (no default blue browser) |
| Active/Pressed | Background oscurece, scale(0.98) en botones |
| Disabled | Opacity 40%, cursor not-allowed |
| Loading | Spinner inline (16px) + texto "Cargando…" + disabled |
| Empty | Ilustración minimal + mensaje + CTA |
| Error | Border rojo, mensaje de error debajo en rojo, icono warning |

---

## 3. Panel Web de Administración — Pantallas Principales

### 3.1 Login / Recuperación de contraseña

**Propósito:** Autenticación segura del staff. Acceso rápido con credenciales remembered.

**Layout:**
- Pantalla centrada, 100vh, fondo `--color-surface`
- Card blanca (480px max-width) con logo, título, form y footer link
- A la derecha (desktop): ilustración sutil relacionada con fitness/gestión

**Componentes:**
- Logo del gimnasio arriba del form
- Input email con label flotante
- Input password con toggle show/hide
- Checkbox "Recordarme en este dispositivo"
- Botón primario "Iniciar sesión" (full width)
- Link "Olvidé mi contraseña" → abre modal de recuperación
- Mensaje de error de autenticación inline

**Recuperación de contraseña (modal):**
- Input email
- Botón "Enviar enlace"
- Feedback: "Enlace enviado a tu email" con checkmark
- Tiempo de espera 60s antes de reenviar

**Estados:**
- Error: credenciales inválidas → mensaje rojo debajo del form
- Loading: botón muestra spinner, inputs deshabilitados
- Éxito: redirect a Dashboard con toast "Bienvenido de vuelta"

---

### 3.2 Dashboard del dueño o gerente

**Propósito:** Vista ejecutivos del negocio con KPIs en tiempo real y alertas accionables.

**Layout:**
- Sidebar izquierda 240px + contenido principal
- Header con greeting dinámico ("Buenos días, María") + avatar + notifications bell
- Área principal: grilla de 4 columnas de KPI cards + sección de gráficos + alertas

**KPIs (4 cards en grilla 2×2):**
1. **Ingresos del mes** — número grande (36px), comparación % vs mes anterior, sparkline de tendencia
2. **Socios activos** — número grande, badge con estado (creciendo/estable/bajando)
3. **Retención mensual** — porcentaje con mini gauge visual
4. **Ocupación promedio** — % con barra de progreso visual

**Gráficos rápidos (2 columnas):**
- **Tendencia de check-ins** — área chart, últimos 7 días, un color fill
- **Ingresos semanales** — bar chart, últimas 8 semanas, color accent

**Alertas y acciones rápidas (columna derecha o panel inferior):**
- Card "Socios con deuda" — lista de hasta 5, cada uno con nombre + monto + botón "Contactar"
- Card "Cumpleaños hoy" — nombre + foto avatar + mensaje pre-redactado
- Card "Próximas renovaciones" — 3 días antes, nombre + plan + botón "Renovar"
- Card "Clases más посещенные" — top 3 con contador

**Actividad diaria (timeline simplificado):**
- Header de día: "Lunes, 15 de enero"
- Lista cronológica: check-ins + clases iniciadas + vencimientos
- Cada item: hora + tipo de evento + nombre + estado

**Interacciones:**
- Click en KPI card → drilldown al reporte correspondiente
- Click en alerta → abre panel lateral con contexto completo
- Todas las cards con hover: elevación sutil (shadow-md)

---

### 3.3 Listado de socios

**Propósito:** Gestión completa de la base de socios con búsqueda, filtros y vista rápida.

**Layout:**
- Header con título de sección + contador de resultados ("247 socios")
- Barra de búsqueda prominente (autofocus, placeholder "Buscar por nombre, email o teléfono…")
- Filtros activos como chips dismissibles
- Botones de acción: "Nuevo socio" (primario), "Exportar" (secundario), "Acciones en lote" (fantasma)
- Tabla principal ocupa 70% del ancho, panel lateral 30%

**Tabla avanzada:**
| Columna | Ancho | Ordenable | Notas |
|---------|-------|-----------|-------|
| Checkbox | 40px | No | Selección múltiple |
| Avatar+Nombre | 200px | Sí | Nombre + primer apellido |
| Documento | 120px | Sí | DNI / Pasaporte |
| Plan | 140px | Sí | Badge de color según estado |
| Estado | 100px | Sí | Badge: Activa / Por vencer / Vencida / Congelada |
| Última visita | 120px | Sí | Fecha relativa ("Hace 2 días") |
| Acciones | 80px | No | Menú ⋮ con opciones |

- Hover en fila: highlight sutil, aparece botón de "Ver perfil"
- Filas seleccionadas: background accent-light
- Filtros: dropdowns para Plan, Estado, Sucursal + rango de fechas de registro

**Filtros dinámicos:**
- Dropdown "Plan": Todos, Básico, Premium, VIP, Corporativo
- Dropdown "Estado": Todos, Activa, Por vencer (7 días), Vencida, Congelada
- Dropdown "Sucursal": Todas / Nombre de sucursal
- Date picker: "Registrado entre…"
- Filtros aplicados aparecen como chips debajo de la barra: "Plan: Premium ×", "Estado: Activa ×"

**Panel lateral (Quick View):**
- Encabezado: avatar grande (64px) + nombre + estado badge
- Info clave: teléfono, email, plan actual, fecha de vencimiento
- Barra de progreso: asistencia este mes
- Botones rápidos: "Check-in", "Ver perfil completo", "Renovar"
- Lista de últimas 3 visitas con fecha y clase

**Perfil completo del socio (al hacer click en "Ver perfil completo"):**
Se abre un **modal grande** (90vw × 90vh) o un **side panel** de 480px con tabs:

**Tabs:**
1. **Información personal**
   - Foto, nombre completo, documento, fecha de nacimiento, teléfono, email, dirección, contacto de emergencia
   - Botón "Editar"

2. **Membresía**
   - Plan actual con detalles: nombre, precio, fecha de inicio/fin
   - Historial de cambios de plan (timeline vertical)
   - botón "Cambiar plan"

3. **Facturación**
   - Historial de pagos: fecha, monto, método, estado (pagado/pendiente/rechazado)
   - Factura pendiente destacada
   - botón "Registrar pago"

4. **Asistencia**
   - Calendario de check-ins del mes (mini grid)
   - Estadísticas: total visitas mes, racha actual, clase más visitada
   - Filtro por período

5. **Rutinas** *(futuro — tab deshabilitado con nota)*
   - Placeholder: "Próximamente"

---

### 3.4 Gestión de membresías y planes

**Propósito:** Administrar los planes disponibles y asignarlos a socios.

#### Pantalla de Planes (Grid de Cards Comparativas)

**Layout:** Título + contador + botón "Nuevo plan" + grid de cards (3-4 columnas)

**Card de plan:**
- Header: nombre del plan + badge de popularidad ("Más popular")
- Precio grande (36px): $XX.XXX/mes
- Lista de beneficios con checkmarks (5-7 items)
- Número de socios activos con este plan
- Botones: "Editar" (fantasma) + "Ver socios" (fantasma)
- Hover: elevación + borde accent

**Planes ejemplo:**
- **Básico** — $29.900/mes — Acceso general, 1 sucursal, sin clases grupales
- **Premium** — $49.900/mes — Acceso total, todas las sucursales, 4 clases grupales/mes *(badge: Popular)*
- **VIP** — $79.900/mes — Acceso total + clases ilimitadas + 1 sesión PT/mes

#### Alta / Edición de membresía (Formulario paso a paso)

**Wizard de 3 pasos + resumen:**

**Paso 1 — Seleccionar socio:**
- Campo de búsqueda con autocompletado
- Muestra nombre + foto + estado actual de membresía
- Validación: socio no puede ser vacío

**Paso 2 — Elegir / configurar plan:**
- Cards de plan radio-seleccionables
- Campos adicionales: fecha de inicio (date picker, default: hoy), duración (1 mes / 3 meses / 6 meses / 1 año), método de pago
- Precio calculado en tiempo real

**Paso 3 — Resumen y confirmación:**
- Card de resumen: socio, plan, precio, duración, fecha de inicio, fecha de fin
- Total a pagar destacado
- Método de pago seleccionado
- Campo opcional: notas internas
- Checkbox: "Enviar confirmación por email al socio"

**Validación en tiempo real:**
- Campos vacíos: borde rojo + mensaje "Este campo es obligatorio"
- Email inválido: mensaje específico
- Socio ya tiene membresía activa: warning con opción de "Renovar en vez de crear"
- Precio = 0 sin descuento aplicado: warning

**Historial visual de cambios:**
- Timeline vertical en el perfil del socio
- Cada nodo: fecha + tipo de cambio (alta / renovación / downgrade / upgrade / cancelación) + plan anterior → plan nuevo
- Color coding: verde = alta/renovación, amarillo = cambio, rojo = cancelación

---

### 3.5 Agenda y grilla de clases

**Propósito:** Visualizar y administrar la schedule de clases día/semana.

**Layout:**
- Header: selector de fecha (flechas + fecha actual) + botón "Hoy" + toggle día/semana
- Sidebar izquierda (240px): lista de instructors con avatar + nombre
- Área principal: grilla horaria (6:00 a 22:00, grid de 30min)

**Grilla semanal:**
- Columnas = días (Mon–Sun), filas = horas (6:00–22:00)
- Cada clase = bloque de color con:
  - Nombre de clase (bold)
  - Horario (9:00 – 10:00)
  - Instructor (nombre)
  - Cupo: "12/15" con barra de progreso
  - Color por tipo de clase (Spinning=verde, Yoga=naranja, HIIT=rojo, etc.)

**Panel lateral para crear/editar clase (side panel 420px):**
- Título: "Nueva clase" o "Editar: Spinning 9:00"
- Select: tipo de clase
- Time picker: hora inicio + hora fin
- Select: instructor (dropdown con foto)
- Select: sala / ubicación
- Input numérico: cupo máximo
- Toggle: "Lista de espera activa"
- Toggle: "Confirmación automática desde lista de espera"
- Botones: "Cancelar" + "Guardar clase"

**Lista de espera:**
- Dentro del panel de clase, sección colapsable "Lista de espera"
- Cada socio: nombre + posición (#1, #2…) + botón "Confirmar" / "Quitar"
- Si se confirma, pregunta "¿Mover automáticamente al socio al confirmar?"
- Spoiler visual: "3 personas en lista" con expand/collapse

---

### 3.6 Control de acceso y check-in manual

**Propósito:** Flujo principal del día a día. Check-in rápido en 2 clicks desde la recepción.

**Layout:**
- Pantalla completa sin sidebar — solo header mínimo
- Dos zonas: zona de búsqueda/input (arriba, prominente) + feed de actividad (abajo)

**Zona de búsqueda (hero de la pantalla):**
- Input grande con ícono de búsqueda (placeholder: "Buscar socio o escanear código…")
- Below: 4 botones de acceso rápido: "Spinning 8:00", "Yoga 9:00", "Musculación", " libre"
- Esto permite check-in directo sin buscar nombre

**Resultado de búsqueda (aparece debajo del input):**
- Dropdown con hasta 5 resultados
- Cada resultado: avatar + nombre + plan badge + estado de membresía
- Hover o keyboard navigation
- Enter o click para confirmar

**Confirmación de check-in (overlay modal centrado, 480px):**
Aparece al confirmar:

- **Éxito (membresía activa):**
  - Animación de checkmark (scale in + fade)
  - Fondo verde-claro
  - Avatar grande + nombre + "Bienvenido/a"
  - Plan: Premium — vence el 28/feb/2026
  - Hora de check-in: 8:47
  - Botón: "Cerrar" (autocierre en 3s)

- **Warning (membresía por vencer — 7 días o menos):**
  - Mismo layout pero fondo amarillo-claro
  - Mensaje: "La membresía de [Nombre] vence en 3 días"
  - Botones: "Permitir ingreso" + "Ver detalles"

- **Error (membresía vencida o bloqueada):**
  - Fondo rojo-claro
  - Avatar + nombre + "Membresía vencida desde el 15/dic/2025"
  - Botón: "Ver opciones de renovación"

- **Error (socio no encontrado):**
  - Mensaje: "No se encontró ningún socio con ese documento"
  - Botón: "Registrar visitante del día" (abre form rápido)

**Feed cronológico de accesos (scrollable, debajo de la zona de búsqueda):**
- Header: "Actividad de hoy — 47 ingresos hasta ahora"
- Lista de items: hora + nombre + tipo de clase/acceso + estado (✓ check-in, ⚠ warning, ✕ denegado)
- Nuevos items aparecen arriba con animación fade-in
- Cada item es clickeable → abre perfil del socio
- Filtros superiores: "Todos" / "Check-ins" / "Warnings" / "Denegados"

---

### 3.7 Reportes

**Propósito:** Analítica y exportación de datos para toma de decisiones.

**Layout:**
- Header con título + selector de período global (date range picker)
- Sidebar izquierda con navegación de reportes
- Área principal con filtros persistentes + contenido

**Navegación de reportes (sidebar):**
- Overview (dashboard resumido)
- Ingresos
- Asistencia y visitas
- Membresías (altas, renovaciones, cancelaciones)
- Retención y churn
- Instructor performance
- Comparativas

**Reporte: Overview:**
- 4 KPI cards grandes: Ingresos, Nuevos socios, Tasa de retención, Visitas promedio
- Gráfico de línea: tendencia de ingresos + visitas (overlay)
- Gráfico de barras: comparativa semanal
- Tabla: top 5 clases por asistencia

**Reporte: Ingresos:**
- Filtros: por plan, por sucursal, por método de pago, por vendedor
- Gráfico de área: ingresos acumulados del período
- Tabla: detalle de transacciones con estados (pagado/pendiente/rechazado)
- Totales: brutto, descuentos, netto
- Botón "Exportar CSV"

**Reporte: Asistencia:**
- Gráfico de heatmap: días de la semana × horas del día (quét mano intensidad)
- Tabla: socios con más visitas + total
- Filtro: por clase, por instructor, por sala

**Interacciones:**
- Date range picker guarda el último rango seleccionado en localStorage
- Click en cualquier barra/sector → drilldown al detalle
- Toggle "vs período anterior" para superponer comparativa
- Exportar: CSV, PDF

---

### 3.8 Comunicaciones

**Propósito:** Gestionar envío de comunicaciones a socios.

**Layout:**
- Header con título + botón "Nueva comunicación"
- Tabs: "Plantillas" / "Campañas enviadas"
- Área principal con editor o lista según tab

**Nueva comunicación:**
- Input: asunto del mensaje
- Selector de destinatarios:
  - Por plan (Todos / Básico / Premium / VIP)
  - Por estado de membresía (Todos / Activos / Por vencer / Vencidos)
  - Por sucursal
  - Selección manual (checkboxes con búsqueda)
- Contador: "Destinatarios: 142 socios"
- Editor de mensaje (textarea enriquecido o WYSIWYG simple)
- Preview en tiempo real (renderiza el mensaje como se verá)
- Botones: "Guardar como plantilla" + "Enviar ahora" / "Programar"

**Plantillas guardadas:**
- Lista de plantillas con: nombre, asunto, última modificación, veces usada
- Click → abre editor con datos precargados
- Menú ⋮ para duplicar / editar / eliminar

**Historial de campañas:**
- Tabla: nombre, fecha de envío, destinatarios (número), tasa de apertura (%), estado
- Expandable row: preview del mensaje + stats detalladas

---

### 3.9 Configuración de cuenta y sucursal

**Propósito:** Ajustes generales del sistema y de la cuenta.

**Layout:**
- Navegación por tabs verticales: General / Horarios / Sucursales / Staff y roles / Notificaciones / Facturación

**General:**
- Logo del gimnasio (upload)
- Nombre de la empresa
- Email de contacto
- Teléfono
- Zona horaria
- Botón "Guardar cambios"

**Horarios:**
- Grilla de 7 días × 2 (apertura / cierre)
- Input hora: "Abre" + "Cierra" por día
- Toggle por día: "Abierto" / "Cerrado"
- Override para feriados: fecha + horario especial

**Sucursales:**
- Lista de sucursales como cards
- Cada card: nombre, dirección, horarios, número de socios
- Botón: "Editar" + "Activar/Desactivar"
- Card adicional para agregar nueva sucursal

**Staff y roles:**
- Tabla: nombre, email, rol, sucursal, estado
- Roles: Administrador, Gerente, Recepcionista, Instructor
- Permissions matrix: cada rol con toggles por sección (ver / editar / borrar)
- Botón "Invitar miembro" → form email + rol + sucursal

**Notificaciones:**
- Lista de eventos con toggles:
  - "Notificar cuando una membresía está por vencer" (3 días antes)
  - "Notificar cuando una membresía se vence"
  - "Recordatorio de cumpleaños"
  - "Resumen semanal de actividad"
- Canal: Email / SMS / Push (toggles)

---

## 4. Flujos de Interacción Críticos

### 4.1 Check-in del socio en recepción

```
Paso 1 — Búsqueda
  └─ Recepcionista abre pantalla de Check-in
  └─ Teclea nombre o número de documento en input principal
  └─ Resultados aparecen en dropdown (autofiltro en tiempo real, ≥2 chars)
  └─ O bien: hace click en botón de clase rápida ("Spinning 8:00")

Paso 2 — Selección
  └─ Click en resultado o confirmación de clase rápida
  └─ Modal de confirmación aparece (480px centrado)
  └─ Muestra: avatar, nombre, plan, estado de membresía, fecha de vencimiento

Paso 3 — Confirmación
  └─ Membresía ACTIVA → Modal verde + checkmark animado + "Bienvenido/a [Nombre]"
    └─ Auto-close en 3 segundos o click en "Cerrar"
    └─ Feed de actividad se actualiza con el nuevo check-in (aparece arriba)

  └─ Membresía POR VENCER → Modal amarillo + warning + mensaje
    └─ Recepcionista decide: "Permitir ingreso" (mismo flujo verde) o "Ver detalles" (abre perfil)

  └─ Membresía VENCIDA → Modal rojo + mensaje de denegación
    └─ Botones: "Ver opciones de renovación" → abre modal de renovación
    └─ O "Cerrar" → socio no ingresa

  └─ SOCIO NO ENCONTRADO → Modal con mensaje + botón "Registrar visitante del día"
    └─ Abre form rápido: nombre + teléfono + clase
    └─ Genera ticket de visitante con validez del día

Paso 4 — Feed de actividad
  └─ Nuevo item aparece en el feed con animación fade-in
  └─ Contador de total de ingresos del día se actualiza
```

### 4.2 Reserva de clase desde administración

```
Paso 1 — Seleccionar clase
  └─ Staff abre Agenda desde sidebar
  └─ Vista en semana: ve bloques de color por clase
  └─ Click en bloque de clase → abre side panel derecho

Paso 2 — Dentro del side panel
  └─ Muestra: tipo, horario, instructor, cupo (12/15), lista de espera
  └─ Botón: "Agregar socio"

Paso 3 — Buscar socio
  └─ Input de búsqueda dentro del panel
  └─ Autocompletado con resultados
  └─ Click en socio → se agrega a la clase

Paso 4 — Cupo lleno
  └─ Siclass is full: botón cambia a "Agregar a lista de espera"
  └─ Click → socio aparece en lista de espera con posición #1, #2…
  └─ Toggle "Confirmación automática" disponible

Paso 5 — Confirmación desde lista de espera
  └─ Si un socio confirmado cancela → slot se libera
  └─ Botón "Promover" aparece al lado del #1 de la lista
  └─ Click en "Promover" → aparece mini modal: "¿Confirmar a [Nombre] en lugar de [Socio anterior]?"
  └─ Confirmar → socio mueve a lista confirmada, lista de espera se reordena
```

### 4.3 Alta o renovación de membresía

```
Paso 1 — Seleccionar socio
  └─ Staff va a Membresías → "Nueva membresía"
  └─ Wizard paso 1: búsqueda de socio
  └─ Si socio ya tiene membresía activa → warning banner:
    "Este socio ya tiene una membresía Premium activa (vence 28/feb/2026)"
    └─ Opciones: "Renovar membresía actual" / "Cambiar a otro plan"

Paso 2 — Elegir plan
  └─ Paso 2 del wizard: cards de plan
  └─ Click en plan → selección con borde accent
  └─ Date picker: fecha de inicio (default hoy)
  └─ Select: duración (1/3/6/12 meses)
  └─ Precio se calcula y muestra en tiempo real

Paso 3 — Resumen
  └─ Paso 3: resumen completo
  └─ Card: nombre del socio, plan, precio, duración, fecha inicio, fecha fin
  └─ Validación en tiempo real: si hay errores, campos se marcan en rojo
  └─ Checkbox "Enviar email de confirmación"

Paso 4 — Confirmación
  └─ Botón "Confirmar membresía"
  └─ Loading state: spinner en botón, "Procesando…"
  └─ Éxito: modal verde con checkmark + "Membresía creada con éxito"
    └─ Detalle: "Socio dado de alta en Plan Premium — válido hasta 28/feb/2026"
    └─ Botón "Cerrar" → regresa a lista de socios
  └─ Error: modal rojo con mensaje de error específico
```

---

## 5. Estados y Manejo de Bordes

### Pantallas vacías

| Contexto | Visual |
|----------|--------|
| Tabla sin resultados de búsqueda | Ilustración minimal (línea + punto), texto: "No se encontraron socios con esos filtros", botón: "Limpiar filtros" |
| Agenda sin clases para el día | Recuadro punteado gris: "No hay clases programadas este día", botón: "Agregar clase" |
| Lista de espera vacía | Texto centrado en gris: "No hay nadie en lista de espera" |
| Reporte sin datos | Mensaje: "No hay datos para el período seleccionado", sugerencia: "Intenta ampliar el rango de fechas" |

### Formularios con errores de validación

- Campo inválido: borde `var(--color-danger)`, icono warning inline, mensaje debajo en rojo
- Formulario con errores: banner superior rojo: "Por favor corregí los errores antes de continuar"
- Error de email: "Ingresá un email válido (ej: nombre@ejemplo.com)"
- Error de fecha pasada: "La fecha de inicio no puede ser anterior a hoy"
- Error de required: "Este campo es obligatorio"

### Estados de carga

- **Skeleton tables:** filas de rectángulos gris claro alternados (80% / 100% opacity)
- **Skeleton cards:** rectángulos con shimmer animation
- **Spinner inline:** 16px círculo con borde 2px accent + border-top transparente, rotate animation
- **Loading overlay:** backdrop semitransparente gris con spinner centrado
- **Progress bar:** para uploads o procesos largos (ej: importando lista de socios)

### Estados de error general

- **Toast error (transient):** aparece arriba derecha, fondo rojo, ícono X, mensaje, auto-dismiss 5s, dismiss manual
- **Banner de error en sección:** fondo rojo claro, mensaje + acción de retry
- **Empty state con error:** mensaje específico: "No se pudo cargar la lista de socios. [Reintentar]"

### Acciones exitosas

- **Toast success:** fondo verde claro, ícono checkmark, mensaje, auto-dismiss 3s
  - "Membresía renovada con éxito"
  - "Check-in registrado — Bienvenido/a"
  - "Socio agregado a la clase"
- **Modal de éxito:** similar a confirmation modal pero con checkmark verde

### Estados de membresía — Badges y colores

| Estado | Color background | Color texto | Badge texto |
|--------|-----------------|-------------|-------------|
| Activa | `#F0FDF4` | `#006400` | ● Activa |
| Por vencer (≤7 días) | `#FFFBEB` | `#B45309` | ● Por vencer |
| Vencida | `#FEF2F2` | `#DC2626` | ● Vencida |
| Congelada | `#F5F3FF` | `#7C3AED` | ● Congelada |
| Visitante del día | `#F8FAFC` | `#333333` | ○ Visitante |

---

## 6. Criterios de Calidad Visual

### Consistencia
- Todas las tablas usan el mismo sistema de headers, filas, hover, selección y acciones
- Cards de KPI tienen la misma estructura interna: número + label + comparación
- Side panels tienen el mismo header (título + botón cerrar + acciones)
- Modales tienen el mismo padding, header, footer con botones

### Jerarquía visual
- El número grande del KPI es lo primero que se lee en el dashboard
- El nombre del socio es lo más prominente en cualquier lista o card
- El botón de acción primaria (CTA) es siempre azul accent y está a la derecha en formularios
- Filtros activos usan chips grises con X — claramente distinto de los botones de acción

### Densidad informativa
- Tablas de socios muestran 15 filas sin scroll — información densa pero con line-height ajustado (40px vs 48px default)
- Dashboard KPI cards son紧凑as — no hay espacio visual desperdiciado
- Side panel de Check-in tieneinfo suficiente para decidir sin necesidad de abrir perfil completo

### Legibilidad en contexto operativo
- Contraste de texto mínimo 4.5:1 en todos los estados
- Números de teléfono y documentos en formato legible (espaciado de miles, guiones)
- Estados de membresía con color de fondo no solo de texto (accesible para daltónicos)
- Tablas con hover row completo, no solo el texto

### Fotografía y avatares
- Avatares de socios: iniciales en círculo coloreado si no hay foto (generado desde nombre)
- Avatar del staff: foto real (obligatorio para quienes usan el sistema)
- Sin imágenes de stock de gym genéricas — solo fotos reales de los establecimientos

### Responsive
- No aplica — este spec es 100% escritorio (mínimo 1280px de ancho)
- Sidebar colapsable a 64px para maximizear área de contenido
- Tablas con horizontal scroll si es necesario, no wrap de columnas
