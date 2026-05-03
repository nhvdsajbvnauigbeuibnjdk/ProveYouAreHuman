import { _decorator, Component } from 'cc';
import {
    GameSceneId,
    LevelResultType,
    UIPageId,
    UIPopupId,
} from '../data/GameConst';
import { JudgeTextDefinition } from '../data/JudgeTextConfig';
import { LevelDefinition } from '../data/LevelConfig';
import { AudioSettingsData } from '../data/SaveData';
import { AudioManager } from '../core/managers/AudioManager';
import { ConfigManager } from '../core/managers/ConfigManager';
import { AppliedLevelResultSummary, SaveManager } from '../core/managers/SaveManager';
import { SceneManager } from '../core/managers/SceneManager';
import { UIManager } from '../core/managers/UIManager';
import {
    VerifyLevelResultEvent,
} from '../gameplay/levels/LevelControllerTypes';
import { judgeSystem } from '../gameplay/systems/JudgeSystem';
import { TopStatusBar } from '../ui/components/TopStatusBar';
import { ResultPopup, ResultPopupContent } from '../ui/popups/ResultPopup';
import { SettingsPopup } from '../ui/popups/SettingsPopup';
import { UiTone } from '../ui/theme/UITheme';
import { MainMenuView } from '../ui/views/MainMenuView';
import { VerifyView } from '../ui/views/VerifyView';

const { ccclass, property } = _decorator;

@ccclass('GameApp')
export class GameApp extends Component {
    public static instance: GameApp | null = null;

    @property(MainMenuView)
    public mainMenuView: MainMenuView | null = null;

    @property(VerifyView)
    public verifyView: VerifyView | null = null;

    @property(ResultPopup)
    public resultPopup: ResultPopup | null = null;

    @property(SettingsPopup)
    public settingsPopup: SettingsPopup | null = null;

    @property(TopStatusBar)
    public topStatusBar: TopStatusBar | null = null;

    private configManager: ConfigManager = new ConfigManager();
    private saveManager!: SaveManager;
    private sceneManager: SceneManager = new SceneManager();
    private uiManager: UIManager = new UIManager();
    private audioManager: AudioManager = new AudioManager();

    private currentLevelId = 1;
    private lastResult: LevelResultType = LevelResultType.None;
    private topStatusText = '系统启动完成';
    private topStatusTone: UiTone = 'success';

    protected onLoad(): void {
        if (GameApp.instance && GameApp.instance !== this) {
            this.destroy();
            return;
        }

        GameApp.instance = this;

        this.initializeManagers();
        this.bindViews();
        this.registerUI();
        this.bootstrapFlow();
    }

    protected onDestroy(): void {
        if (GameApp.instance === this) {
            GameApp.instance = null;
        }
    }

    private initializeManagers(): void {
        this.configManager.initialize();
        this.saveManager = new SaveManager(() => this.configManager.getLevelCount());
        this.saveManager.initialize();
        this.sceneManager.initialize(GameSceneId.Prototype);
        this.audioManager.initialize(this.saveManager.getSaveData().settings);
        this.currentLevelId = Math.max(1, this.saveManager.getSaveData().selectedLevelId);
    }

    private bindViews(): void {
        this.mainMenuView?.bindActions({
            onStart: () => this.startGame(),
            onOpenSettings: () => this.openSettings(),
        });

        this.verifyView?.bindActions({
            onLevelValidated: (event) => this.handleLevelValidated(event),
            onBackToMenu: () => this.returnToMenu(),
        });

        this.resultPopup?.bindActions({
            onPrimary: () => this.handleResultPrimaryAction(),
            onSecondary: () => this.returnToMenu(),
        });

        this.settingsPopup?.bindActions({
            onAdjustBgm: (delta) => this.adjustBgm(delta),
            onAdjustSfx: (delta) => this.adjustSfx(delta),
            onToggleMute: () => this.toggleMute(),
            onToggleVibration: () => this.toggleVibration(),
            onResetProgress: () => this.resetProgress(),
            onClose: () => this.closeSettings(),
        });
    }

