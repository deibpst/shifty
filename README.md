# Shifty — Eco Runner

Juego endless-runner 3D en el navegador donde una mascota corre por una pista dividida en carriles de colores y debe clasificar residuos (o estímulos psicológicos) en el contenedor correcto. Construido con React, Three.js y Vite.

> Documentación generada a partir de la rama `ben` (estado más avanzado del proyecto, con sistema MindShift, tutorial, personalización y categorías).

---

## 1. Stack técnico

- **Build / Dev:** Vite 5 + TypeScript 5
- **UI:** React 18 + TailwindCSS 3 + Framer Motion 11
- **3D:** three 0.160, @react-three/fiber 8, @react-three/drei 9
- **Estado:** Zustand 4 (single store en `src/store.ts`)
- **Persistencia:** `localStorage` (personaje seleccionado, puntaje acumulado, flag de tutorial visto)

Scripts (`package.json`):

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | `tsc -b` + `vite build` |
| `npm run lint` | ESLint sobre el proyecto |
| `npm run preview` | Preview del build |

---

## 2. Arquitectura de carpetas

```
src/
├── App.tsx                       # Router de overlays + listeners de teclado globales
├── main.tsx
├── store.ts                      # Estado global Zustand (juego, modo, tutorial, mindshift)
├── types.ts                      # Tipos + DIFFICULTY_CONFIG (2/3/4 carriles)
├── data/CharacterData.ts         # Catálogo de 9 personajes desbloqueables
├── components/
│   ├── GameScene.tsx             # Canvas R3F: luces, niebla, cámara, mundo
│   ├── Player/PlayerController.tsx
│   ├── World/
│   │   ├── Track.tsx             # Carriles con material emisivo (parpadeo en Fase 2)
│   │   ├── WasteManager.tsx      # Spawneo, movimiento, colisión
│   │   ├── WasteItem.tsx
│   │   ├── EnvironmentManager.tsx
│   │   ├── Flowers_1 / Grass_* / Skull / Tree_* .tsx
│   └── UI/
│       ├── MainMenu.tsx
│       ├── CategorySelect.tsx    # Garbage vs MindShift
│       ├── Customizer.tsx        # Selección/desbloqueo de personajes
│       ├── HUD.tsx               # Score, vidas, ítem actual, fase
│       ├── InstructionsModal.tsx
│       ├── TutorialOverlay.tsx   # 6 pasos guiados
│       └── PauseMenu.tsx
└── (Cat|Dog|Chick|Chicken|Horse|Pig|Raccoon|Sheep|Wolf).tsx   # Modelos GLTF
public/                           # Assets .gltf de personajes y escenario
```

---

## 3. Bucle de juego

1. `MainMenu` → botón **JUGAR** lleva a `CategorySelect`.
2. `CategorySelect` elige modo (`garbage` o `mindshift`) y, si nunca se vio, lanza el **tutorial** de 6 pasos.
3. `GameScene` monta el mundo 3D; `WasteManager` spawnea ítems en `z = -120` y los mueve hacia el jugador.
4. `PlayerController` interpola lateralmente entre carriles según `currentLane`.
5. Al colisionar (umbral 1.8), `processCollision(isCorrect, choseDistractor?)` actualiza puntaje, vidas, velocidad y genera el siguiente ítem.
6. 3 vidas perdidas → `gameover`.

### Controles

| Tecla | Acción |
|---|---|
| `A` / `←` | Carril 0 (Verde) |
| `S` / `↓` | Carril 1 (Azul) |
| `D` / `↑` | Carril 2 (Amarillo) |
| `F` / `→` | Carril 3 (Rojo) |
| `Espacio` | Pausa / Reanudar |

Listeners definidos en `src/App.tsx`. El movimiento solo se procesa en `gameStatus === 'playing'` o en el paso 3 del tutorial.

---

## 4. Modos de juego

### 4.1 Garbage (clasificación de residuos)

