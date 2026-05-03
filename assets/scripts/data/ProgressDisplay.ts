import { LevelResultType } from './GameConst';
import { humanScoreSystem } from '../gameplay/systems/HumanScoreSystem';
import { SaveData } from './SaveData';

function clampNumber(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function formatLevelCode(levelId: number): string {
    return `第 ${levelId} 关`;
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
        return `试验关卡已就绪，共 ${totalLevels} 关。`;
    }

    if (saveData.highestUnlockedLevelId >= totalLevels) {
        return '全部试验关卡已解锁，但系统仍然不太满意。';
    }

    return `${formatLevelCode(saveData.highestUnlockedLevelId + 1)} 将在下一次有效通过后解锁。`;
}
