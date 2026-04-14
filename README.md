# 🎰 Ritsino — Scatter de Casino Universitario

Aplicación web tipo máquina scatter (6×5) para entorno universitario. Sin fines lucrativos.

## 🚀 Quick Start

```bash
# Levantar todo con Docker
docker compose up --build

# Acceder a la app
open http://localhost:3000
```

## 📋 Características

- **Máquina Scatter 6×5** con 8 símbolos + scatter especial
- **Sistema de puntos**: 10.000 iniciales, 1.000 de rescate
- **Rankings**: Por universidad, global y ranking de universidades
- **50 universidades españolas** con Ingeniería Informática
- **Imágenes personalizables** en `client/public/symbols/`

## 🏗️ Tecnologías

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + PL/pgSQL
- **Despliegue**: Docker Compose

## 🎨 Personalizar Símbolos

Coloca tus imágenes en `client/public/symbols/`:
- `symbol_1.png` a `symbol_8.png`
- `scatter.png`

## 🐳 Comandos Docker

```bash
docker compose up --build        # Levantar
docker compose up -d --build     # En segundo plano
docker compose down              # Detener
docker compose down -v           # Reset completo
docker compose logs -f           # Ver logs
```

## 📁 Estructura

```
├── client/          # React frontend
├── server/          # Node.js API
├── database/        # SQL scripts
└── docker-compose.yml
```
