# Instrucciones para Github Copilot

## Estrucutra de carpetas

```text
/
├── cmd/                                # Punto de entrada de la aplicación
│   └── api/
│       └── main.go
├── internal/                           # Código privado para la aplicación
│   ├── common/                         # Código común/compartido entre contextos
│   │   ├── infrastructure/             # Infraestructura compartida
│   │   │   ├── persistence/            # Adaptadores de persistencia
│   │   │   │   ├── postgres/
│   │   │   │   ├── mongodb/
│   │   │   │   └── redis/
│   │   │   └── http/                   # Adaptadores HTTP compartidos
│   │   ├── domain/                     # Entidades y reglas de dominio compartidas
│   │   └── application/                # Casos de uso compartidos
│   │
│   ├── security/                       # Contexto de Seguridad
│   │   ├── domain/                     # Entidades y reglas de dominio de seguridad
│   │   │   ├── model/                  # Modelos de dominio (User, Role, Permission)
│   │   │   ├── repository/             # Interfaces de repositorio (puertos)
│   │   │   └── service/                # Servicios de dominio
│   │   ├── application/                # Capa de aplicación
│   │   │   ├── command/                # Comandos CQRS
│   │   │   │   ├── handler/            # Manejadores de comandos
│   │   │   │   └── dto/                # Data Transfer Objects para comandos
│   │   │   └── query/                  # Consultas CQRS
│   │   │       ├── handler/            # Manejadores de consultas
│   │   │       └── dto/                # Data Transfer Objects para consultas
│   │   └── infrastructure/             # Adaptadores y puertos
│   │       ├── persistence/            # Implementaciones de repositorios
│   │       │   └── mongodb/            # Implementación MongoDB
│   │       ├── api/                    # API HTTP
│   │       │   ├── handler/            # Manejadores HTTP
│   │       │   ├── middleware/         # Middlewares
│   │       │   └── route/              # Definiciones de rutas
│   │       └── auth/                   # Lógica de autenticación
│   │
│   ├── activity/                       # Contexto de Actividad
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   ├── application/
│   │   │   ├── command/
│   │   │   │   ├── handler/
│   │   │   │   └── dto/
│   │   │   └── query/
│   │   │       ├── handler/
│   │   │       └── dto/
│   │   └── infrastructure/
│   │       ├── persistence/
│   │       │   └── postgres/           # Implementación PostgreSQL con GORM
│   │       └── api/
│   │           ├── handler/
│   │           ├── middleware/
│   │           └── route/
│   │
│   └── report/                         # Contexto de Reportes
│       ├── domain/
│       │   ├── model/
│       │   ├── repository/
│       │   └── service/
│       ├── application/
│       │   ├── command/
│       │   │   ├── handler/
│       │   │   └── dto/
│       │   └── query/
│       │       ├── handler/
│       │       └── dto/
│       └── infrastructure/
│           ├── persistence/
│           │   └── mongodb/            # Implementación MongoDB
│           └── api/
│               ├── handler/
│               ├── middleware/
│               └── route/
│
├── pkg/                                # Código público que podría ser usado por otros proyectos
│   ├── logger/                         # Librería de logging
│   ├── errors/                         # Manejo de errores
│   └── validator/                      # Validación de datos
│
├── api/                                # Especificación de la API (Swagger, OpenAPI, etc)
├── configs/                            # Archivos de configuración
├── scripts/                            # Scripts de utilidad (migraciones, despliegue, etc)
├── docs/                               # Documentación
└── test/                               # Pruebas de integración y e2e
```

# Lineamientos de Programación para Go

## Tabla de Contenidos

