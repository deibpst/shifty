
import { Model as CatModel } from '../../Cat';
import { Model as DogModel } from '../../Dog';
import { Model as ChickModel } from '../../Chick';

// For now, allow any component, but typically they should follow the ModelProps interface
// We can use lazy loading if the bundle gets too big, but for < 10 components it's fine.

export const AVAILABLE_CHARACTERS = [
    {
        id: 'cat_default',
        name: 'Gato Curioso',
        Component: CatModel,
        requiredScore: 0,
        description: 'El clásico gato aventurero.'
    },
    {
        id: 'dog_loyal',
        name: 'Perro Leal',
        Component: DogModel,
        requiredScore: 50, // Easy unlock
        description: 'Siempre fiel y listo para correr.'
    },
    {
        id: 'chick_tiny',
        name: 'Pollito Valiente',
        Component: ChickModel,
        requiredScore: 200,
        description: 'Pequeño pero rápido.'
    }
];
