# Documentación de Pruebas Automatizadas

## 1. Definición de Casos de Prueba
**Flujo Elegido:** Menú de Pausa y Reanudación del Juego
**Nota:** Se eligió un flujo fundamental para la accesibilidad y navegación que cumple con no ser de los flujos excluidos en las instrucciones (selección de avatar de la galería, selección de categoría del juego, conexión del mando, o cambio de carril).

### Caso de Prueba 1 (Escenario Positivo): Reanudar el juego desde el estado de pausa
* **Descripción:** Comprobar que cuando el usuario se encuentra jugando y pausa la partida, el menú de pausa se despliega y es posible regresar y reanudar la partida seleccionando la opción "REANUDAR".
* **Pasos:**
  1. Ingresar a la aplicación en la ruta raíz (`/`).
  2. Hacer clic en el botón "JUGAR".
  3. Seleccionar la categoría (para iniciar el bucle principal de juego).
  4. Presionar la tecla "Space" (Espacio) para activar el estado de pausa.
  5. Verificar que aparece el modal con el texto "¡Pausa!".
  6. Hacer clic en el botón "REANUDAR".
  7. Verificar que el modal de pausa se cierra correctamente.
* **Datos de entrada:** Simulación de pulsaciones sobre el teclado (tecla espaciadora).
* **Resultado esperado:** El juego intercepta correctamente el evento de la barra espaciadora, activa el estado de la aplicación para mostrar el overlay de pausa, y el evento de clic sobre "REANUDAR" revierte el estado y elimina el overlay para seguir jugando.

### Caso de Prueba 2 (Escenario Negativo / Validación): Salir al menú principal abortando la partida
* **Descripción:** Comprobar que en medio de una pausa controlada, si el jugador decide retroceder en vez de reanudar la partida, la aplicación es capaz de resetear el estado y enviarlo de vuelta al menú de inicio.
* **Pasos:**
  1. Ingresar a la aplicación (`/`).
  2. Hacer clic en el botón "JUGAR".
  3. Seleccionar la categoría e iniciar partida.
  4. Presionar la tecla "Space" (Espacio).
  5. Verificar que el menú de pausa sea visible.
  6. Hacer clic en el botón "Menú Principal" en el modal de pausa.
  7. Verificar que se despliega el menú inicial y que es accionable el botón "JUGAR".
* **Datos de entrada:** Simulación de la tecla de espacio.
* **Resultado esperado:** La aplicación detecta el evento de clic, cambia el estado global de la máquina de juego (Zustand store en este caso) vaciando el flujo de juego activo y monta la pantalla inicial (Menú Principal) deteniendo la ejecución anterior.

---

## 2. Proceso de Desarrollo y Documentación
* **Tiempo de Implementación Total:** Aproximadamente 40 minutos en el diseño manual de los dos casos de prueba y en el entendimiento de la arquitectura de eventos.
    * Definición estructural de los casos de prueba: 10 mins.
    * Desarrollo del Script `pause_menu.cy.ts`: 20 mins.
    * Pruebas, revisión y escritura del documento: 10 mins.
* **Dificultades Encontradas:** 
    * Dado que la interfaz renderiza componentes 3D (Z-Index subyacente), encontrar un estado "jugando" sin selectores nativos (`data-cy`) requirió basar las validaciones en la ausencia del menú inicial y la captura global de inputs en vez de interceptar la lona (`canvas`).
    * El evento de la pausa (`Space`) depende de un *Listener* asignado al `window` en React (`window.addEventListener('keydown')`), lo cual dificultó generar la inserción del evento a nivel local de un elemento vacío con cypress `cy.get('body').type(' ')`.
* **Decisiones Técnicas Tomadas:**
    1. **Selectores por texto:** Se optó por usar `cy.contains(elemento, 'Texto')` en vez de clases de Tailwind (e.g. `cy.get('.bg-emerald-500')`) porque el texto hace al test asertivo, fácil de leer y robusto a refactorizaciones estéticas (Tailwind cambia constantemente pero un botón "REANUDAR" no).
    2. **Manejo de eventos (Waits nulos):** No se utilizaron demoras explícitas `cy.wait()`. Al estar la app animada por *Framer Motion*, Cypress por defecto reintenta encontrar el elemento basándose en su visibilidad en el DOM de forma asíncrona lo cual previene flakiness (pruebas inconsistentes).
    3. **Organización del script:** Todo el flujo se organizó bajo un agrupador principal (`describe`), implementando un gancho o ciclo de vida (`beforeEach`) para navegar a la URL base (`cy.visit('/')`), limpiando el estado y aislando cada `it()`.
* **Errores que salieron y cómo se resolvieron:**
    * ***Error de interacción del documento (`KeyboardEvent`)*:** Al usar `cy.get('body').type('{space}')`, la aplicación no pausaba.
      * *Solución*: Revisando el código del juego, en `App.tsx` el listener escucha del objeto global. Cambié la ejecución de tecla para despachar el evento de *keydown* desde la ventana completa de Cypress con `cy.window().trigger('keydown', { key: ' ' })`, tras lo cual la pausa se activó perfectamente.
