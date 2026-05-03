import { _decorator, Label, Sprite } from 'cc';
import { calculateHumanIndex, formatLevelCode } from '../../data/ProgressDisplay';
import { SaveData } from '../../data/SaveData';
import { BasePanel } from '../base/BasePanel';
import { UiTone, applyAccentStyle, applyLabelTone, applyPanelStyle } from '../theme/UITheme';

const { ccclass, property } = _decorator;

@ccclass('TopStatusBar')
export class TopStatusBar extends BasePanel {
    @property(Sprite)
    public barBackgroundSprite: Sprite | null = null;

    @property(Sprite)
    public statusDotSprite: Sprite | null = null;

    @property(Label)
    public systemNameLabel: Label | null = null;

    @property(Label)
    public sceneStateLabel: Label | null = null;

    @property(Label)
    public currentLevelLabel: Label | null = null;

    @property(Label)
    public humanIndexLabel: Label | null = null;

    @property(Label)
    public failureCountLabel: Label | null = null;

    protected onLoad(): void {
        applyPanelStyle(this.barBackgroundSprite, true);
        applyAccentStyle(this.statusDotSprite, 'success');
        applyLabelTone(this.systemNameLabel, 'title');
        applyLabelTone(this.sceneStateLabel, 'muted');
        applyLabelTone(this.currentLevelLabel, 'success');
        applyLabelTone(this.humanIndexLabel, 'success');
        applyLabelTone(this.failureCountLabel, 'danger');

        if (this.systemNameLabel) {
            this.systemNameLabel.string = '';
            this.systemNameLabel.node.active = false;
        }

        if (this.sceneStateLabel) {
            this.sceneStateLabel.string = '当前：启动中';
        }

        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = '关卡：第 1 关';
        }

        if (this.humanIndexLabel) {
            this.humanIndexLabel.string = '成功：--';
        }

        if (this.failureCountLabel) {
            this.failureCountLabel.string = '失败：--';
        }
    }

    public refresh(
        saveData: Readonly<SaveData>,
        currentLevelId: number,
        currentStatusText: string,
        currentStatusTone: UiTone,
    ): void {
        const humanIndex = calculateHumanIndex(saveData);

        if (this.sceneStateLabel) {
            this.sceneStateLabel.string = `当前：${currentStatusText}`;
        }

        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = `关卡：${formatLevelCode(currentLevelId)}`;
        }

        if (this.humanIndexLabel) {
            this.humanIndexLabel.string = `成功：${humanIndex}`;
        }

        if (this.failureCountLabel) {
            this.failureCountLabel.string = `失败：${saveData.stats.totalFailures}`;
        }

        applyAccentStyle(this.statusDotSprite, currentStatusTone);
        applyLabelTone(
            this.sceneStateLabel,
            currentStatusTone === 'danger'
                ? 'danger'
                : currentStatusTone === 'warning'
                    ? 'warning'
                    : currentStatusTone === 'success'
                        ? 'success'
                        : 'muted',
        );
    }
}
