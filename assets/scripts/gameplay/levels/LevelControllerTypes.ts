import { LevelResultType } from '../../data/GameConst';
import { LevelDefinition } from '../../data/LevelConfig';

export interface LevelValidationMeta {
    reasonKey: string;
    message?: string;
    absurdRule?: string;
    systemPrompt?: string;
    primaryAction?: string | null;
}

export interface LevelValidationResult {
    resultType: LevelResultType.Success | LevelResultType.Failure;
    success: boolean;
    reasonKey: string;
    message: string;
    absurdRule: string;
    systemPrompt: string;
    primaryAction: string | null;
    summaryText: string;
    detailText: string;
}

export interface VerifyLevelResultEvent {
    level: LevelDefinition;
    result: LevelValidationResult;
    nextLevelId: number | null;
}

export type VerifyPrimaryResultAction =
    | { type: 'retry-current' }
    | { type: 'load-next-level'; levelId: number }
    | { type: 'back-to-menu' };
