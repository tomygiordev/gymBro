# GymOS Backend

Backend API para GymOS - Panel de Administración de Gimnasio.

## Stack

- **Runtime:** Node.js 20+ con TypeScript
- **Framework:** NestJS + Fastify
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis + BullMQ
- **Auth:** JWT + Argon2

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

### 2. Levantar Infraestructura

```bash
docker-compose up -d postgres redis
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Generar Migraciones

```bash
npm run db:generate
npm run db:migrate
```

### 5. Ejecutar en Desarrollo

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

## Scripts

```bash
npm run build          # Compilar
npm run start          # Producción
npm run start:dev      # Desarrollo con watch
npm run lint           # Lint
npm run test           # Tests
npm run db:generate    # Generar migraciones
npm run db:migrate     # Aplicar migraciones
npm run db:studio      # Drizzle Studio
```