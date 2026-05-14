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

    let clearedCount = 0;

    for (let levelId = 1; levelId <= totalLevels; levelId += 1) {
        if (saveData.levelProgress[levelId]?.cleared) {
            clearedCount += 1;
        }
    }

    if (clearedCount >= totalLevels) {
        return `全部 ${totalLevels} 关已通过。系统已生成一份非常不可靠的人类证明。`;
    }

    if (saveData.highestUnlockedLevelId >= totalLevels) {
        return '最终试验已解锁。系统正在等待你完成最后一次不合理证明。';
    }

    return `${formatLevelCode(saveData.highestUnlockedLevelId + 1)} 将在下一次有效通过后解锁。`;
}
