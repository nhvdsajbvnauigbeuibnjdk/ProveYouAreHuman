import { SaveData } from '../../data/SaveData';

export interface FailCounterSnapshot {
    totalFailures: number;
    levelFailures: number;
    consecutiveFailures: number;
}

export class FailCounterSystem {
    public applyFailure(saveData: SaveData, levelId: number): FailCounterSnapshot {
        const levelProgress = saveData.levelProgress[levelId];

        saveData.stats.totalFailures += 1;
        saveData.stats.consecutiveFailures += 1;
        levelProgress.failureCount += 1;

        return {
            totalFailures: saveData.stats.totalFailures,
            levelFailures: levelProgress.failureCount,
            consecutiveFailures: saveData.stats.consecutiveFailures,
        };
    }

    public applySuccess(saveData: SaveData, levelId: number): FailCounterSnapshot {
        saveData.stats.consecutiveFailures = 0;
        this.resetLevelFailureCount(saveData, levelId);

        return {
            totalFailures: saveData.stats.totalFailures,
            levelFailures: this.getLevelFailureCount(saveData, levelId),
            consecutiveFailures: saveData.stats.consecutiveFailures,
        };
    }

    public resetLevelFailureCount(saveData: SaveData, levelId: number): void {
        const levelProgress = saveData.levelProgress[levelId];

        if (!levelProgress) {
            return;
        }

        levelProgress.failureCount = 0;
    }

    public getLevelFailureCount(saveData: Readonly<SaveData>, levelId: number): number {
        return saveData.levelProgress[levelId]?.failureCount ?? 0;
    }
}

export const failCounterSystem = new FailCounterSystem();
