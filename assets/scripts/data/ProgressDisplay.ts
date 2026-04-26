import { LevelResultType } from './GameConst';
import { humanScoreSystem } from '../gameplay/systems/HumanScoreSystem';
import { SaveData } from './SaveData';

function clampNumber(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function formatLevelCode(levelId: number): string {
    return `L${levelId.toString().padStart(2, '0')}`;
}

export function calculateHumanIndex(saveData: Readonly<SaveData>): number {
    return clampNumber(saveData.stats.humanScore, 0, 100);
}

export function getHumanIndexRank(humanIndex: number): string {
    return humanScoreSystem.getDescription(humanIndex);
}

export function getLastResult(saveData: Readonly<SaveData>, levelId: number): LevelResultType {
    return saveData.levelProgress[levelId]?.lastResult ?? LevelResultType.None;
}

export function buildMainMenuNotice(saveData: Readonly<SaveData>, totalLevels: number): string {
    if (saveData.stats.totalAttempts === 0) {
        return `TRIAL PACK READY. ${totalLevels} LEVELS ARE INSTALLED.`;
    }

    if (saveData.highestUnlockedLevelId >= totalLevels) {
        return 'ALL TRIAL LEVELS UNLOCKED. THE SYSTEM IS STILL NOT SATISFIED.';
    }

    return `LEVEL ${formatLevelCode(saveData.highestUnlockedLevelId + 1)} WILL UNLOCK AFTER THE NEXT VALID CLEAR.`;
}