    private registerUI(): void {
        if (this.mainMenuView) {
            this.uiManager.registerPage(UIPageId.MainMenu, this.mainMenuView.node);
        }

        if (this.verifyView) {
            this.uiManager.registerPage(UIPageId.Verify, this.verifyView.node);
        }

        if (this.resultPopup) {
            this.uiManager.registerPopup(UIPopupId.Result, this.resultPopup.node);
        }

        if (this.settingsPopup) {
            this.uiManager.registerPopup(UIPopupId.Settings, this.settingsPopup.node);
        }
    }

    private bootstrapFlow(): void {
        this.audioManager.playBgm('prototype_bgm');
        this.openMainMenu();
    }

    private openMainMenu(): void {
        console.log('[GameApp] enter menu');
        this.verifyView?.clearLevel();
        this.resultPopup?.resetContent();
        this.mainMenuView?.refresh(this.saveManager.getSaveData(), this.configManager.getLevelCount());
        this.uiManager.showPage(UIPageId.MainMenu);
        this.updateTopStatus('主菜单', 'success');
    }

    private startGame(): void {
        console.log('[GameApp] start verify');
        const saveData = this.saveManager.getSaveData();
        const startLevelId = Math.max(1, Math.min(saveData.selectedLevelId, saveData.highestUnlockedLevelId));
        this.enterLevel(startLevelId);
    }

    private enterLevel(levelId: number): void {
        const level = this.configManager.getLevel(levelId);

        if (!level) {
            console.warn(`[GameApp] Missing level config: ${levelId}`);
            return;
        }

        this.currentLevelId = level.id;
        this.saveManager.selectLevel(level.id);
        console.log(`[GameApp] load level: ${level.id} / ${level.key}`);
        this.resultPopup?.resetContent();
        this.uiManager.showPage(UIPageId.Verify);
        this.verifyView?.loadLevel(level, this.configManager.getJudgeText('menu_intro'), this.configManager.getNextLevel(level.id)?.id ?? null);
        this.verifyView?.setPlayingInteractionEnabled(true);
        this.updateTopStatus(`第 ${level.id} 关就绪`, 'neutral');
    }

    private handleLevelValidated(event: VerifyLevelResultEvent): void {
        this.currentLevelId = event.level.id;
        this.lastResult = event.result.resultType;

        const outcomeSummary = this.saveManager.applyLevelResult(event.level, event.result);
        const aiJudgeText = judgeSystem.generate(event.level, event.result, this.saveManager.getSaveData());
        this.audioManager.playSfx(event.result.resultType === LevelResultType.Success ? 'verify_success' : 'verify_failure');
        this.openResultPopup(event, aiJudgeText, outcomeSummary);
        this.refreshMainMenuView();
    }

    private refreshMainMenuView(): void {
        this.mainMenuView?.refresh(this.saveManager.getSaveData(), this.configManager.getLevelCount());
        this.refreshTopStatusBar();
    }

    private openResultPopup(
        event: VerifyLevelResultEvent,
        aiJudgeText: string,
        outcomeSummary: AppliedLevelResultSummary,
    ): void {
        const judgeTextId = event.result.resultType === LevelResultType.Success
            ? event.level.successJudgeTextId
            : event.level.failureJudgeTextId;
        const judgeText = this.configManager.getJudgeText(judgeTextId)
            ?? this.configManager.getJudgeText('result_default_failure');
        const content = this.buildResultContent(
            event.level,
            event.result,
            judgeText,
            event.nextLevelId,
            aiJudgeText,
            outcomeSummary,
        );

        this.resultPopup?.refresh(content);
        this.verifyView?.setPlayingInteractionEnabled(false);
        this.uiManager.openPopup(UIPopupId.Result);
        console.log('[GameApp] show result');
        this.updateTopStatus(
            event.result.resultType === LevelResultType.Success ? '验证成功' : '验证失败',
            event.result.resultType === LevelResultType.Success ? 'success' : 'danger',
        );
    }

