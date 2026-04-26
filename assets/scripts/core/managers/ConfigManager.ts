import { JUDGE_TEXT_CONFIG_LIST, JudgeTextDefinition } from '../../data/JudgeTextConfig';
import { LEVEL_CONFIG_LIST, LevelDefinition } from '../../data/LevelConfig';

export class ConfigManager {
    private readonly levelMap = new Map<number, LevelDefinition>();
    private readonly judgeTextMap = new Map<string, JudgeTextDefinition>();
    private initialized = false;

    public initialize(): void {
        if (this.initialized) {
            return;
        }

        LEVEL_CONFIG_LIST.forEach((config) => {
            this.levelMap.set(config.id, config);
        });

        JUDGE_TEXT_CONFIG_LIST.forEach((config) => {
            this.judgeTextMap.set(config.id, config);
        });

        this.initialized = true;
    }

    public getAllLevels(): LevelDefinition[] {
        return Array.from(this.levelMap.values()).sort((left, right) => left.id - right.id);
    }

    public getLevel(levelId: number): LevelDefinition | null {
        return this.levelMap.get(levelId) ?? null;
    }

    public getNextLevel(levelId: number): LevelDefinition | null {
        const levels = this.getAllLevels();
        const currentIndex = levels.findIndex((item) => item.id === levelId);

        if (currentIndex < 0 || currentIndex >= levels.length - 1) {
            return null;
        }

        return levels[currentIndex + 1];
    }

    public getJudgeText(id: string): JudgeTextDefinition | null {
        return this.judgeTextMap.get(id) ?? null;
    }

    public getLevelCount(): number {
        return this.levelMap.size;
    }
}
