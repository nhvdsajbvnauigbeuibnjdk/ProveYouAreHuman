import { LevelDefinition, LevelType } from '../../data/LevelConfig';
import { BaseLevelController } from './BaseLevelController';
import { LevelFakeButton } from './controllers/LevelFakeButton';
import { LevelReverseSlider } from './controllers/LevelReverseSlider';
import { LevelSelectImage } from './controllers/LevelSelectImage';

type LevelControllerConstructor = new () => BaseLevelController;

export class LevelControllerFactory {
    private readonly registry = new Map<LevelType, LevelControllerConstructor>();

    public register(levelType: LevelType, controllerCtor: LevelControllerConstructor): void {
        this.registry.set(levelType, controllerCtor);
    }

    public create(levelConfig: LevelDefinition): BaseLevelController {
        const controllerCtor = this.registry.get(levelConfig.type);

        if (!controllerCtor) {
            throw new Error(`No level controller registered for level type "${levelConfig.type}".`);
        }

        return new controllerCtor();
    }
}

export const levelControllerFactory = new LevelControllerFactory();

levelControllerFactory.register(LevelType.SelectImage, LevelSelectImage);
levelControllerFactory.register(LevelType.FakeButton, LevelFakeButton);
levelControllerFactory.register(LevelType.ReverseSlider, LevelReverseSlider);
