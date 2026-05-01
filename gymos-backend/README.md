# GymOS Backend

Backend API para GymOS - Panel de Administración de Gimnasio.

## Stack

- **Runtime:** Node.js 20+ con TypeScript
- **Framework:** NestJS + Fastify
- **ORM:** Drizzle ORM
- **Database:** SQLite local (`./data/gymos.db`)
- **Cache/Queue:** Implementaciones local/no-op para desarrollo
- **Auth:** JWT + bcryptjs

## Estructura

```
src/
├── config/                 # Configuración de la app
├── common/                 # Componentes compartidos
│   ├── decorators/         # Decoradores personalizados
│   ├── filters/            # Filtros de excepciones
│   ├── guards/             # Guards de autenticación
│   └── middlewares/        # Middlewares
├── modules/                # Módulos de dominio (Clean Architecture)
│   ├── iam/                # Autenticación y usuarios
│   ├── members/           # Gestión de socios
│   ├── memberships/       # Membresías y planes
│   ├── checkins/           # Check-in (flujo crítico)
│   ├── billing/            # Facturación y pagos
│   ├── scheduling/         # Agenda de clases
│   ├── reporting/          # Reportes y dashboard
│   └── audit/             # Auditoría
├── database/               # Schema y migraciones
│   ├── schema/             # Definición de tablas Drizzle
│   └── migrations/         # Migraciones SQL
└── shared/                 # Utilidades compartidas
    ├── constants/          # Constantes de dominio
    ├── types/             # Tipos TypeScript
    └── utils/             # Funciones utilitarias
```

## Primeros Pasos

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
```

### 2. Crear la base local

```bash
npm run db:migrate
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Cargar datos de ejemplo (opcional)

```bash
npm run db:seed
```

### 5. Ejecutar en Desarrollo

```bash
npm run build
npm run start
```

Si preferís modo watch:

```bash
npm run start:dev
```

## Endpoints Principales

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/forgot-password` - Solicitar recuperación
- `GET /api/v1/auth/me` - Usuario actual

### Members
- `GET /api/v1/members/search?q=` - Buscar socio
- `GET /api/v1/members` - Listar socios
- `POST /api/v1/members` - Crear socio

### Memberships
- `GET /api/v1/memberships/plans` - Listar planes
- `POST /api/v1/memberships` - Crear membresía
- `POST /api/v1/memberships/:id/renew` - Renovar
- `POST /api/v1/memberships/:id/freeze` - Congelar

### Check-ins (Flujo Crítico)
- `POST /api/v1/checkins` - Check-in de socio
- `GET /api/v1/checkins/feed` - Feed de actividad

### Dashboard
- `GET /api/v1/reports/dashboard` - KPIs del dashboard

## API Documentation

Swagger disponible en: `http://localhost:3000/docs`

Healthcheck disponible en: `http://localhost:3000/api/v1/health`

## Scripts

```bash
npm run build          # Compilar
npm run start          # Ejecutar desde dist/
npm run start:dev      # Desarrollo con watch
npm run lint           # Lint
npm run test           # Tests
npm run db:generate    # Generar SQL de Drizzle
npm run db:migrate     # Crear/actualizar la base SQLite local
npm run db:seed        # Insertar datos demo
npm run db:studio      # Drizzle Studio
```

## Notas Locales

- No necesitás Docker para levantar el proyecto en esta PC.
- `npm run build` limpia `dist/` y `tsconfig.tsbuildinfo` antes de recompilar para evitar builds incrementales rotos.
- Si borrás `data/gymos.db`, volvé a correr `npm run db:migrate`.
