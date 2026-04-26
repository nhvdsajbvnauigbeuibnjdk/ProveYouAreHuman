import { _decorator, Button, Label, Sprite } from 'cc';
import { LevelResultType } from '../../data/GameConst';
import { BasePanel } from '../base/BasePanel';
import {
    applyAccentStyle,
    applyButtonTheme,
    applyLabelTone,
    applyMaskStyle,
    applyPanelStyle,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;

export interface ResultPopupContent {
    resultType: LevelResultType.Success | LevelResultType.Failure;
    title: string;
    message: string;
    absurdRule: string;
    aiJudgeText: string;
    systemNote?: string;
    primaryButtonText: string;
    secondaryButtonText: string;
}

export interface ResultPopupActions {
    onPrimary: () => void;
    onSecondary: () => void;
}

@ccclass('ResultPopup')
export class ResultPopup extends BasePanel {
    @property(Sprite)
    public dimMaskSprite: Sprite | null = null;

    @property(Sprite)
    public windowBackgroundSprite: Sprite | null = null;

    @property(Sprite)
    public resultStateBarSprite: Sprite | null = null;

    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public stateLabel: Label | null = null;

    @property(Label)
    public messageLabel: Label | null = null;

    @property(Button)
    public primaryButton: Button | null = null;

    @property(Sprite)
    public primaryButtonSprite: Sprite | null = null;

    @property(Label)
    public primaryButtonLabel: Label | null = null;

    @property(Button)
    public secondaryButton: Button | null = null;

    @property(Sprite)
    public secondaryButtonSprite: Sprite | null = null;

    @property(Label)
    public secondaryButtonLabel: Label | null = null;

    private actions: ResultPopupActions | null = null;

    protected onLoad(): void {
        this.applyBaseTheme();
    }

    public bindActions(actions: ResultPopupActions): void {
        this.actions = actions;
    }

    public refresh(content: ResultPopupContent): void {
        const isSuccess = content.resultType === LevelResultType.Success;

        if (this.titleLabel) {
            this.titleLabel.string = content.title;
        }

        if (this.stateLabel) {
            this.stateLabel.string = isSuccess ? 'HUMAN STATUS ACCEPTED' : 'HUMAN STATUS REJECTED';
        }

        if (this.messageLabel) {
            this.messageLabel.string = this.composeBody(content);
        }

        if (this.primaryButtonLabel) {
            this.primaryButtonLabel.string = content.primaryButtonText;
        }

        if (this.secondaryButtonLabel) {
            this.secondaryButtonLabel.string = content.secondaryButtonText;
        }

        applyAccentStyle(this.resultStateBarSprite, isSuccess ? 'success' : 'danger');
        applyLabelTone(this.stateLabel, isSuccess ? 'success' : 'danger');
        applyButtonTheme(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, isSuccess ? 'primary' : 'danger');
        applyButtonTheme(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 'secondary');
    }

    private composeBody(content: ResultPopupContent): string {
        const sections = [
            content.systemNote ? `SYSTEM NOTE\n${content.systemNote}` : '',
            `MESSAGE\n${content.message}`,
            `ABSURD RULE\n${content.absurdRule}`,
            `AI JUDGE\n${content.aiJudgeText}`,
        ].filter((section) => section.length > 0);

        return sections.join('\n\n');
    }

    public onClickPrimary(): void {
        this.actions?.onPrimary();
    }

    public onClickSecondary(): void {
        this.actions?.onSecondary();
    }

    private applyBaseTheme(): void {
        applyMaskStyle(this.dimMaskSprite);
        applyPanelStyle(this.windowBackgroundSprite, true);
        applyLabelTone(this.titleLabel, 'title');
        applyLabelTone(this.stateLabel, 'success');
        applyLabelTone(this.messageLabel, 'muted');
        applyButtonTheme(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 'primary');
        applyButtonTheme(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 'secondary');
    }
}
