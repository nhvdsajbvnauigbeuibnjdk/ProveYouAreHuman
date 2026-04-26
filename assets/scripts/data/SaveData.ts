import {
    DEFAULT_BGM_VOLUME,
    DEFAULT_SFX_VOLUME,
    LevelResultType,
    SAVE_DATA_VERSION,
    TRIAL_LEVEL_COUNT,
} from './GameConst';

export interface AudioSettingsData {
    bgmVolume: number;
    sfxVolume: number;
    isMuted: boolean;
    vibrationEnabled: boolean;
}

export interface RuntimeStatsData {
    totalAttempts: number;
    totalClears: number;
    totalFailures: number;
    consecutiveFailures: number;
    humanScore: number;
}

export interface LevelProgressData {
    levelId: number;
    unlocked: boolean;
    cleared: boolean;
    clearCount: number;
    failureCount: number;
    lastResult: LevelResultType;
}

export interface SaveData {
    version: number;
    selectedLevelId: number;
    highestUnlockedLevelId: number;
    settings: AudioSettingsData;
    stats: RuntimeStatsData;
    levelProgress: Record<number, LevelProgressData>;
}

export function createDefaultLevelProgress(levelCount: number): Record<number, LevelProgressData> {
    const progress: Record<number, LevelProgressData> = {};

    for (let levelId = 1; levelId <= levelCount; levelId += 1) {
        progress[levelId] = {
            levelId,
            unlocked: levelId === 1,
            cleared: false,
            clearCount: 0,
            failureCount: 0,
            lastResult: LevelResultType.None,
        };
    }

    return progress;
}

export function createDefaultSaveData(levelCount: number = TRIAL_LEVEL_COUNT): SaveData {
    return {
        version: SAVE_DATA_VERSION,
        selectedLevelId: 1,
        highestUnlockedLevelId: 1,
        settings: {
            bgmVolume: DEFAULT_BGM_VOLUME,
            sfxVolume: DEFAULT_SFX_VOLUME,
            isMuted: false,
            vibrationEnabled: true,
        },
        stats: {
            totalAttempts: 0,
            totalClears: 0,
            totalFailures: 0,
            consecutiveFailures: 0,
            humanScore: 100,
        },
        levelProgress: createDefaultLevelProgress(levelCount),
    };
}
