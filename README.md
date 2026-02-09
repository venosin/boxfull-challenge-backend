# Boxful Challenge - Backend API

API RESTful desarrollada con **NestJS**, **Prisma** y **MongoDB** para la gestión de órdenes de envío, autenticación segura y cálculo automatizado de liquidaciones financieras.

## Tecnologías
- **Framework:** NestJS
- **Database:** MongoDB
- **ORM:** Prisma
- **Auth:** JWT (JSON Web Tokens)
- **Validation:** Class-validator & Class-transformer

## Configuración e Instalación

### 1. Requisitos Previos
- Node.js (v18 o superior)
- MongoDB (URI de conexión)

### 2. Instalación
```bash
# Entrar al directorio del backend
cd boxfull-challenge-backend

# Instalar dependencias
npm install
-------------------------------------------------------------------------------------------

# VARIABLES DE ENTORNO

# Conexión a MongoDB (Reemplaza con tu propia URI)
DATABASE_URL="mongodb+srv://steven:@cluster0.uxkyy.mongodb.net/boxful?retryWrites=true&w=majority"

# Clave para firmar los tokens JWT
JWT_SECRET="tilinpalacios"

# Puerto del servidor
PORT=3000

-------------------------------------------------------------------------------------------

# Base de datos y semillas

# 1. Generar el cliente de Prisma
npx prisma generate

# 2. Sincronizar el esquema con la base de datos
npx prisma db push

# 3. Sembrar datos de configuración (Precios del día)
npx prisma db seed

# Iniciar el servidor
npm run start:dev
-------------------------------------------------------------------------------------------

## Validación de Lógica de Liquidación (Punto Extra)

El sistema implementa un cálculo automático de liquidación que se ejecuta únicamente cuando una orden cambia su estado a DELIVERED. A continuación se detallan los pasos para validar este flujo de negocio.

### 1. Creación de la Orden
Desde el Dashboard, genere una nueva orden habilitando la opción "Pago contra entrega" (COD).
* **Estado inicial esperado:** PENDING
* **Liquidación inicial esperada:** $ 0.00 (Pendiente)

### 2. Obtención del ID
Copie el ID único de la orden recién creada. Este dato puede obtenerse desde la URL del navegador, la consola de desarrollo o la respuesta de la red.

### 3. Simulación de Entrega (Webhook)
Para disparar el cálculo de liquidación, se debe simular el evento de entrega por parte del operador logístico utilizando uno de los siguientes métodos:

#### Opción A: Vía Terminal (cURL)
Ejecute el siguiente comando en su terminal, asegurándose de reemplazar `PEGA_AQUI_EL_ID` por el ID real de la orden:

```bash
curl -X POST http://localhost:3000/orders/webhook -H "Content-Type: application/json" -d "{\"orderId\": \"PEGA_AQUI_EL_ID\", \"status\": \"DELIVERED\", \"collectedAmount\": 200}"

### Opción Alternativa: Probar con Postman

Si prefieres usar interfaz gráfica en lugar de terminal:

1.  **Método:** Selecciona `POST`.
2.  **URL:** `http://localhost:3000/orders/webhook`
3.  **Headers:** (Generalmente automático, pero verifica) `Content-Type: application/json`.
4.  **Body:**
    * Ve a la pestaña **Body**.
    * Selecciona **raw**.
    * En el dropdown azul selecciona **JSON**.
    * Pega el siguiente objeto:

```json
{
  "orderId": "PEGA_AQUI_EL_ID_DE_LA_ORDEN",
  "status": "DELIVERED",
  "collectedAmount": 200
}

-------------------------------------------------------------------------------------------
# Extras y mejoras # 

Se implementaron funcionalidades adicionales para garantizar robustez y escalabilidad:

Resiliencia y Auto-Recuperación (Fail-safe):

Se implementó lógica defensiva en OrdersService. Si la base de datos no tiene configuración de precios para el día actual (por error humano u olvido de Seeds), el sistema autogenera una configuración válida basada en reglas de negocio (precios diferenciados para Fines de Semana vs Días de Semana) sin interrumpir el flujo.

Lógica de Negocio Compleja (Liquidación):

Implementación total del cálculo en el endpoint /webhook.

Descuento automático de costos de envío variables según el día.

Cálculo de comisiones sobre COD (0.01%).

Validación de estado para evitar doble liquidación.

Localización de Errores (UX):

Intercepción de excepciones estándar de NestJS para devolver mensajes claros y descriptivos en Español al cliente.

Seeders Automatizados:

Scripts de prisma db seed incluidos para facilitar el despliegue inicial.
