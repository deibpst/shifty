
import { Model as CatModel } from '../../Cat';
import { Model as DogModel } from '../../Dog';
import { Model as ChickenModel } from '../../Chicken';
import { Model as HorseModel } from '../../Horse';
import { Model as PigModel } from '../../Pig';
import { Model as RaccoonModel } from '../../Raccoon';
import { Model as SheepModel } from '../../Sheep';
import { Model as WolfModel } from '../../Wolf';

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
        requiredScore: 50,
        description: 'Siempre fiel y listo para correr.'
    },
    {
        id: 'chicken_brave',
        name: 'Pollo Valiente',
        Component: ChickenModel,
        requiredScore: 100,
        description: 'No es una gallina normal.'
    },
    {
        id: 'horse_fast',
        name: 'Caballo Veloz',
        Component: HorseModel,
        requiredScore: 150,
        description: 'Nacido para la velocidad.'
    },
    {
        id: 'pig_happy',
        name: 'Cerdito Feliz',
        Component: PigModel,
        requiredScore: 200,
        description: 'Le encanta revolcarse en el lodo.'
    },
    {
        id: 'raccoon_sneaky',
        name: 'Mapache Astuto',
        Component: RaccoonModel,
        requiredScore: 250,
        description: 'Maestro del reciclaje nocturno.'
    },
    {
        id: 'sheep_fluffy',
        name: 'Oveja Suave',
        Component: SheepModel,
        requiredScore: 300,
        description: 'Suave como una nube.'
    },
    {
        id: 'wolf_wild',
        name: 'Lobo Salvaje',
        Component: WolfModel,
        requiredScore: 350,
        description: 'El rey del bosque.'
    }
];