- **32 ítems** distribuidos en 4 categorías (`src/store.ts → WASTE_ITEMS`):
  - **Verde — Orgánico** (8): plátano, manzana, huevo, pescado, sandía, hojas, zanahoria, pan.
  - **Azul — Papel/Plástico** (8): periódico, botella, envoltura, cartón de leche, caja, bolsa, yogur, hoja.
  - **Amarillo — Metal/PET** (8): latas (refresco, sopa, atún), aluminio, tapas, spray, herramientas, tubería.
  - **Rojo — Peligrosos** (8): pila, bombilla, jeringa, pastillas, pintura, termómetro, móvil, insecticida.
- Aciertos: **+10 puntos**, velocidad +0.05 (cap 2.0), nuevo ítem aleatorio.
- Errores: −1 vida.

### 4.2 MindShift (psicología / control de impulsos)

Modo experimental con **3 fases** de 10 jugadas cada una, generadas en `generateMindshiftItem`:

| Fase | Estímulo | Mecánica |
|---|---|---|
| 1 | Emoji de emoción (FELIZ, TRISTE, ENOJADO, MIEDO, SORPRESA) | Carril correcto asignado al azar — mide reacción base |
| 2 | Texto "VE AL CARRIL X" | Un carril distractor parpadea (material emisivo en `Track.tsx`) — mide control inhibitorio |
| 3 | Emoji positivo o negativo | Positivo → carril 0; Negativo → carril 3 — clasifica valencia |

- Cada jugada registra `MindshiftStatItem` con `phase`, `isCorrect`, `reactionTime` (ms desde spawn), `choseDistractor`, `emotion`.
- **Reporte oculto:** en pantalla `gameover` del modo MindShift, escribir `psi2025` muestra el reporte psicológico completo (`App.tsx` líneas del listener `handleGlobalKeyDown`).

---

## 5. Dificultad

`DIFFICULTY_CONFIG` en `src/types.ts`:

| Nivel | Carriles | Colores |
|---|---|---|
| `easy` | 2 | verde, azul |
| `medium` | 3 | verde, azul, amarillo |
| `hard` (por defecto) | 4 | verde, azul, amarillo, rojo |

Velocidad inicial `0.6`, incremento `+0.05` por acierto, máximo `2.0`.

---

## 6. Personajes

`src/data/CharacterData.ts` — 9 mascotas con desbloqueo por puntaje acumulado (`shifty_total_score` en localStorage):

| Personaje | Score requerido |
|---|---|
| Gato Curioso | 0 |
| Perro Leal | 50 |
| Pollo Valiente | 100 |
| Caballo Veloz | 150 |
| Cerdito Feliz | 200 |
| Mapache Astuto | 250 |
| Oveja Suave | 300 |
| Lobo Salvaje | 350 |
| Pollito Tiny | 400 |

Modelos GLTF en `public/`. `PlayerController` cambia de animación (`Run`, `Jump_Loop`, `Death`) según deltas en score y vidas.

---

## 7. Estado persistido (localStorage)

| Clave | Uso |
|---|---|
| `shifty_selected_character` | ID del personaje activo |
| `shifty_total_score` | Puntaje acumulado para desbloqueo |
| `shifty_tutorial_seen` | Flag para no repetir el tutorial |

---

## 8. Historial reciente de la rama `ben`

```
fef1b1f  creación de categoría para psicología y corrección de bugs
e0b9433  prueba
eaec37c  nueva rama
a7e8e48  Ajuste en el tutorial
fcf7ced  Cambio en la posición de modelos en tarjetas de selección
13ab9cb  Arreglo de perspectiva en mascotas
7ab5c30  Se arregló el menú de mascotas
c7ea080  Color del botón home del menú de pausa
94724ae  Ajuste de botón de pausa
f11a450  Densidad de elementos en el mapa
fa4fd29  Sombras
126f440  Perspectiva de los carriles
f0ac4a4  Escenario generado
b523d38  Objetos de escenario agregados
e336865  Aumento de velocidad
b4aba7b  Control 1
2ba3a81  Cambio de colores
78d0cf1  Obstáculo arreglado
36a1ab9  Obstáculos actualizados
35d27ed  Último personaje agregado
```

---

## 9. Cómo correr localmente

```bash
npm install
npm run dev
```

Abrir el puerto que indique Vite (por defecto `http://localhost:5173`).
