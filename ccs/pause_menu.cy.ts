import { pauseFlowTestCases } from './docs'; // Just a placeholder structure if needed

describe('Flujo de Pausa y Reanudación del Juego', () => {

  beforeEach(() => {
    // Ingresar a la aplicación antes de cada prueba
    cy.visit('/');
  });

  it('Caso Positivo: Debería pausar el juego y permitir reanudarlo', () => {
    // 1. Iniciar el juego
    cy.contains('button', 'JUGAR').click();
    
    // Asumiendo que se debe seleccionar una categoría (por ejemplo: "ANIMALES")
    cy.contains('button', 'ANIMALES').click();

    // Validar que entramos jugando (el HUD, un elemento del tutorial o similar debe estar presente o al menos que el menú ya no esté)
    cy.contains('button', 'JUGAR').should('not.exist');

    // 2. Activar la pausa (presionando espacio a nivel de window)
    cy.window().trigger('keydown', { key: ' ' });

    // 3. Verificar que aparece el menú de pausa
    cy.contains('h2', '¡Pausa!').should('be.visible');
    
    // 4. Hacer clic en el botón de reanudar
    cy.contains('button', 'REANUDAR').click();

    // 5. Verificar que el menú desapareció
    cy.contains('h2', '¡Pausa!').should('not.exist');
  });

  it('Caso Negativo/Validación: Debería permitir regresar al menú principal desde la pausa', () => {
    // 1. Iniciar el juego
    cy.contains('button', 'JUGAR').click();
    cy.contains('button', 'ANIMALES').click();

    // 2. Activar la pausa
    cy.window().trigger('keydown', { key: ' ' });

    // 3. Verificar que aparece el menú de pausa
    cy.contains('h2', '¡Pausa!').should('be.visible');

    // 4. Seleccionar la opción de salir al menú principal
    cy.contains('button', 'Menú Principal').click();

    // 5. Validar que el usuario regresa al menú principal
    cy.contains('button', 'JUGAR').should('be.visible');
    cy.contains('h2', '¡Pausa!').should('not.exist');
  });

});
