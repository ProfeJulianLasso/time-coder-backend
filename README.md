Collecting workspace information# Time Coder Backend

Backend para la aplicación de seguimiento de tiempo de codificación Time Coder, desarrollado con NestJS.

## Descripción

Este proyecto proporciona una API REST para registrar y analizar el tiempo dedicado a la codificación. Está diseñado para funcionar junto con una extensión de VS Code que captura datos de actividad de desarrollo (archivos, lenguajes, tiempos) y los envía al backend para su procesamiento y análisis.

## Características

- **Autenticación de usuarios**: Registro y login con JWT para acceso web
- **API Key**: Autenticación mediante tokens para la extensión de VS Code
- **Registro de actividades**: Almacenamiento de datos sobre tiempos de codificación
- **Informes**: Reportes diarios y semanales del tiempo dedicado a cada proyecto y lenguaje
- **Seguimiento de ramas Git**: Registro del tiempo dedicado a cada rama Git

## Tecnologías

- **NestJS**: Framework para construir aplicaciones del lado del servidor en Node.js
- **TypeORM**: ORM para TypeScript y JavaScript
- **SQLite**: Base de datos ligera
- **JWT**: JSON Web Tokens para autenticación
- **Passport**: Middleware de autenticación
- **Class Validator**: Validación de datos
- **TypeScript**: Lenguaje de programación

## Estructura del proyecto

```
src/
├── activity/                  # Módulo de actividades
│   ├── dto/                   # Objetos de transferencia de datos
│   ├── entities/              # Entidades de base de datos
│   ├── activity.controller.ts # Controlador de actividades
│   ├── activity.module.ts     # Módulo de actividades
│   └── activity.service.ts    # Servicios de actividades
├── auth/                      # Módulo de autenticación
│   ├── dto/                   # DTOs para auth
│   ├── entities/              # Entidades de usuarios
│   ├── auth.controller.ts     # Controlador de autenticación
│   ├── auth.module.ts         # Módulo de autenticación
│   └── auth.service.ts        # Servicios de autenticación
├── reports/                   # Módulo de informes
│   ├── reports.controller.ts  # Controlador de informes
│   ├── reports.module.ts      # Módulo de informes
│   └── reports.service.ts     # Servicios de informes
├── app.module.ts              # Módulo principal de la aplicación
└── main.ts                    # Punto de entrada de la aplicación
```

## Instalación

```bash
# Clonar repositorio
git clone <url-del-repositorio>

# Instalar dependencias
npm install

# Crear archivo .env 
# Ejemplo:
# DATABASE_PATH=devtimer.sqlite
# JWT_SECRET=tu_clave_secreta
# NODE_ENV=development
```

## Ejecutar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

Por defecto, la aplicación se ejecuta en: http://localhost:3000

## Endpoints API

### Autenticación

- `POST /auth/register`: Registrar nuevo usuario
- `POST /auth/login`: Iniciar sesión
- `GET /auth/profile`: Obtener perfil de usuario
- `POST /auth/regenerate-api-key`: Regenerar API Key

### Actividades

- `POST /activity`: Registrar actividad(es) de codificación
- `GET /activity`: Listar actividades de usuario

### Informes

- `GET /reports/daily`: Resumen diario (API Key)
- `GET /reports/weekly`: Resumen semanal (API Key)
- `GET /reports/daily-web`: Resumen diario (JWT)
- `GET /reports/weekly-web`: Resumen semanal (JWT)

## Modelo de datos

### Usuario (User)

- `id`: Identificador único
- `username`: Nombre de usuario
- `password`: Contraseña (hash)
- `apiKey`: Clave de API para autenticación de la extensión

### Actividad (Activity)

- `id`: Identificador único
- `project`: Nombre del proyecto
- `file`: Archivo modificado
- `language`: Lenguaje de programación
- `startTime`: Tiempo de inicio (timestamp)
- `endTime`: Tiempo de finalización (timestamp)
- `duration`: Duración en segundos
- `createdAt`: Fecha de creación del registro
- `user`: Relación con el usuario
- `gitBranch`: Rama Git asociada

## Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e
```

## Licencia

Este proyecto es privado y no está licenciado para uso público.