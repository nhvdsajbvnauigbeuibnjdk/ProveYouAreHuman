import { LevelResultType } from '../../data/GameConst';

const INITIAL_HUMAN_SCORE = 100;
const SUCCESS_SCORE_BONUS = 5;
const FIRST_CLEAR_SCORE_BONUS = 2;
const FAILURE_SCORE_PENALTY = 3;
const CONSECUTIVE_FAILURE_EXTRA_PENALTY = 1;

export interface HumanScoreUpdateContext {
    currentScore: number;
    resultType: LevelResultType.Success | LevelResultType.Failure;
    isFirstClear: boolean;
    consecutiveFailures: number;
}

export interface HumanScoreUpdate {
    nextScore: number;
    delta: number;
    description: string;
}

function clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
}

export class HumanScoreSystem {
    public getInitialScore(): number {
        return INITIAL_HUMAN_SCORE;
    }

    public applyResult(context: HumanScoreUpdateContext): HumanScoreUpdate {
        let delta = 0;

        if (context.resultType === LevelResultType.Success) {
            delta += SUCCESS_SCORE_BONUS;

            if (context.isFirstClear) {
                delta += FIRST_CLEAR_SCORE_BONUS;
            }
        } else {
            delta -= FAILURE_SCORE_PENALTY;

            if (context.consecutiveFailures >= 2) {
                delta -= CONSECUTIVE_FAILURE_EXTRA_PENALTY;
            }
        }

        const nextScore = clampScore(context.currentScore + delta);

        return {
            nextScore,
            delta,
            description: this.getDescription(nextScore),
        };
    }

    public getDescription(score: number): string {
        if (score >= 90) {
            return '\u9ad8\u5ea6\u7591\u4f3c\u4eba\u7c7b';
        }

        if (score >= 70) {
            return '\u57fa\u672c\u7b26\u5408\u4eba\u7c7b\u7279\u5f81';
        }

        if (score >= 40) {
            return '\u5b58\u5728\u81ea\u52a8\u5316\u5acc\u7591';
        }

        return '\u8bf7\u914d\u5408\u8fdb\u4e00\u6b65\u5ba1\u67e5';
    }
}

export const humanScoreSystem = new HumanScoreSystem();
