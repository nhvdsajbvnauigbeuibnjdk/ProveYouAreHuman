import { _decorator, Button, Label, Sprite } from 'cc';
import { GAME_NAME, GAME_NAME_EN, GAME_SUBTITLE } from '../../data/GameConst';
import { buildMainMenuNotice, calculateHumanIndex, formatLevelCode, getHumanIndexRank } from '../../data/ProgressDisplay';
import { SaveData } from '../../data/SaveData';
import { BasePanel } from '../base/BasePanel';
import {
    applyAccentStyle,
    applyButtonTheme,
    applyLabelTone,
    applyMutedPanelStyle,
    applyPanelStyle,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;

export interface MainMenuActions {
    onStart: () => void;
    onOpenSettings: () => void;
}

@ccclass('MainMenuView')
export class MainMenuView extends BasePanel {
    @property(Sprite)
    public panelBackgroundSprite: Sprite | null = null;

    @property(Sprite)
    public noticePanelSprite: Sprite | null = null;

    @property(Sprite)
    public panelAccentLineSprite: Sprite | null = null;

    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public subtitleLabel: Label | null = null;

    @property(Label)
    public currentLevelValueLabel: Label | null = null;

    @property(Label)
    public humanIndexValueLabel: Label | null = null;

    @property(Label)
    public failureCountValueLabel: Label | null = null;

    @property(Label)
    public systemNoticeLabel: Label | null = null;

    @property(Button)
    public startVerifyButton: Button | null = null;

    @property(Sprite)
    public startVerifyButtonSprite: Sprite | null = null;

    @property(Label)
    public startVerifyButtonLabel: Label | null = null;

    @property(Button)
    public openSettingsButton: Button | null = null;

    @property(Sprite)
    public openSettingsButtonSprite: Sprite | null = null;

    @property(Label)
    public openSettingsButtonLabel: Label | null = null;

    private actions: MainMenuActions | null = null;

    protected onLoad(): void {
        this.applyTheme();
        this.syncStaticText();
    }

    public bindActions(actions: MainMenuActions): void {
        this.actions = actions;
    }

    public refresh(saveData: Readonly<SaveData>, levelCount: number): void {
        this.syncStaticText();

        const humanIndex = calculateHumanIndex(saveData);

        if (this.currentLevelValueLabel) {
            this.currentLevelValueLabel.string = `${formatLevelCode(saveData.selectedLevelId)} / ${levelCount
                .toString()
                .padStart(2, '0')}`;
        }

        if (this.humanIndexValueLabel) {
            this.humanIndexValueLabel.string = `${humanIndex} / ${getHumanIndexRank(humanIndex)}`;
        }

        if (this.failureCountValueLabel) {
            this.failureCountValueLabel.string = `${saveData.stats.totalFailures}`;
        }

        if (this.systemNoticeLabel) {
            this.systemNoticeLabel.string = buildMainMenuNotice(saveData, levelCount);
        }
    }

    public onClickStartVerify(): void {
        this.actions?.onStart();
    }

    public onClickOpenSettings(): void {
        this.actions?.onOpenSettings();
    }

    private applyTheme(): void {
        applyPanelStyle(this.panelBackgroundSprite, true);
        applyMutedPanelStyle(this.noticePanelSprite);
        applyAccentStyle(this.panelAccentLineSprite, 'success');
        applyLabelTone(this.titleLabel, 'title');
        applyLabelTone(this.subtitleLabel, 'muted');
        applyLabelTone(this.currentLevelValueLabel, 'success');
        applyLabelTone(this.humanIndexValueLabel, 'success');
        applyLabelTone(this.failureCountValueLabel, 'danger');
        applyLabelTone(this.systemNoticeLabel, 'muted');
        applyButtonTheme(this.startVerifyButton, this.startVerifyButtonSprite, this.startVerifyButtonLabel, 'primary');
        applyButtonTheme(this.openSettingsButton, this.openSettingsButtonSprite, this.openSettingsButtonLabel, 'secondary');
    }

    private syncStaticText(): void {
        if (this.titleLabel) {
            this.titleLabel.string = GAME_NAME;
        }

        if (this.subtitleLabel) {
            this.subtitleLabel.string = `${GAME_NAME_EN} / ${GAME_SUBTITLE}`;
        }

        if (this.startVerifyButtonLabel) {
            this.startVerifyButtonLabel.string = 'START VERIFY';
        }

        if (this.openSettingsButtonLabel) {
            this.openSettingsButtonLabel.string = 'SETTINGS';
        }
    }
}