    private buildResultContent(
        level: LevelDefinition,
        result: VerifyLevelResultEvent['result'],
        judgeText: JudgeTextDefinition | null,
        nextLevelId: number | null,
        aiJudgeText: string,
        outcomeSummary: AppliedLevelResultSummary,
    ): ResultPopupContent {
        const safeResult = result.resultType === LevelResultType.Success ? LevelResultType.Success : LevelResultType.Failure;
        const systemNoteParts = [
            judgeText?.lines.join(' '),
            `成功指数 ${outcomeSummary.humanScore}（${outcomeSummary.humanScoreDelta >= 0 ? '+' : ''}${outcomeSummary.humanScoreDelta}）/ ${outcomeSummary.humanScoreDescription}`,
            safeResult === LevelResultType.Failure
                ? `失败 ${outcomeSummary.totalFailures} / 本关 ${outcomeSummary.levelFailures} / 连续 ${outcomeSummary.consecutiveFailures}`
                : (outcomeSummary.isFirstClear ? '首次通过奖励已记录。' : '通关记录已更新。'),
        ].filter((item): item is string => Boolean(item));

        return {
            resultType: safeResult,
            title: safeResult === LevelResultType.Success ? '验证成功' : '验证失败',
            message: result.message,
            absurdRule: result.absurdRule,
            aiJudgeText,
            systemNote: systemNoteParts.join('\n'),
            primaryButtonText: safeResult === LevelResultType.Success
                ? (nextLevelId !== null ? '下一关' : '返回主菜单')
                : '重试',
            secondaryButtonText: '返回主菜单',
        };
    }

    private handleResultPrimaryAction(): void {
        const action = this.verifyView?.handlePrimaryResultAction() ?? { type: 'back-to-menu' as const };

        if (action.type === 'retry-current') {
            this.uiManager.closePopup(UIPopupId.Result);
            this.resultPopup?.resetContent();
            this.verifyView?.setPlayingInteractionEnabled(true);
            this.updateTopStatus(`第 ${this.currentLevelId} 关就绪`, 'neutral');
            return;
        }

        if (action.type === 'load-next-level') {
            this.enterLevel(action.levelId);
            return;
        }

        this.returnToMenu();
    }

    private returnToMenu(): void {
        console.log('[GameApp] back to menu');
        this.openMainMenu();
    }

    private openSettings(): void {
        console.log('[GameApp] open settings');
        this.settingsPopup?.refresh(this.audioManager.getSettings());
        this.uiManager.openPopup(UIPopupId.Settings);
        this.updateTopStatus('设置', 'warning');
    }

    private closeSettings(): void {
        console.log('[GameApp] close settings');
        this.uiManager.closePopup(UIPopupId.Settings);
        this.syncTopStatusFromUiState();
    }

    private adjustBgm(delta: number): void {
        this.applySettings(this.audioManager.adjustBgmVolume(delta), '设置 / 音乐已更新');
    }

    private adjustSfx(delta: number): void {
        this.applySettings(this.audioManager.adjustSfxVolume(delta), '设置 / 音效已更新');
    }

    private toggleMute(): void {
        this.applySettings(this.audioManager.toggleMute(), '设置 / 声音已切换');
    }

    private toggleVibration(): void {
        this.applySettings(this.audioManager.toggleVibration(), '设置 / 震动已切换');
    }

    private resetProgress(): void {
        this.saveManager.reset();
        this.audioManager.initialize(this.saveManager.getSaveData().settings);
        this.currentLevelId = 1;
        this.settingsPopup?.refresh(this.audioManager.getSettings());
        this.refreshMainMenuView();
        this.openMainMenu();
    }

    private applySettings(settings: AudioSettingsData, statusText: string): void {
        this.saveManager.applySettings(settings);
        this.settingsPopup?.refresh(settings);
        this.updateTopStatus(statusText, 'warning');
    }

    private syncTopStatusFromUiState(): void {
        if (this.uiManager.isPopupOpen(UIPopupId.Result)) {
            this.updateTopStatus(
                this.lastResult === LevelResultType.Success ? '验证成功' : '验证失败',
                this.lastResult === LevelResultType.Success ? 'success' : 'danger',
            );
            return;
        }

        if (this.uiManager.getCurrentPage() === UIPageId.Verify) {
            this.updateTopStatus(`第 ${this.currentLevelId} 关就绪`, 'neutral');
            return;
        }

        this.updateTopStatus('主菜单', 'success');
    }

    private updateTopStatus(statusText: string, tone: UiTone): void {
        this.topStatusText = statusText;
        this.topStatusTone = tone;
        this.refreshTopStatusBar();
    }

    private refreshTopStatusBar(): void {
        this.topStatusBar?.refresh(
            this.saveManager.getSaveData(),
            this.currentLevelId,
            this.topStatusText,
            this.topStatusTone,
        );
    }
}
