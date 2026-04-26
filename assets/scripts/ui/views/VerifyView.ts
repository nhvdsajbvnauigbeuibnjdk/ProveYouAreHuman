import { _decorator, Button, Label, Node, Sprite } from 'cc';
import { LevelResultType } from '../../data/GameConst';
import { formatLevelCode } from '../../data/ProgressDisplay';
import { JudgeTextDefinition } from '../../data/JudgeTextConfig';
import { LevelDefinition } from '../../data/LevelConfig';
import { BaseLevelController } from '../../gameplay/levels/BaseLevelController';
import {
    LevelValidationResult,
    VerifyLevelResultEvent,
    VerifyPrimaryResultAction,
} from '../../gameplay/levels/LevelControllerTypes';
import { levelControllerFactory } from '../../gameplay/levels/LevelControllerFactory';
import { BasePanel } from '../base/BasePanel';
import {
    applyAccentStyle,
    applyButtonTheme,
    applyLabelTone,
    applyMutedPanelStyle,
    applyPanelStyle,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;

export interface VerifyViewActions {
    onLevelValidated: (event: VerifyLevelResultEvent) => void;
    onBackToMenu: () => void;
}

@ccclass('VerifyView')
export class VerifyView extends BasePanel {
    @property(Sprite)
    public panelBackgroundSprite: Sprite | null = null;

    @property(Sprite)
    public instructionPanelSprite: Sprite | null = null;

    @property(Sprite)
    public levelCardSprite: Sprite | null = null;

    @property(Sprite)
    public statusChipSprite: Sprite | null = null;

    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public subtitleLabel: Label | null = null;

    @property(Label)
    public statusLabel: Label | null = null;

    @property(Label)
    public levelCodeLabel: Label | null = null;

    @property(Label)
    public promptLabel: Label | null = null;

    @property(Label)
    public ruleLabel: Label | null = null;

    @property(Label)
    public levelCardTitleLabel: Label | null = null;

    @property(Label)
    public levelStateLabel: Label | null = null;

    @property(Node)
    public levelContainer: Node | null = null;

    @property(Button)
    public confirmButton: Button | null = null;

    @property(Sprite)
    public confirmButtonSprite: Sprite | null = null;

    @property(Label)
    public confirmButtonLabel: Label | null = null;

    @property(Button)
    public retryButton: Button | null = null;

    @property(Sprite)
    public retryButtonSprite: Sprite | null = null;

    @property(Label)
    public retryButtonLabel: Label | null = null;

    @property(Button)
    public backMenuButton: Button | null = null;

    @property(Sprite)
    public backMenuButtonSprite: Sprite | null = null;

    @property(Label)
    public backMenuButtonLabel: Label | null = null;

    private actions: VerifyViewActions | null = null;
    private currentLevel: LevelDefinition | null = null;
    private nextLevelId: number | null = null;
    private controller: BaseLevelController | null = null;
    private lastValidationResult: LevelValidationResult | null = null;
    private introJudgeText: JudgeTextDefinition | null = null;

    protected onLoad(): void {
        this.bindButtonEvents();
        this.applyTheme();
    }

    protected onDestroy(): void {
        this.unbindButtonEvents();
        this.controller?.unmount();
        this.controller = null;
    }

    public bindActions(actions: VerifyViewActions): void {
        this.actions = actions;
    }

    public loadLevel(level: LevelDefinition, judgeText: JudgeTextDefinition | null, nextLevelId: number | null): void {
        this.currentLevel = level;
        this.nextLevelId = nextLevelId;
        this.introJudgeText = judgeText;
        this.lastValidationResult = null;

        this.controller?.unmount();
        this.controller = levelControllerFactory.create(level);
        this.controller.init(level);

        if (this.levelContainer) {
            this.controller.mount(this.levelContainer);
        }

        this.controller.reset();
        this.refreshStaticLabels(level);
        this.refreshLevelState(
            'LEVEL READY',
            [
                level.payload.controllerHint,
                judgeText?.lines[0] ?? 'Interact with the challenge inside the level container, then submit.',
            ].join('\n\n'),
            'warning',
        );
    }

    public resetCurrentLevel(): void {
        if (!this.currentLevel || !this.controller) {
            return;
        }

        this.lastValidationResult = null;
        this.controller.reset();
        this.refreshLevelState(
            'LEVEL RESET',
            [
                this.currentLevel.payload.controllerHint,
                this.introJudgeText?.lines[0] ?? 'The internal challenge has been reset.',
            ].join('\n\n'),
            'warning',
        );
    }

    public handlePrimaryResultAction(): VerifyPrimaryResultAction {
        if (this.lastValidationResult?.resultType === LevelResultType.Success) {
            if (this.nextLevelId !== null) {
                return { type: 'load-next-level', levelId: this.nextLevelId };
            }

            return { type: 'back-to-menu' };
        }

        this.resetCurrentLevel();
        return { type: 'retry-current' };
    }

    public onClickConfirm(): void {
        if (!this.currentLevel || !this.controller) {
            return;
        }

        const result = this.controller.validate();
        this.lastValidationResult = result;

        this.refreshLevelState(
            result.resultType === LevelResultType.Success ? 'VALIDATION PASSED' : 'VALIDATION FAILED',
            `${result.summaryText}\n\n${result.detailText}`,
            result.resultType === LevelResultType.Success ? 'success' : 'danger',
        );

        this.emitLevelResult(result);
    }

    public onClickRetry(): void {
        if (!this.currentLevel || !this.controller) {
            return;
        }

        this.lastValidationResult = null;
        this.controller.reset();
        this.refreshLevelState(
            'LEVEL RESET',
            [
                this.currentLevel.payload.controllerHint,
                this.introJudgeText?.lines[0] ?? 'The internal challenge has been reset.',
            ].join('\n\n'),
            'warning',
        );
    }

    public onClickBackToMenu(): void {
        this.actions?.onBackToMenu();
    }

    private refreshStaticLabels(level: LevelDefinition): void {
        if (this.titleLabel) {
            this.titleLabel.string = level.title;
        }

        if (this.subtitleLabel) {
            this.subtitleLabel.string = level.intro;
        }

        if (this.levelCodeLabel) {
            this.levelCodeLabel.string = `${formatLevelCode(level.id)} / ${level.type.toUpperCase()}`;
        }

        if (this.promptLabel) {
            this.promptLabel.string = `SYSTEM PROMPT\n${level.systemPrompt}`;
        }

        if (this.ruleLabel) {
            this.ruleLabel.string = `ABSURD RULE\n${level.absurdRule}`;
        }

        if (this.levelCardTitleLabel) {
            this.levelCardTitleLabel.string = level.payload.controllerTitle;
        }

        if (this.confirmButtonLabel) {
            this.confirmButtonLabel.string = level.primaryActionLabel;
        }

        if (this.retryButtonLabel) {
            this.retryButtonLabel.string = level.secondaryActionLabel;
        }

        if (this.backMenuButtonLabel) {
            this.backMenuButtonLabel.string = 'BACK TO MENU';
        }

        applyButtonTheme(this.confirmButton, this.confirmButtonSprite, this.confirmButtonLabel, 'primary');
        applyButtonTheme(this.retryButton, this.retryButtonSprite, this.retryButtonLabel, 'secondary');
        applyButtonTheme(this.backMenuButton, this.backMenuButtonSprite, this.backMenuButtonLabel, 'secondary');
    }

    private bindButtonEvents(): void {
        if (this.confirmButton && this.confirmButton.clickEvents.length === 0) {
            this.confirmButton.node.on(Button.EventType.CLICK, this.onClickConfirm, this);
        }

        if (this.retryButton && this.retryButton.clickEvents.length === 0) {
            this.retryButton.node.on(Button.EventType.CLICK, this.onClickRetry, this);
        }
    }

    private unbindButtonEvents(): void {
        this.confirmButton?.node.off(Button.EventType.CLICK, this.onClickConfirm, this);
        this.retryButton?.node.off(Button.EventType.CLICK, this.onClickRetry, this);
    }

    private emitLevelResult(result: LevelValidationResult): void {
        if (!this.currentLevel) {
            return;
        }

        this.actions?.onLevelValidated({
            level: this.currentLevel,
            result,
            nextLevelId: this.nextLevelId,
        });
    }

    private refreshLevelState(statusText: string, detailText: string, tone: 'warning' | 'success' | 'danger'): void {
        if (this.statusLabel) {
            this.statusLabel.string = statusText;
        }

        if (this.levelStateLabel) {
            this.levelStateLabel.string = detailText;
        }

        applyAccentStyle(this.statusChipSprite, tone);
        applyLabelTone(this.statusLabel, tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'title');
    }

    private applyTheme(): void {
        applyPanelStyle(this.panelBackgroundSprite, true);
        applyMutedPanelStyle(this.instructionPanelSprite);
        applyMutedPanelStyle(this.levelCardSprite);
        applyLabelTone(this.titleLabel, 'title');
        applyLabelTone(this.subtitleLabel, 'muted');
        applyLabelTone(this.levelCodeLabel, 'success');
        applyLabelTone(this.promptLabel, 'title');
        applyLabelTone(this.ruleLabel, 'muted');
        applyLabelTone(this.levelCardTitleLabel, 'success');
        applyLabelTone(this.levelStateLabel, 'muted');
        applyButtonTheme(this.confirmButton, this.confirmButtonSprite, this.confirmButtonLabel, 'primary');
        applyButtonTheme(this.retryButton, this.retryButtonSprite, this.retryButtonLabel, 'secondary');
        applyButtonTheme(this.backMenuButton, this.backMenuButtonSprite, this.backMenuButtonLabel, 'secondary');
    }
}