1. [Principios Fundamentales](#principios-fundamentales)
2. [Estructura de Proyecto](#estructura-de-proyecto)
3. [Arquitectura Hexagonal](#arquitectura-hexagonal)
4. [Implementación de CQRS](#implementación-de-cqrs)
5. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
6. [Organización de Código](#organización-de-código)
7. [Manejo de Errores](#manejo-de-errores)
8. [Testing](#testing)
9. [Concurrencia](#concurrencia)
10. [Aplicación de Principios SOLID](#aplicación-de-principios-solid)
11. [Patrones de Diseño Comunes](#patrones-de-diseño-comunes)
12. [Integración con Gin](#integración-con-gin)
13. [Conexiones a Bases de Datos](#conexiones-a-bases-de-datos)
14. [Estrategias de Caché con Redis](#estrategias-de-caché-con-redis)
15. [Logging y Monitoreo](#logging-y-monitoreo)
16. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
17. [Estrategias de Migración](#estrategias-de-migración)
18. [Seguridad y Rate Limiting](#seguridad-y-rate-limiting)
19. [Rendimiento y Optimización](#rendimiento-y-optimización)

## Principios Fundamentales

### 1. Simplicidad (KISS)

Go fue diseñado con la simplicidad como principio fundamental. Mantén este espíritu en tu código.

- Prefiere soluciones simples y directas sobre abstracciones complejas.
- Usa estructuras de datos simples cuando sea posible.
- Evita sobre-ingenierizar soluciones.

```go
// ✅ Bueno: Simple y directo
func IsUserActive(user User) bool {
    return user.Status == "active" && !user.DeletedAt.Valid
}

// ❌ Malo: Innecesariamente complejo
func IsUserActive(user User) bool {
    statusCheck := func(status string) bool { return status == "active" }
    deletionCheck := func(deletedAt sql.NullTime) bool { return !deletedAt.Valid }
    return statusCheck(user.Status) && deletionCheck(user.DeletedAt)
}
```

### 2. No Repetirse (DRY)

- Extrae código común en funciones reutilizables.
- Usa paquetes para agrupar funcionalidades relacionadas.
- Equilibra DRY con la legibilidad y simplicidad.

```go
// ✅ Bueno: Reutilización de lógica común
func ValidateUser(user User) error {
    if err := ValidateEmail(user.Email); err != nil {
        return fmt.Errorf("invalid email: %w", err)
    }
    
    if err := ValidatePassword(user.Password); err != nil {
        return fmt.Errorf("invalid password: %w", err)
    }
    
    return nil
}

// Funciones específicas reutilizables
func ValidateEmail(email string) error {
    // Lógica de validación de email
}

func ValidatePassword(password string) error {
    // Lógica de validación de contraseña
}
```

### 3. YAGNI (You Aren't Gonna Need It)

- Implementa solo lo que se necesita ahora, no lo que podría necesitarse en el futuro.
- Evita crear abstracciones prematuras.
- Añade complejidad solo cuando haya un caso de uso concreto.

## Estructura de Proyecto

Basado en la estructura compartida, tu proyecto sigue principios de Domain-Driven Design (DDD) con Arquitectura Hexagonal (Ports & Adapters) y CQRS. Estas son algunas recomendaciones:

### Directrices Generales

1. **Separación clara de responsabilidades**:
   - `/cmd`: Puntos de entrada de la aplicación
   - `/internal`: Código privado de la aplicación
   - `/pkg`: Código público reutilizable
   - `/api`: Definición de APIs
   - `/configs`: Configuraciones
   - `/scripts`: Scripts de utilidad
   - `/docs`: Documentación
   - `/test`: Pruebas de integración y e2e

2. **Organización por contextos delimitados**:
   - Cada contexto (`security`, `activity`, `report`) tiene su propia implementación de dominio, aplicación e infraestructura.

3. **Dependencias unidireccionales**:
   - Domain → Application → Infrastructure
   - Las capas internas no deben depender de las externas.

## Arquitectura Hexagonal

### Principios Clave

1. **Independencia de las capas internas**: El dominio y la aplicación deben ser completamente independientes de frameworks, bases de datos, y otras tecnologías externas.

2. **Flujo de dependencias hacia adentro**: Las dependencias siempre apuntan hacia el centro (dominio).

3. **Puertos y Adaptadores**: 
   - **Puertos**: Interfaces definidas en las capas internas
   - **Adaptadores**: Implementaciones de los puertos en las capas externas

### Implementación de Capas Puras

#### Capa de Dominio Pura

La capa de dominio debe contener únicamente reglas de negocio y entidades, sin dependencias externas:

```go
// internal/security/domain/model/user.go
package model

// User es una entidad de dominio que no depende de ninguna tecnología externa
type User struct {
    ID        string
    Email     string
    Password  string
    Status    string
    CreatedAt time.Time
    UpdatedAt time.Time
}

// IsActive es una regla de negocio implementada sin dependencias externas
func (u *User) IsActive() bool {
    return u.Status == "active"
}

// CanPerformAction es otra regla de negocio pura
func (u *User) CanPerformAction(action string, roles []string) bool {
    // Lógica pura de dominio
}
```

#### Puertos en el Dominio

```go
// internal/security/domain/repository/user_repository.go
package repository

import "myapp/internal/security/domain/model"

// UserRepository es un puerto (interfaz) definido por el dominio
type UserRepository interface {
    FindByID(id string) (*model.User, error)
    FindByEmail(email string) (*model.User, error)
    Save(user *model.User) error
    Delete(id string) error
}
```

#### Capa de Aplicación Pura

```go
// internal/security/application/command/handler/create_user_handler.go
package handler

import (
    "context"
    "myapp/internal/security/domain/model"
    "myapp/internal/security/domain/repository"
)

// CreateUserCommand representa un comando para crear un usuario
type CreateUserCommand struct {
    Email    string
    Password string
    Name     string
}

// CreateUserHandler maneja el comando de creación de usuario
type CreateUserHandler struct {
    userRepo repository.UserRepository
}

// NewCreateUserHandler crea un nuevo manejador de creación de usuarios
func NewCreateUserHandler(userRepo repository.UserRepository) *CreateUserHandler {
    return &CreateUserHandler{
        userRepo: userRepo,
    }
}

// Handle ejecuta la lógica de aplicación para crear un usuario
func (h *CreateUserHandler) Handle(ctx context.Context, cmd CreateUserCommand) error {
    // Valida el comando (lógica de validación pura)
    if err := validateNewUser(cmd.Email, cmd.Password, cmd.Name); err != nil {
        return err
    }
    
    // Crea un nuevo usuario (entidad de dominio)
    user := &model.User{
        ID:       generateID(), // Función pura para generar ID
        Email:    cmd.Email,
        Password: hashPassword(cmd.Password), // Función pura para hashear contraseña
        Name:     cmd.Name,
        Status:   "active",
    }
    
    // Utiliza el puerto para persistir (sin conocer la implementación)
    return h.userRepo.Save(user)
}

// Funciones auxiliares puras
func validateNewUser(email, password, name string) error {
    // Lógica de validación pura
}

func generateID() string {
    // Lógica pura para generar ID (podría usar un paquete de generación de UUID,
    // pero idealmente abstrayéndolo detrás de una interfaz)
}

func hashPassword(password string) string {
    // Implementación pura del hash, sin depender directamente de libs externas
}
```

#### Adaptadores en la Infraestructura

```go
// internal/security/infrastructure/persistence/mongodb/user_repository.go
package mongodb

import (
    "context"
    "myapp/internal/security/domain/model"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
)

// UserEntity es la representación de User adaptada para MongoDB
type UserEntity struct {
    ID        string    `bson:"_id"`
    Email     string    `bson:"email"`
    Password  string    `bson:"password"`
    Status    string    `bson:"status"`
    CreatedAt time.Time `bson:"created_at"`
    UpdatedAt time.Time `bson:"updated_at"`
}

// MongoUserRepository implementa el puerto UserRepository
type MongoUserRepository struct {
    collection *mongo.Collection
}

// NewUserRepository crea un nuevo repositorio de usuarios en MongoDB
func NewUserRepository(db *mongo.Database) *MongoUserRepository {
    return &MongoUserRepository{
        collection: db.Collection("users"),
    }
}

// FindByID implementa la interfaz UserRepository
func (r *MongoUserRepository) FindByID(id string) (*model.User, error) {
    var entity UserEntity
    err := r.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&entity)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return nil, fmt.Errorf("user not found")
        }
        return nil, err
    }
    
    // Mapeo de la entidad de MongoDB a la entidad de dominio
    return mapEntityToDomain(entity), nil
}

// Implementaciones de otros métodos del repositorio...

// Función de mapeo del adaptador
func mapEntityToDomain(entity UserEntity) *model.User {
    return &model.User{
        ID:        entity.ID,
        Email:     entity.Email,
        Password:  entity.Password,
        Status:    entity.Status,
        CreatedAt: entity.CreatedAt,
        UpdatedAt: entity.UpdatedAt,
    }
}

func mapDomainToEntity(user *model.User) UserEntity {
    return UserEntity{
        ID:        user.ID,
        Email:     user.Email,
        Password:  user.Password,
        Status:    user.Status,
        CreatedAt: user.CreatedAt,
        UpdatedAt: user.UpdatedAt,
    }
}
```

## Implementación de CQRS

### Estructura Recomendada

La separación de comandos (escritura) y consultas (lectura) debe reflejarse en la estructura de la aplicación:

```
/internal/context/application/
├── command/                  # Comandos (cambio de estado)
│   ├── handler/              # Manejadores de comandos
│   └── dto/                  # DTOs para comandos
└── query/                    # Consultas (lectura de datos)
    ├── handler/              # Manejadores de consultas
    └── dto/                  # DTOs para consultas
```

### Implementación de Comandos

```go
// internal/activity/application/command/create_activity.go
package command

// CreateActivityCommand representa una instrucción para crear una actividad
type CreateActivityCommand struct {
    UserID      string
    ProjectID   string
    ActivityType string
    Duration    int
    Timestamp   time.Time
    Metadata    map[string]interface{}
}

// internal/activity/application/command/handler/create_activity_handler.go
package handler

import (
    "context"
    "myapp/internal/activity/application/command"
    "myapp/internal/activity/domain/model"
    "myapp/internal/activity/domain/repository"
)

// CreateActivityHandler maneja el comando de creación de actividad
type CreateActivityHandler struct {
    activityRepo repository.ActivityRepository
}

func NewCreateActivityHandler(repo repository.ActivityRepository) *CreateActivityHandler {
    return &CreateActivityHandler{activityRepo: repo}
}

// Handle procesa el comando para crear una actividad
func (h *CreateActivityHandler) Handle(ctx context.Context, cmd command.CreateActivityCommand) error {
    activity := &model.Activity{
        ID:           generateID(),
        UserID:       cmd.UserID,
        ProjectID:    cmd.ProjectID,
        ActivityType: cmd.ActivityType,
        Duration:     cmd.Duration,
        Timestamp:    cmd.Timestamp,
        Metadata:     cmd.Metadata,
    }
    
    return h.activityRepo.Save(activity)
}
```

### Implementación de Consultas

```go
// internal/activity/application/query/get_user_activities.go
package query

// GetUserActivitiesQuery representa una consulta para obtener actividades de usuario
type GetUserActivitiesQuery struct {
    UserID    string
    DateFrom  time.Time
    DateTo    time.Time
    PageSize  int
    PageToken string
}

// internal/activity/application/query/dto/activity_dto.go
package dto

// ActivityDTO es un objeto de transferencia de datos para actividades
type ActivityDTO struct {
    ID           string
    UserID       string
    ProjectID    string
    ActivityType string
    Duration     int
    Timestamp    time.Time
    Metadata     map[string]interface{}
}

// internal/activity/application/query/handler/get_user_activities_handler.go
package handler

import (
    "context"
    "myapp/internal/activity/application/query"
    "myapp/internal/activity/application/query/dto"
    "myapp/internal/activity/domain/repository"
)

// GetUserActivitiesHandler maneja consultas de actividades de usuario
type GetUserActivitiesHandler struct {
    activityRepo repository.ActivityRepository
}

func NewGetUserActivitiesHandler(repo repository.ActivityRepository) *GetUserActivitiesHandler {
    return &GetUserActivitiesHandler{activityRepo: repo}
}

// Handle procesa la consulta para obtener actividades de usuario
func (h *GetUserActivitiesHandler) Handle(ctx context.Context, q query.GetUserActivitiesQuery) ([]dto.ActivityDTO, string, error) {
    activities, nextPageToken, err := h.activityRepo.FindByUserIDAndDateRange(
        q.UserID, q.DateFrom, q.DateTo, q.PageSize, q.PageToken,
    )
    if err != nil {
        return nil, "", err
    }
    
    // Mapea las entidades de dominio a DTOs
    dtos := make([]dto.ActivityDTO, len(activities))
    for i, activity := range activities {
        dtos[i] = mapToDTO(activity)
    }
    
    return dtos, nextPageToken, nil
}

// Función de mapeo para DTOs
func mapToDTO(activity *model.Activity) dto.ActivityDTO {
    return dto.ActivityDTO{
        ID:           activity.ID,
        UserID:       activity.UserID,
        ProjectID:    activity.ProjectID,
        ActivityType: activity.ActivityType,
        Duration:     activity.Duration,
        Timestamp:    activity.Timestamp,
        Metadata:     activity.Metadata,
    }
}
```

### Bus de Comandos

Para implementar un bus de comandos sin dependencias externas:

```go
// internal/common/application/command/bus.go
package command

import (
    "context"
    "fmt"
    "reflect"
)

// Handler define la interfaz para manejadores de comandos
type Handler interface {
    // Type retorna el tipo de comando que maneja
    Type() reflect.Type
    
    // Handle ejecuta la lógica del comando
    Handle(ctx context.Context, command interface{}) error
}

// Bus es un bus de comandos simple
type Bus struct {
    handlers map[reflect.Type]Handler
}

// NewBus crea un nuevo bus de comandos
func NewBus() *Bus {
    return &Bus{
        handlers: make(map[reflect.Type]Handler),
    }
}

// Register registra un manejador para un tipo de comando
func (b *Bus) Register(handler Handler) {
    b.handlers[handler.Type()] = handler
}

// Dispatch envía un comando al manejador correspondiente
func (b *Bus) Dispatch(ctx context.Context, command interface{}) error {
    t := reflect.TypeOf(command)
    handler, exists := b.handlers[t]
    if !exists {
        return fmt.Errorf("no handler registered for command type %v", t)
    }
    
    return handler.Handle(ctx, command)
}
```

## Convenciones de Nomenclatura

### Paquetes

- Nombres en minúsculas, una sola palabra.
- Evita guiones bajos o camelCase.
- El nombre debe reflejar su propósito, no lo que contiene.

```go
// ✅ Bueno
package validator
package user
package mongodb

// ❌ Malo
package userStuff
package user_validator
```

### Variables y Constantes

- camelCase para variables locales y privadas.
- PascalCase para variables exportadas.
- Usa nombres descriptivos, evita abreviaturas no estándar.

```go
// Variables exportadas (PascalCase)
var MaxRetryCount = 5

// Variables privadas (camelCase)
var connectionPool = make(map[string]Connection)

// Constantes
const (
    StatusActive   = "active"
    StatusInactive = "inactive"
)
```

### Funciones y Métodos

- PascalCase para funciones exportadas.
- camelCase para funciones privadas.
- Nombres deben indicar acción (verbos).

```go
// Función exportada
func ValidateEmail(email string) error {}

// Método exportado
func (u *User) UpdatePassword(password string) error {}

// Función privada
func validatePasswordStrength(password string) error {}
```

### Interfaces

- PascalCase con nombres que describan comportamiento.
- Cuando la interfaz tiene un solo método, usa el nombre del método + "er".

```go
// Interfaz con un solo método
type Reader interface {
    Read(p []byte) (n int, err error)
}

// Interfaz con múltiples métodos
type UserRepository interface {
    FindByID(id string) (*User, error)
    Save(user *User) error
    Delete(id string) error
}
```

## Organización de Código

### Diseño de Paquetes

1. **Cohesión**: Un paquete debe tener una responsabilidad clara.
2. **Minimalismo**: Exporta solo lo necesario desde cada paquete.
3. **Estructuras planas**: Evita jerarquías de paquetes profundas.

```go
// Por contexto y capa (según tu estructura)
/internal/security/domain/model/user.go
/internal/security/domain/repository/user_repository.go
/internal/security/application/query/handler/get_user_handler.go
/internal/security/infrastructure/persistence/mongodb/user_repository.go
```

### Organización de Archivos

- Un archivo por entidad o concepto.
- Tamaño razonable (max ~500 líneas).
- Estructura consistente.

```go
// user.go - Define la entidad User
package model

// User representa un usuario en el sistema
type User struct {
    ID       string
    Email    string
    Password string
    Status   string
    // ...
}

// Métodos relevantes para User
func (u *User) IsActive() bool {
    return u.Status == "active"
}
```

## Manejo de Errores

### Principios

1. **Errores como valores**: Trata los errores como valores retornados, no como excepciones.
2. **Información significativa**: Los errores deben proporcionar contexto útil.
3. **Propagación con contexto**: Añade contexto al propagar errores hacia arriba.

### Buenas Prácticas

```go
// Usando el paquete standard errors
if err != nil {
    return fmt.Errorf("failed to connect to database: %w", err)
}

// Usando un paquete de errores personalizado (pkg/errors)
func FetchUserData(userID string) (*UserData, error) {
    user, err := repository.FindByID(userID)
    if err != nil {
        return nil, errors.Wrap(err, "fetching user from repository")
    }
    
    // Continuar con la lógica...
}
```

### Errores Personalizados

Define tipos de error para casos específicos:

```go
// En pkg/errors/domain_errors.go
package errors

import "fmt"

type NotFoundError struct {
    Entity string
    ID     string
}

func (e NotFoundError) Error() string {
    return fmt.Sprintf("%s with ID %s not found", e.Entity, e.ID)
}

// Función para comprobar el tipo de error
func IsNotFound(err error) bool {
    _, ok := err.(NotFoundError)
    return ok
}

// Uso
if errors.IsNotFound(err) {
    // Manejar caso de no encontrado
}
```

## Testing

### Principio YAGNI para Testing

**Importante**: Siguiendo el principio YAGNI (You Aren't Gonna Need It), las pruebas unitarias deben ser escritas **SOLO cuando se soliciten explícitamente**. No dediques tiempo a escribir tests que no han sido requeridos.

### Cuando se soliciten tests, sigue estos principios

1. **Cobertura significativa**: Prioriza tests que validen comportamientos críticos.
2. **Aislamiento**: Cada test debe validar una sola cosa.
3. **Determinismo**: Los tests deben dar el mismo resultado en cada ejecución.
4. **Legibilidad**: Los tests deben ser fáciles de entender.

### Estructura de Tests (solo cuando sean solicitados)

Usa el patrón Given-When-Then (Arrange-Act-Assert):

```go
func TestUserRepository_FindByID(t *testing.T) {
    // Given (Arrange)
    user := &model.User{
        ID:     "user123",
        Email:  "test@example.com",
        Status: "active",
    }
    mockDB := setupMockDB()
    mockDB.AddUser(user)
    repo := NewUserRepository(mockDB)
    
    // When (Act)
    foundUser, err := repo.FindByID("user123")
    
    // Then (Assert)
    assert.NoError(t, err)
    assert.Equal(t, user.ID, foundUser.ID)
    assert.Equal(t, user.Email, foundUser.Email)
}
```

### Mocking

Usa interfaces para facilitar el mocking (esto es útil para la arquitectura hexagonal independientemente de los tests):

```go
// Interfaz
type UserRepository interface {
    FindByID(id string) (*User, error)
}

// Mock para testing (implementar solo cuando se requieran tests)
type MockUserRepository struct {
    users map[string]*User
}

func (m *MockUserRepository) FindByID(id string) (*User, error) {
    user, exists := m.users[id]
    if !exists {
        return nil, errors.NotFoundError{Entity: "User", ID: id}
    }
    return user, nil
}
```

## Concurrencia

### Principios

1. **Simplicidad**: Usa goroutines y channels de manera clara y controlada.
2. **Control de recursos**: Limita el número de goroutines y gestiona su ciclo de vida.
3. **Comunicación segura**: Prefiere comunicación por canales sobre memoria compartida.

### Patrones Comunes

**Worker Pool**:

```go
func ProcessTasks(tasks []Task, concurrency int) []Result {
    numTasks := len(tasks)
    tasksChan := make(chan Task, numTasks)
    resultsChan := make(chan Result, numTasks)
    
    // Distribuir tareas
    for _, task := range tasks {
        tasksChan <- task
    }
    close(tasksChan)
    
    // Iniciar workers
    var wg sync.WaitGroup
    wg.Add(concurrency)
    for i := 0; i < concurrency; i++ {
        go func() {
            defer wg.Done()
            for task := range tasksChan {
                resultsChan <- ProcessTask(task)
            }
        }()
    }
    
    // Esperar a que terminen los workers y cerrar canal de resultados
    go func() {
        wg.Wait()
        close(resultsChan)
    }()
    
    // Recolectar resultados
    results := make([]Result, 0, numTasks)
    for result := range resultsChan {
        results = append(results, result)
    }
    
    return results
}
```

**Timeouts**:

```go
func FetchDataWithTimeout(ctx context.Context, url string) (*Data, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    dataChan := make(chan *Data, 1)
    errChan := make(chan error, 1)
    
    go func() {
        data, err := fetchData(url)
        if err != nil {
            errChan <- err
            return
        }
        dataChan <- data
    }()
    
    select {
    case data := <-dataChan:
        return data, nil
    case err := <-errChan:
        return nil, err
    case <-ctx.Done():
        return nil, fmt.Errorf("request timed out: %w", ctx.Err())
    }
}
```

## Aplicación de Principios SOLID

### Single Responsibility Principle (SRP)

Cada componente debe tener una única responsabilidad:

```go
// ✅ Bueno: Cada tipo tiene una responsabilidad clara
type UserRepository interface {
    FindByID(id string) (*User, error)
    Save(user *User) error
}

type UserService struct {
    repo UserRepository
}

func (s *UserService) ActivateUser(userID string) error {
    // Lógica de activación
}

// ❌ Malo: Mezclando responsabilidades
type UserManager struct {
    db *sql.DB
}

func (m *UserManager) FindUserByID(id string) (*User, error) {
    // Consulta SQL directa
}

func (m *UserManager) SendActivationEmail(user *User) error {
    // Envío de email
}
```

### Open/Closed Principle (OCP)

Abierto para extensión, cerrado para modificación:

```go
// Interfaz base
type PaymentProcessor interface {
    Process(payment Payment) error
}

// Implementaciones específicas
type CreditCardProcessor struct{}
func (p *CreditCardProcessor) Process(payment Payment) error {
    // Procesamiento de tarjeta de crédito
}

type PayPalProcessor struct{}
func (p *PayPalProcessor) Process(payment Payment) error {
    // Procesamiento de PayPal
}

// Nueva implementación sin modificar código existente
type CryptoProcessor struct{}
func (p *CryptoProcessor) Process(payment Payment) error {
    // Procesamiento de criptomonedas
}
```

### Liskov Substitution Principle (LSP)

Las subclases deben poder usarse en lugar de sus clases base:

```go
type Storage interface {
    Save(data []byte, key string) error
    Get(key string) ([]byte, error)
}

// Ambas implementaciones cumplen completamente con la interfaz
type FileStorage struct{}
func (fs *FileStorage) Save(data []byte, key string) error {
    // Implementación para archivos
}
func (fs *FileStorage) Get(key string) ([]byte, error) {
    // Implementación para archivos
}

type RedisStorage struct{}
func (rs *RedisStorage) Save(data []byte, key string) error {
    // Implementación para Redis
}
func (rs *RedisStorage) Get(key string) ([]byte, error) {
    // Implementación para Redis
}
```

### Interface Segregation Principle (ISP)

Interfaces pequeñas y específicas:

```go
// ✅ Bueno: Interfaces específicas
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Componer interfaces cuando sea necesario
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}

// ❌ Malo: Interfaz con demasiados métodos
type FileHandler interface {
    Read(p []byte) (n int, err error)
    Write(p []byte) (n int, err error)
    Close() error
    Seek(offset int64, whence int) (int64, error)
    Stat() (FileInfo, error)
    // ...más métodos
}
```

### Dependency Inversion Principle (DIP)

Depende de abstracciones, no de implementaciones concretas:

```go
// ✅ Bueno: Dependencia de interfaz
type UserService struct {
    repo       UserRepository
    notifier   NotificationService
    validator  UserValidator
}

func NewUserService(repo UserRepository, notifier NotificationService, validator UserValidator) *UserService {
    return &UserService{
        repo:      repo,
        notifier:  notifier,
        validator: validator,
    }
}

// ❌ Malo: Dependencia de implementación concreta
type UserService struct {
    repo       *MongoUserRepository
    notifier   *EmailNotifier
    validator  *DefaultUserValidator
}
```

## Patrones de Diseño Comunes

### Repository

Abstrae el acceso a datos:

```go
// Definición del repositorio en domain/repository
type UserRepository interface {
    FindByID(id string) (*User, error)
    FindByEmail(email string) (*User, error)
    Save(user *User) error
    Delete(id string) error
}

// Implementación en infrastructure/persistence/mongodb
type MongoUserRepository struct {
    collection *mongo.Collection
}

func (r *MongoUserRepository) FindByID(id string) (*User, error) {
    // Implementación con MongoDB
}

// Implementación en infrastructure/persistence/postgres
type PostgresUserRepository struct {
    db *gorm.DB
}

func (r *PostgresUserRepository) FindByID(id string) (*User, error) {
    // Implementación con GORM y PostgreSQL
}
```

### Factory

Crea instancias complejas:

```go
// Factory para crear repositorios basados en configuración
func NewUserRepository(config *Config) (UserRepository, error) {
    switch config.DatabaseType {
    case "mongodb":
        client, err := connectToMongoDB(config.MongoDB)
        if err != nil {
            return nil, err
        }
        return mongodb.NewUserRepository(client.Database(config.MongoDB.Database)), nil
    case "postgres":
        db, err := connectToPostgres(config.Postgres)
        if err != nil {
            return nil, err
        }
        return postgres.NewUserRepository(db), nil
    default:
        return nil, fmt.Errorf("unsupported database type: %s", config.DatabaseType)
    }
}
```

### Decorator

Añade comportamiento a objetos existentes:

```go
// Decorator para añadir caché a un repositorio
type CachedUserRepository struct {
    repo  UserRepository
    cache Cache
}

func (r *CachedUserRepository) FindByID(id string) (*User, error) {
    // Intentar obtener del caché primero
    if user, found := r.cache.Get(id); found {
        return user.(*User), nil
    }
    
    // Si no está en caché, obtenerlo del repositorio subyacente
    user, err := r.repo.FindByID(id)
    if err != nil {
        return nil, err
    }
    
    // Guardar en caché
    r.cache.Set(id, user)
    return user, nil
}
```

## Integración con Gin

### Configuración del Router

```go
// cmd/api/main.go
package main

import (
    "log"
    "myapp/internal/security/infrastructure/api/handler"
    "myapp/internal/security/infrastructure/api/middleware"
    "myapp/internal/security/infrastructure/api/route"
    "github.com/gin-gonic/gin"
)

func main() {
    // Inicializar servicios, repositorios, etc.
    services := initializeServices()
    
    // Crear router Gin
    router := gin.Default()
    
    // Configurar middlewares globales
    router.Use(middleware.RequestLogger())
    router.Use(middleware.Recovery())
    
    // Configurar rutas
    api := router.Group("/api")
    {
        // Configurar rutas de seguridad
        securityRouter := api.Group("/security")
        route.SetupSecurityRoutes(securityRouter, services.SecurityHandlers)
        
        // Configurar rutas de actividad
        activityRouter := api.Group("/activity")
        route.SetupActivityRoutes(activityRouter, services.ActivityHandlers)
        
        // Configurar rutas de reportes
        reportRouter := api.Group("/reports")
        route.SetupReportRoutes(reportRouter, services.ReportHandlers)
    }
    
    // Iniciar servidor
    log.Fatal(router.Run(":8080"))
}
```

### Estructura de Manejadores (Handlers)

```go
// internal/security/infrastructure/api/handler/user_handler.go
package handler

import (
    "net/http"
    "myapp/internal/security/application/command"
    "myapp/internal/security/application/query"
    "github.com/gin-gonic/gin"
)

// UserHandler maneja las peticiones HTTP relacionadas con usuarios
type UserHandler struct {
    commandBus *command.Bus
    queryBus   *query.Bus
}

// NewUserHandler crea un nuevo manejador de usuarios
func NewUserHandler(commandBus *command.Bus, queryBus *query.Bus) *UserHandler {
    return &UserHandler{
        commandBus: commandBus,
        queryBus:   queryBus,
    }
}

// CreateUser maneja la creación de un nuevo usuario
func (h *UserHandler) CreateUser(c *gin.Context) {
    // Validar y obtener datos de la petición
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Crear y ejecutar comando
    cmd := command.CreateUserCommand{
        Email:    req.Email,
        Password: req.Password,
        Name:     req.Name,
    }
    
    err := h.commandBus.Dispatch(c.Request.Context(), cmd)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.Status(http.StatusCreated)
}

// GetUser maneja la obtención de un usuario por ID
func (h *UserHandler) GetUser(c *gin.Context) {
    userID := c.Param("id")
    
    // Crear y ejecutar consulta
    q := query.GetUserByIDQuery{
        ID: userID,
    }
    
    user, err := h.queryBus.Dispatch(c.Request.Context(), q)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, user)
}

// Estructuras de petición/respuesta
type CreateUserRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
    Name     string `json:"name" binding:"required"`
}
```

### Configuración de Rutas

```go
// internal/security/infrastructure/api/route/user_routes.go
package route

import (
    "myapp/internal/security/infrastructure/api/handler"
    "myapp/internal/security/infrastructure/api/middleware"
    "github.com/gin-gonic/gin"
)

// SetupUserRoutes configura las rutas de usuario
func SetupUserRoutes(router *gin.RouterGroup, userHandler *handler.UserHandler, authMiddleware middleware.AuthMiddleware) {
    users := router.Group("/users")
    {
        // Rutas públicas
        users.POST("", userHandler.CreateUser)
        users.POST("/login", userHandler.Login)
        
        // Rutas protegidas (requieren autenticación)
        authorized := users.Group("")
        authorized.Use(authMiddleware.RequireAuth())
        {
            authorized.GET("/:id", userHandler.GetUser)
            authorized.PUT("/:id", userHandler.UpdateUser)
            authorized.DELETE("/:id", userHandler.DeleteUser)
        }
    }
}
```

### Middlewares

```go
// internal/security/infrastructure/api/middleware/auth_middleware.go
package middleware

import (
    "myapp/internal/security/application/query"
    "github.com/gin-gonic/gin"
    "net/http"
    "strings"
)

// AuthMiddleware gestiona la autenticación de peticiones
type AuthMiddleware struct {
    tokenService TokenService
    queryBus     *query.Bus
}

// NewAuthMiddleware crea un nuevo middleware de autenticación
func NewAuthMiddleware(tokenService TokenService, queryBus *query.Bus) *AuthMiddleware {
    return &AuthMiddleware{
        tokenService: tokenService,
        queryBus:     queryBus,
    }
}

// RequireAuth middleware que verifica la autenticación del usuario
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Obtener token del encabezado Authorization
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
            return
        }
        
        tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
        
        // Validar token
        claims, err := m.tokenService.ValidateToken(tokenString)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
            return
        }
        
        // Obtener usuario por ID
        q := query.GetUserByIDQuery{ID: claims.UserID}
        user, err := m.queryBus.Dispatch(c.Request.Context(), q)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
            return
        }
        
        // Establecer usuario en el contexto
        c.Set("user", user)
        c.Next()
    }
}
```

## Conexiones a Bases de Datos

### MongoDB

```go
// internal/common/infrastructure/persistence/mongodb/connection.go
package mongodb

import (
    "context"
    "time"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// Config contiene la configuración para MongoDB
type Config struct {
    URI      string
    Database string
    Username string
    Password string
    Timeout  time.Duration
}

// Connect establece una conexión a MongoDB
func Connect(ctx context.Context, config Config) (*mongo.Client, error) {
    clientOptions := options.Client().ApplyURI(config.URI)
    
    if config.Username != "" && config.Password != "" {
        clientOptions.SetAuth(options.Credential{
            Username: config.Username,
            Password: config.Password,
        })
    }
    
    ctx, cancel := context.WithTimeout(ctx, config.Timeout)
    defer cancel()
    
    client, err := mongo.Connect(ctx, clientOptions)
    if err != nil {
        return nil, err
    }
    
    // Verificar conexión
    err = client.Ping(ctx, nil)
    if err != nil {
        return nil, err
    }
    
    return client, nil
}
```

### PostgreSQL con GORM

```go
// internal/common/infrastructure/persistence/postgres/connection.go
package postgres

import (
    "fmt"
    "time"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

// Config contiene la configuración para PostgreSQL
type Config struct {
    Host     string
    Port     int
    Database string
    Username string
    Password string
    SSLMode  string
    Timeout  time.Duration
}

// Connect establece una conexión a PostgreSQL usando GORM
func Connect(config Config) (*gorm.DB, error) {
    dsn := fmt.Sprintf(
        "host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
        config.Host, config.Port, config.Username, config.Password, config.Database, config.SSLMode,
    )
    
    gormConfig := &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    }
    
    return gorm.Open(postgres.Open(dsn), gormConfig)
}
```

### Redis

```go
// internal/common/infrastructure/persistence/redis/connection.go
package redis

import (
    "context"
    "time"
    "github.com/go-redis/redis/v8"
)

// Config contiene la configuración para Redis
type Config struct {
    Addr     string
    Password string
    DB       int
    Timeout  time.Duration
}

// Connect establece una conexión a Redis
func Connect(ctx context.Context, config Config) (*redis.Client, error) {
    client := redis.NewClient(&redis.Options{
        Addr:     config.Addr,
        Password: config.Password,
        DB:       config.DB,
    })
    
    ctx, cancel := context.WithTimeout(ctx, config.Timeout)
    defer cancel()
    
    // Verificar conexión
    _, err := client.Ping(ctx).Result()
    if err != nil {
        return nil, err
    }
    
    return client, nil
}
```

## Estrategias de Caché con Redis

### Implementación del Servicio de Caché

```go
// pkg/cache/redis_cache.go
package cache

import (
    "context"
    "encoding/json"
    "time"
    "github.com/go-redis/redis/v8"
)

// Cache define la interfaz para operaciones de caché
type Cache interface {
    Get(ctx context.Context, key string, dest interface{}) (bool, error)
    Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
    Delete(ctx context.Context, key string) error
}

// RedisCache implementa la interfaz Cache usando Redis
type RedisCache struct {
    client *redis.Client
}

// NewRedisCache crea un nuevo servicio de caché Redis
func NewRedisCache(client *redis.Client) *RedisCache {
    return &RedisCache{client: client}
}

// Get obtiene un valor de la caché y lo deserializa en dest
func (c *RedisCache) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
    val, err := c.client.Get(ctx, key).Result()
    if err == redis.Nil {
        return false, nil // Clave no encontrada
    }
    if err != nil {
        return false, err
    }
    
    err = json.Unmarshal([]byte(val), dest)
    if err != nil {
        return false, err
    }
    
    return true, nil
}

// Set guarda un valor en la caché
func (c *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    
    return c.client.Set(ctx, key, data, expiration).Err()
}

// Delete elimina una clave de la caché
func (c *RedisCache) Delete(ctx context.Context, key string) error {
    return c.client.Del(ctx, key).Err()
}
```

### Patrones de Caché

**Caché de Respuestas de API**:

```go
// internal/report/infrastructure/api/handler/report_handler.go
package handler

import (
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
    "myapp/pkg/cache"
)

// ReportHandler maneja las peticiones de reportes
type ReportHandler struct {
    reportService ReportService
    cache         cache.Cache
}

// GetUserActivitySummary obtiene un resumen de actividad del usuario
func (h *ReportHandler) GetUserActivitySummary(c *gin.Context) {
    userID := c.Param("userId")
    periodParam := c.DefaultQuery("period", "week")
    
    // Generar clave de caché
    cacheKey := fmt.Sprintf("user_activity:%s:%s", userID, periodParam)
    
    // Intentar obtener del caché
    var result ActivitySummary
    found, err := h.cache.Get(c.Request.Context(), cacheKey, &result)
    if err != nil {
        // Log error de caché pero continuar
        log.Printf("Cache error: %v", err)
    }
    
    if found {
        c.JSON(http.StatusOK, result)
        return
    }
    
    // Si no está en caché, obtener de la fuente
    summary, err := h.reportService.GetUserActivitySummary(c.Request.Context(), userID, periodParam)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    // Guardar en caché (expira en 1 hora)
    err = h.cache.Set(c.Request.Context(), cacheKey, summary, time.Hour)
    if err != nil {
        log.Printf("Failed to cache result: %v", err)
    }
    
    c.JSON(http.StatusOK, summary)
}
```

**Invalidación de Caché**:

```go
// internal/activity/infrastructure/api/handler/activity_handler.go
package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "myapp/pkg/cache"
)

// ActivityHandler maneja las peticiones de actividad
type ActivityHandler struct {
    commandBus *command.Bus
    cache      cache.Cache
}

// CreateActivity crea un registro de actividad
func (h *ActivityHandler) CreateActivity(c *gin.Context) {
    var req CreateActivityRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    cmd := command.CreateActivityCommand{
        UserID:      req.UserID,
        ProjectID:   req.ProjectID,
        ActivityType: req.ActivityType,
        Duration:    req.Duration,
        Timestamp:   time.Now(),
        Metadata:    req.Metadata,
    }
    
    err := h.commandBus.Dispatch(c.Request.Context(), cmd)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    // Invalidar caché relacionada
    cacheKeys := []string{
        fmt.Sprintf("user_activity:%s:day", req.UserID),
        fmt.Sprintf("user_activity:%s:week", req.UserID),
        fmt.Sprintf("user_activity:%s:month", req.UserID),
    }
    
    for _, key := range cacheKeys {
        if err := h.cache.Delete(c.Request.Context(), key); err != nil {
            log.Printf("Failed to invalidate cache key %s: %v", key, err)
        }
    }
    
    c.Status(http.StatusCreated)
}
```

**Caché a Nivel de Repositorio**:

```go
// internal/report/infrastructure/persistence/mongodb/report_repository.go
package mongodb

import (
    "context"
    "time"
    "myapp/pkg/cache"
)

// CachedReportRepository añade caché al repositorio de reportes
type CachedReportRepository struct {
    repo  ReportRepository
    cache cache.Cache
}

// GetUserActivityStats obtiene estadísticas de actividad con caché
func (r *CachedReportRepository) GetUserActivityStats(ctx context.Context, userID string, fromDate, toDate time.Time) (*ActivityStats, error) {
    cacheKey := fmt.Sprintf("activity_stats:%s:%s:%s", userID, fromDate.Format("2006-01-02"), toDate.Format("2006-01-02"))
    
    var stats ActivityStats
    found, err := r.cache.Get(ctx, cacheKey, &stats)
    if err != nil {
        log.Printf("Cache error: %v", err)
    }
    
    if found {
        return &stats, nil
    }
    
    // Obtener de la base de datos
    stats, err := r.repo.GetUserActivityStats(ctx, userID, fromDate, toDate)
    if err != nil {
        return nil, err
    }
    
    // Guardar en caché (expira en 30 minutos)
    err = r.cache.Set(ctx, cacheKey, stats, 30*time.Minute)
    if err != nil {
        log.Printf("Failed to cache result: %v", err)
    }
    
    return stats, nil
}
```

## Logging y Monitoreo

### Implementación de Logger

```go
// pkg/logger/logger.go
package logger

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

// Logger define la interfaz para logging
type Logger interface {
    Debug(msg string, fields ...Field)
    Info(msg string, fields ...Field)
    Warn(msg string, fields ...Field)
    Error(msg string, fields ...Field)
    Fatal(msg string, fields ...Field)
    With(fields ...Field) Logger
}

// Field representa un campo de log estructurado
type Field = zapcore.Field

// Constantes y funciones para crear campos
var (
    String = zap.String
    Int    = zap.Int
    Bool   = zap.Bool
    Error  = zap.Error
    Any    = zap.Any
)

// ZapLogger implementa Logger usando zap
type ZapLogger struct {
    logger *zap.Logger
}

// NewLogger crea un nuevo logger
func NewLogger(production bool) (Logger, error) {
    var logger *zap.Logger
    var err error
    
    if production {
        logger, err = zap.NewProduction()
    } else {
        logger, err = zap.NewDevelopment()
    }
    
    if err != nil {
        return nil, err
    }
    
    return &ZapLogger{logger: logger}, nil
}

// Debug registra un mensaje a nivel Debug
func (l *ZapLogger) Debug(msg string, fields ...Field) {
    l.logger.Debug(msg, fields...)
}

// Info registra un mensaje a nivel Info
func (l *ZapLogger) Info(msg string, fields ...Field) {
    l.logger.Info(msg, fields...)
}

// Warn registra un mensaje a nivel Warn
func (l *ZapLogger) Warn(msg string, fields ...Field) {
    l.logger.Warn(msg, fields...)
}

// Error registra un mensaje a nivel Error
func (l *ZapLogger) Error(msg string, fields ...Field) {
    l.logger.Error(msg, fields...)
}

// Fatal registra un mensaje a nivel Fatal
func (l *ZapLogger) Fatal(msg string, fields ...Field) {
    l.logger.Fatal(msg, fields...)
}

// With crea un nuevo logger con campos adicionales
func (l *ZapLogger) With(fields ...Field) Logger {
    return &ZapLogger{logger: l.logger.With(fields...)}
}
```

### Middleware de Logging para Gin

```go
// internal/common/infrastructure/http/middleware/logger.go
package middleware

import (
    "time"
    "github.com/gin-gonic/gin"
    "myapp/pkg/logger"
)

// RequestLogger middleware que registra información de las peticiones
func RequestLogger(log logger.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        method := c.Request.Method
        
        // Ejecutar el handler
        c.Next()
        
        // Registrar después de la respuesta
        duration := time.Since(start)
        status := c.Writer.Status()
        
        // Log a nivel adecuado según el estado HTTP
        if status >= 500 {
            log.Error("Request failed",
                logger.String("path", path),
                logger.String("method", method),
                logger.Int("status", status),
                logger.String("duration", duration.String()),
                logger.String("ip", c.ClientIP()),
                logger.String("user-agent", c.Request.UserAgent()),
            )
        } else if status >= 400 {
            log.Warn("Request error",
                logger.String("path", path),
                logger.String("method", method),
                logger.Int("status", status),
                logger.String("duration", duration.String()),
                logger.String("ip", c.ClientIP()),
            )
        } else {
            log.Info("Request completed",
                logger.String("path", path),
                logger.String("method", method),
                logger.Int("status", status),
                logger.String("duration", duration.String()),
            )
        }
    }
}
```

### Integración con Métricas

```go
// pkg/metrics/prometheus.go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

// MetricsService proporciona métodos para registrar métricas
type MetricsService struct {
    requestCounter  *prometheus.CounterVec
    requestDuration *prometheus.HistogramVec
    activeSessions  prometheus.Gauge
}

// NewMetricsService crea un nuevo servicio de métricas
func NewMetricsService() *MetricsService {
    requestCounter := promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "app_http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "path", "status"},
    )
    
    requestDuration := promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "app_http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "path"},
    )
    
    activeSessions := promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "app_active_sessions",
            Help: "Number of active user sessions",
        },
    )
    
    return &MetricsService{
        requestCounter:  requestCounter,
        requestDuration: requestDuration,
        activeSessions:  activeSessions,
    }
}

// RecordRequest registra una petición HTTP
func (m *MetricsService) RecordRequest(method, path string, status int) {
    m.requestCounter.WithLabelValues(method, path, fmt.Sprintf("%d", status)).Inc()
}

// ObserveRequestDuration registra la duración de una petición
func (m *MetricsService) ObserveRequestDuration(method, path string, duration float64) {
    m.requestDuration.WithLabelValues(method, path).Observe(duration)
}

// SetActiveSessions actualiza el contador de sesiones activas
func (m *MetricsService) SetActiveSessions(count int) {
    m.activeSessions.Set(float64(count))
}
```

## Configuración y Variables de Entorno

### Gestión de Configuración

```go
// pkg/config/config.go
package config

import (
    "os"
    "strconv"
    "time"
    "github.com/joho/godotenv"
)

// Config contiene la configuración de la aplicación
type Config struct {
    Server   ServerConfig
    MongoDB  MongoDBConfig
    Postgres PostgresConfig
    Redis    RedisConfig
    JWT      JWTConfig
    Log      LogConfig
}

// ServerConfig contiene la configuración del servidor
type ServerConfig struct {
    Port         int
    ReadTimeout  time.Duration
    WriteTimeout time.Duration
}

// MongoDBConfig contiene la configuración de MongoDB
type MongoDBConfig struct {
    URI      string
    Database string
    Username string
    Password string
    Timeout  time.Duration
}

// PostgresConfig contiene la configuración de PostgreSQL
type PostgresConfig struct {
    Host     string
    Port     int
    Database string
    Username string
    Password string
    SSLMode  string
}

// RedisConfig contiene la configuración de Redis
type RedisConfig struct {
    Addr     string
    Password string
    DB       int
}

// JWTConfig contiene la configuración JWT
type JWTConfig struct {
    Secret        string
    ExpirationMin int
}

// LogConfig contiene la configuración del logger
type LogConfig struct {
    Level      string
    Production bool
}

// Load carga la configuración desde variables de entorno
func Load() (*Config, error) {
    // Cargar .env si existe
    _ = godotenv.Load()
    
    return &Config{
        Server: ServerConfig{
            Port:         getEnvAsInt("SERVER_PORT", 8080),
            ReadTimeout:  time.Duration(getEnvAsInt("SERVER_READ_TIMEOUT", 10)) * time.Second,
            WriteTimeout: time.Duration(getEnvAsInt("SERVER_WRITE_TIMEOUT", 10)) * time.Second,
        },
        MongoDB: MongoDBConfig{
            URI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
            Database: getEnv("MONGODB_DATABASE", "myapp"),
            Username: getEnv("MONGODB_USERNAME", ""),
            Password: getEnv("MONGODB_PASSWORD", ""),
            Timeout:  time.Duration(getEnvAsInt("MONGODB_TIMEOUT", 10)) * time.Second,
        },
        Postgres: PostgresConfig{
            Host:     getEnv("POSTGRES_HOST", "localhost"),
            Port:     getEnvAsInt("POSTGRES_PORT", 5432),
            Database: getEnv("POSTGRES_DATABASE", "myapp"),
            Username: getEnv("POSTGRES_USERNAME", "postgres"),
            Password: getEnv("POSTGRES_PASSWORD", ""),
            SSLMode:  getEnv("POSTGRES_SSLMODE", "disable"),
        },
        Redis: RedisConfig{
            Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
            Password: getEnv("REDIS_PASSWORD", ""),
            DB:       getEnvAsInt("REDIS_DB", 0),
        },
        JWT: JWTConfig{
            Secret:        getEnv("JWT_SECRET", "your-secret-key"),
            ExpirationMin: getEnvAsInt("JWT_EXPIRATION_MIN", 60),
        },
        Log: LogConfig{
            Level:      getEnv("LOG_LEVEL", "info"),
            Production: getEnvAsBool("LOG_PRODUCTION", false),
        },
    }, nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
    valueStr := getEnv(key, "")
    if value, err := strconv.Atoi(valueStr); err == nil {
        return value
    }
    return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
    valueStr := getEnv(key, "")
    if value, err := strconv.ParseBool(valueStr); err == nil {
        return value
    }
    return defaultValue
}
```

## Estrategias de Migración

### Interfaz de Migración

```go
// pkg/migration/migrator.go
package migration

import "context"

// Migration define una migración individual
type Migration struct {
    Version     int
    Description string
    Up          func(ctx context.Context) error
    Down        func(ctx context.Context) error
}

// Migrator define una interfaz para realizar migraciones
type Migrator interface {
    Migrate(ctx context.Context) error
    Rollback(ctx context.Context, steps int) error
    Reset(ctx context.Context) error
    Status(ctx context.Context) ([]MigrationStatus, error)
}

// MigrationStatus representa el estado de una migración
type MigrationStatus struct {
    Version     int
    Description string
    Applied     bool
    AppliedAt   *time.Time
}
```

### Implementación de Migrador PostgreSQL

```go
// internal/common/infrastructure/persistence/postgres/migrator.go
package postgres

import (
    "context"
    "database/sql"
    "fmt"
    "sort"
    "time"
    "gorm.io/gorm"
    "myapp/pkg/migration"
)

// PostgresMigrator implementa el migrador para PostgreSQL
type PostgresMigrator struct {
    db         *gorm.DB
    migrations []migration.Migration
}

// NewMigrator crea un nuevo migrador de PostgreSQL
func NewMigrator(db *gorm.DB, migrations []migration.Migration) *PostgresMigrator {
    return &PostgresMigrator{
        db:         db,
        migrations: migrations,
    }
}

// Migrate ejecuta las migraciones pendientes
func (m *PostgresMigrator) Migrate(ctx context.Context) error {
    // Asegurar que existe la tabla de migraciones
    err := m.ensureMigrationTable()
    if err != nil {
        return err
    }
    
    // Obtener migraciones aplicadas
    appliedMigrations, err := m.getAppliedMigrations()
    if err != nil {
        return err
    }
    
    // Ordenar migraciones por versión
    sort.Slice(m.migrations, func(i, j int) bool {
        return m.migrations[i].Version < m.migrations[j].Version
    })
    
    // Aplicar migraciones pendientes
    for _, migration := range m.migrations {
        if _, applied := appliedMigrations[migration.Version]; !applied {
            // Iniciar transacción
            err := m.db.Transaction(func(tx *gorm.DB) error {
                // Ejecutar migración
                if err := migration.Up(ctx); err != nil {
                    return err
                }
                
                // Registrar migración como aplicada
                return tx.Exec(
                    "INSERT INTO migrations (version, description, applied_at) VALUES (?, ?, ?)",
                    migration.Version, migration.Description, time.Now(),
                ).Error
            })
            
            if err != nil {
                return fmt.Errorf("failed to apply migration %d: %w", migration.Version, err)
            }
            
            fmt.Printf("Applied migration %d: %s\n", migration.Version, migration.Description)
        }
    }
    
    return nil
}

// Métodos adicionales para ensureMigrationTable, getAppliedMigrations, Rollback, Reset, Status...
```

## Seguridad y Rate Limiting

### Rate Limiting con Redis

```go
// internal/common/infrastructure/http/middleware/rate_limiter.go
package middleware

import (
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    "golang.org/x/time/rate"
    "sync"
)

// IPRateLimiter es un limitador de tasa basado en IP
type IPRateLimiter struct {
    ips    map[string]*rate.Limiter
    mu     sync.RWMutex
    rate   rate.Limit
    burst  int
    ttl    time.Duration
    client *redis.Client
}

// NewIPRateLimiter crea un nuevo limitador de tasa basado en IP
func NewIPRateLimiter(r rate.Limit, burst int, client *redis.Client) *IPRateLimiter {
    return &IPRateLimiter{
        ips:    make(map[string]*rate.Limiter),
        rate:   r,
        burst:  burst,
        ttl:    time.Hour,
        client: client,
    }
}

// RateLimit middleware que limita las peticiones por IP
func RateLimit(limiter *IPRateLimiter) gin.HandlerFunc {
    return func(c *gin.Context) {
        ip := c.ClientIP()
        
        // Intentar incrementar contador en Redis
        key := fmt.Sprintf("ratelimit:%s", ip)
        ctx := c.Request.Context()
        
        val, err := limiter.client.Get(ctx, key).Int()
        if err != nil && err != redis.Nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "rate limiter unavailable"})
            c.Abort()
            return
        }
        
        if val >= limiter.burst {
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
            c.Abort()
            return
        }
        
        // Incrementar contador
        _, err = limiter.client.Incr(ctx, key).Result()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "rate limiter unavailable"})
            c.Abort()
            return
        }
        
        // Establecer TTL si es un nuevo key
        if val == 0 {
            limiter.client.Expire(ctx, key, limiter.ttl)
        }
        
        c.Next()
    }
}
```

### Seguridad de API

```go
// internal/common/infrastructure/http/middleware/security.go
package middleware

import (
    "github.com/gin-gonic/gin"
)

// Security middleware que establece encabezados de seguridad
func Security() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Prevenir clickjacking
        c.Header("X-Frame-Options", "DENY")
        
        // Prevenir MIME sniffing
        c.Header("X-Content-Type-Options", "nosniff")
        
        // Restringir referrers
        c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
        
        // Establecer Content Security Policy
        c.Header("Content-Security-Policy", "default-src 'self'")
        
        // Habilitar protección XSS
        c.Header("X-XSS-Protection", "1; mode=block")
        
        c.Next()
    }
}

// CORS middleware para configurar Cross-Origin Resource Sharing
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

## Rendimiento y Optimización

### Principios

1. **Optimiza después de medir**: Usa herramientas como `pprof` para identificar cuellos de botella reales.
2. **Eficiencia en estructuras de datos**: Elige las estructuras de datos adecuadas para cada caso de uso.
3. **Uso eficiente de la memoria**: Minimiza asignaciones innecesarias.

### Buenas Prácticas

**Evitar altas asignaciones de memoria**:

```go
// ✅ Bueno: Reutilizar buffer
var bufPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 0, 1024)
    },
}

func ProcessData(data []byte) []byte {
    buf := bufPool.Get().([]byte)
    buf = buf[:0] // Reset buffer
    
    // Usar buf para procesamiento
    
    result := make([]byte, len(buf))
    copy(result, buf)
    bufPool.Put(buf)
    return result
}

// ❌ Malo: Crear nuevos buffers constantemente
func ProcessData(data []byte) []byte {
    buf := make([]byte, 0, 1024)
    
    // Usar buf para procesamiento
    
    return buf
}
```

**Optimización de JSON**:

```go
// Structs optimizados para JSON
type User struct {
    ID        string `json:"id,omitempty"`
    Email     string `json:"email"`
    FirstName string `json:"first_name,omitempty"`
    LastName  string `json:"last_name,omitempty"`
    // Campos que no deben ser serializados
    Password  string `json:"-"`
}
```

**Optimización de bucles**:

```go
// ✅ Bueno: Iterar sobre slice de manera eficiente
for i := range items {
    // Procesar items[i]
}

// Para manipular el valor
for i, item := range items {
    // Procesar item (por valor)
}

// ❌ Malo: Innecesariamente ineficiente
for i := 0; i < len(items); i++ {
    item := items[i]
    // Procesar item
}
```