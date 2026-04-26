import { director } from 'cc';
import { GameSceneId } from '../../data/GameConst';

export class SceneManager {
    private currentScene: GameSceneId = GameSceneId.Prototype;

    public initialize(initialScene: GameSceneId): void {
        this.currentScene = initialScene;
    }

    public getCurrentScene(): GameSceneId {
        return this.currentScene;
    }

    public loadScene(sceneId: GameSceneId, callback?: () => void): void {
        if (sceneId === this.currentScene) {
            callback?.();
            return;
        }

        director.loadScene(sceneId, (error) => {
            if (error) {
                console.error(`[SceneManager] Failed to load scene: ${sceneId}`, error);
                return;
            }

            this.currentScene = sceneId;
            callback?.();
        });
    }
}
