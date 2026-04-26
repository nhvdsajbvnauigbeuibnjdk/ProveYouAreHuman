import { sys } from 'cc';
import {
    LevelResultType,
    SAVE_STORAGE_KEY,
} from '../../data/GameConst';
import { LevelDefinition } from '../../data/LevelConfig';
import {
    AudioSettingsData,
    createDefaultSaveData,
    LevelProgressData,
    SaveData,
} from '../../data/SaveData';
import { LevelValidationResult } from '../../gameplay/levels/LevelControllerTypes';
import { failCounterSystem } from '../../gameplay/systems/FailCounterSystem';
import { humanScoreSystem } from '../../gameplay/systems/HumanScoreSystem';

export interface AppliedLevelResultSummary {
    humanScore: number;
    humanScoreDelta: number;
    humanScoreDescription: string;
    totalFailures: number;
    levelFailures: number;
    consecutiveFailures: number;
    isFirstClear: boolean;
}

export class SaveManager {
    private saveData: SaveData | null = null;

    public constructor(private readonly getLevelCount: () => number) {}

    public initialize(): void {
        const rawValue = sys.localStorage.getItem(SAVE_STORAGE_KEY);

        if (!rawValue) {
            this.saveData = createDefaultSaveData(this.getLevelCount());
            this.persist();
            return;
        }

        try {
            const parsed = JSON.parse(rawValue) as Partial<SaveData>;
            this.saveData = this.hydrate(parsed);
        } catch (error) {
            console.warn('[SaveManager] Save data is broken. Reset to default.', error);
            this.saveData = createDefaultSaveData(this.getLevelCount());
        }

        this.persist();
    }

    public getSaveData(): Readonly<SaveData> {
        return this.requireData();
    }

    public selectLevel(levelId: number): void {
        const saveData = this.requireData();
        const safeLevelId = Math.max(1, Math.min(levelId, saveData.highestUnlockedLevelId));
        saveData.selectedLevelId = safeLevelId;
        this.persist();
    }

    public applySettings(settings: AudioSettingsData): void {
        const saveData = this.requireData();
        saveData.settings = { ...settings };
        this.persist();
    }

    public applyLevelResult(level: LevelDefinition, result: LevelValidationResult): AppliedLevelResultSummary {
        const saveData = this.requireData();
        const levelCount = this.getLevelCount();
        const levelRecord = this.ensureLevelRecord(level.id);
        const isFirstClear = result.resultType === LevelResultType.Success && !levelRecord.cleared;

        saveData.stats.totalAttempts += 1;
        levelRecord.lastResult = result.resultType;

        if (result.resultType === LevelResultType.Success) {
            levelRecord.cleared = true;
            levelRecord.clearCount += 1;
            saveData.stats.totalClears += 1;

            const nextLevelId = Math.min(level.id + 1, levelCount);
            saveData.highestUnlockedLevelId = Math.max(saveData.highestUnlockedLevelId, nextLevelId);
            saveData.selectedLevelId = nextLevelId;

            if (level.id < levelCount) {
                this.ensureLevelRecord(level.id + 1).unlocked = true;
            }
        } else {
            saveData.selectedLevelId = level.id;
        }

        const failSnapshot = result.resultType === LevelResultType.Success
            ? failCounterSystem.applySuccess(saveData, level.id)
            : failCounterSystem.applyFailure(saveData, level.id);
        const humanScoreUpdate = humanScoreSystem.applyResult({
            currentScore: saveData.stats.humanScore,
            resultType: result.resultType,
            isFirstClear,
            consecutiveFailures: failSnapshot.consecutiveFailures,
        });

        saveData.stats.humanScore = humanScoreUpdate.nextScore;
        this.persist();

        return {
            humanScore: saveData.stats.humanScore,
            humanScoreDelta: humanScoreUpdate.delta,
            humanScoreDescription: humanScoreUpdate.description,
            totalFailures: failSnapshot.totalFailures,
            levelFailures: failSnapshot.levelFailures,
            consecutiveFailures: failSnapshot.consecutiveFailures,
            isFirstClear,
        };
    }

    public getLevelFailureCount(levelId: number): number {
        return failCounterSystem.getLevelFailureCount(this.requireData(), levelId);
    }

    public resetLevelFailureCount(levelId: number): void {
        failCounterSystem.resetLevelFailureCount(this.requireData(), levelId);
        this.persist();
    }

    public reset(): void {
        this.saveData = createDefaultSaveData(this.getLevelCount());
        this.persist();
    }

    private requireData(): SaveData {
        if (!this.saveData) {
            throw new Error('SaveManager is not initialized.');
        }

        return this.saveData;
    }

    private ensureLevelRecord(levelId: number): LevelProgressData {
        const saveData = this.requireData();

        if (!saveData.levelProgress[levelId]) {
            saveData.levelProgress[levelId] = {
                levelId,
                unlocked: levelId === 1,
                cleared: false,
                clearCount: 0,
                failureCount: 0,
                lastResult: LevelResultType.None,
            };
        }

        return saveData.levelProgress[levelId];
    }

    private hydrate(data: Partial<SaveData>): SaveData {
        const levelCount = this.getLevelCount();
        const defaultData = createDefaultSaveData(levelCount);
        const hydrated = {
            ...defaultData,
            ...data,
            settings: {
                ...defaultData.settings,
                ...data.settings,
            },
            stats: {
                ...defaultData.stats,
                ...data.stats,
            },
            levelProgress: {
                ...defaultData.levelProgress,
            },
        };

        for (let levelId = 1; levelId <= levelCount; levelId += 1) {
            const stringKey = String(levelId);
            const savedProgress = data.levelProgress?.[levelId]
                ?? (data.levelProgress as Record<string, LevelProgressData> | undefined)?.[stringKey];

            hydrated.levelProgress[levelId] = {
                ...defaultData.levelProgress[levelId],
                ...savedProgress,
            };
        }

        hydrated.highestUnlockedLevelId = Math.max(1, Math.min(hydrated.highestUnlockedLevelId, levelCount));
        hydrated.selectedLevelId = Math.max(1, Math.min(hydrated.selectedLevelId, hydrated.highestUnlockedLevelId));
        hydrated.stats.humanScore = Math.max(0, Math.min(100, hydrated.stats.humanScore));
        hydrated.stats.consecutiveFailures = Math.max(0, hydrated.stats.consecutiveFailures);

        return hydrated;
    }

    private persist(): void {
        if (!this.saveData) {
            return;
        }

        sys.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.saveData));
    }
}
