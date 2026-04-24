<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1e3084c7-1ca2-47d7-9766-9bf56d4f73c1

## Run Locally

**Prerequisites:**  
Node.js (v18 o superior) → https://nodejs.org
Python (v3.10 o superior) → https://python.org


1. Terminal 1 - Backend:
   `cd backend`
   `pip install -r requirements.txt`
   `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
   Esperar hasta ver:
   Application startup complete.

2. Terminal 2 - Frontend:
   `cd frontend`
   `npm install`
   `npm run dev`
   Esperar hasta ver algo como:
   Local: http://localhost:3000/

3. Abrir en el navegador
Ir a: http://localhost:3000

(Si el puerto 3000 está ocupado, Vite mostrará otro número, por ejemplo 3001.)