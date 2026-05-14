import {
    _decorator,
    Button,
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Sprite,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    Widget,
} from 'cc';
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
import { clearNodeChildren } from '../../gameplay/levels/LevelUiFactory';
import { BasePanel } from '../base/BasePanel';
import {
    applyAccentStyle,
    applyButtonTheme,
    applyLabelTone,
    applyMutedPanelStyle,
    applyPanelStyle,
    UI_THEME,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;
const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 1280;
const MAIN_CARD_WIDTH = 640;
const MAIN_CARD_HEIGHT = 1080;

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
    private backgroundNode: Node | null = null;
    private topBarNode: Node | null = null;
    private headerPanelNode: Node | null = null;
    private gameplayPanelNode: Node | null = null;
    private bottomPanelNode: Node | null = null;
    private topStatusBarNode: Node | null = null;

    protected onLoad(): void {
        this.bindButtonEvents();
        this.applyTheme();
        this.applyLayout();
    }

    protected onDestroy(): void {
        this.unbindButtonEvents();
        this.clearLevel();
    }

    public bindActions(actions: VerifyViewActions): void {
        this.actions = actions;
    }

    public attachTopStatusBar(topStatusBarNode: Node | null): void {
        this.topStatusBarNode = topStatusBarNode;
        this.applyLayout();
    }

    public loadLevel(level: LevelDefinition, judgeText: JudgeTextDefinition | null, nextLevelId: number | null): void {
        this.clearLevel();
        this.applyLayout();

        this.currentLevel = level;
        this.nextLevelId = nextLevelId;
        this.introJudgeText = judgeText;
        this.lastValidationResult = null;

        console.log(`[VerifyView] load level: ${level.id} / ${level.key}`);
        this.controller = levelControllerFactory.create(level);
        this.controller.init(level);

        if (this.levelContainer) {
            this.controller.mount(this.levelContainer);
        }

        console.log(`[VerifyView] controller reset: ${level.id}`);
        this.controller.reset();
        this.setActionButtonsEnabled(true);
        this.refreshStaticLabels(level);
        this.refreshLevelState(
            '等待操作',
            judgeText?.lines[0] ?? '请完成关卡操作后提交验证。',
            'warning',
        );
    }

    public clearLevel(): void {
        this.lastValidationResult = null;
        this.currentLevel = null;
        this.nextLevelId = null;
        this.introJudgeText = null;

        if (this.controller) {
            console.log('[VerifyView] clear current level controller');
            this.controller.unmount();
            this.controller = null;
        }

        if (this.levelContainer) {
            clearNodeChildren(this.levelContainer);
        }
        this.setActionButtonsEnabled(false, false);

        if (this.statusLabel) {
            this.statusLabel.string = '';
        }

        if (this.levelStateLabel) {
            this.levelStateLabel.string = '';
        }
    }

    public setPlayingInteractionEnabled(enabled: boolean): void {
        this.setActionButtonsEnabled(enabled, enabled);
    }

    public resetCurrentLevel(): void {
        this.resetLoadedController('已重置', '当前关卡已恢复到初始状态。');
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
        console.log('[VerifyView] confirm click');
        if (!this.currentLevel || !this.controller) {
            console.warn('[VerifyView] confirm ignored: no active level controller');
            return;
        }

        this.setActionButtonsEnabled(false, false);
        this.refreshLevelState('验证中', '正在提交验证结果。', 'warning');
        console.log(`[VerifyView] controller validate: ${this.currentLevel.id}`);
        const result = this.controller.validate();
        this.lastValidationResult = result;

        this.refreshLevelState(
            result.resultType === LevelResultType.Success ? '验证通过' : '验证失败',
            '请查看验证结果弹窗。',
            result.resultType === LevelResultType.Success ? 'success' : 'danger',
        );

        this.emitLevelResult(result);
    }

    public onClickRetry(): void {
        console.log('[VerifyView] retry click');
        if (!this.currentLevel || !this.controller) {
            console.warn('[VerifyView] retry ignored: no active level controller');
            return;
        }

        this.lastValidationResult = null;
        this.resetLoadedController('已重置', '当前关卡已恢复到初始状态。');
    }

    public onClickBackToMenu(): void {
        console.log('[VerifyView] back to menu click');
        this.actions?.onBackToMenu();
    }

    private refreshStaticLabels(level: LevelDefinition): void {
        if (this.titleLabel) {
            this.titleLabel.string = level.menuTitle;
        }

        if (this.subtitleLabel) {
            this.subtitleLabel.string = level.intro;
        }

        if (this.levelCodeLabel) {
            this.levelCodeLabel.string = formatLevelCode(level.id);
        }

        if (this.promptLabel) {
            this.promptLabel.string = `系统提示\n${level.systemPrompt}`;
        }

        if (this.ruleLabel) {
            this.ruleLabel.string = `荒谬规则\n${level.absurdRule}`;
        }

        if (this.levelCardTitleLabel) {
            this.levelCardTitleLabel.string = level.payload.controllerTitle || '验证操作';
        }

        if (this.confirmButtonLabel) {
            this.confirmButtonLabel.string = level.primaryActionLabel;
        }

        if (this.retryButtonLabel) {
            this.retryButtonLabel.string = level.secondaryActionLabel;
        }

        if (this.backMenuButtonLabel) {
            this.backMenuButtonLabel.string = '返回主菜单';
        }

        applyButtonTheme(this.confirmButton, this.confirmButtonSprite, this.confirmButtonLabel, 'primary');
        applyButtonTheme(this.retryButton, this.retryButtonSprite, this.retryButtonLabel, 'secondary');
        applyButtonTheme(this.backMenuButton, this.backMenuButtonSprite, this.backMenuButtonLabel, 'secondary');
    }

    private bindButtonEvents(): void {
        this.unbindButtonEvents();
        this.clearSerializedClickEvents(this.confirmButton);
        this.clearSerializedClickEvents(this.retryButton);
        this.clearSerializedClickEvents(this.backMenuButton);

        if (this.confirmButton) {
            this.confirmButton.node.on(Button.EventType.CLICK, this.onClickConfirm, this);
        }

        if (this.retryButton) {
            this.retryButton.node.on(Button.EventType.CLICK, this.onClickRetry, this);
        }

        if (this.backMenuButton) {
            this.backMenuButton.node.on(Button.EventType.CLICK, this.onClickBackToMenu, this);
        }
    }

    private unbindButtonEvents(): void {
        this.confirmButton?.node.off(Button.EventType.CLICK, this.onClickConfirm, this);
        this.retryButton?.node.off(Button.EventType.CLICK, this.onClickRetry, this);
        this.backMenuButton?.node.off(Button.EventType.CLICK, this.onClickBackToMenu, this);
    }

    private clearSerializedClickEvents(button: Button | null): void {
        if (button) {
            button.clickEvents.length = 0;
        }
    }

    private resetLoadedController(statusText: string, detailText: string): void {
        if (!this.currentLevel || !this.controller) {
            return;
        }

        this.lastValidationResult = null;
        console.log(`[VerifyView] controller reset: ${this.currentLevel.id}`);
        this.controller.reset();
        this.setActionButtonsEnabled(true);
        this.refreshLevelState(statusText, detailText, 'warning');
    }

    private setActionButtonsEnabled(enabled: boolean, visible = true): void {
        if (this.confirmButton) {
            this.confirmButton.interactable = enabled;
            this.confirmButton.node.active = visible;
        }

        if (this.retryButton) {
            this.retryButton.interactable = enabled;
            this.retryButton.node.active = visible;
        }
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
        applyLabelTone(this.statusLabel, tone);
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

    private applyLayout(): void {
        this.ensureTransform(this.node, VIEW_WIDTH, VIEW_HEIGHT);
        this.node.setPosition(new Vec3(0, 0, 0));
        this.ensureStructure();

        this.layoutPanel(this.backgroundNode, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, UI_THEME.background, undefined, 0);
        this.layoutNode(this.topBarNode, 0, 538, 640, 76);
        this.drawRoundedRect(this.topBarNode, 640, 76, UI_THEME.panelRaised, 20, UI_THEME.outlineBright);
        this.layoutPanel(this.panelBackgroundSprite?.node ?? null, 0, 0, 640, 76, UI_THEME.panelRaised, UI_THEME.outlineBright, 20);
        this.layoutButton(this.backMenuButton, this.backMenuButtonSprite, this.backMenuButtonLabel, -228, 0, 156, 48, 17, 'secondary');
        this.layoutLabel(this.levelCodeLabel, 0, 14, 220, 30, 22, 28, 'success');
        this.layoutPanel(this.statusChipSprite?.node ?? null, 202, 0, 178, 38, UI_THEME.panelMuted, UI_THEME.warning, 18);
        this.layoutLabel(this.statusLabel, 202, 0, 158, 30, 18, 24, 'warning');

        this.layoutNode(this.headerPanelNode, 0, 376, 600, 238);
        this.drawRoundedRect(this.headerPanelNode, 600, 238, UI_THEME.panel, 22, UI_THEME.accent);
        this.layoutPanel(this.instructionPanelSprite?.node ?? null, 0, 0, 600, 238, UI_THEME.panel, UI_THEME.accent, 22);
        this.layoutLabel(this.titleLabel, 0, 76, 540, 44, 32, 40, 'title');
        this.layoutLabel(this.subtitleLabel, 0, 36, 540, 30, 18, 24, 'muted');
        this.layoutLabel(this.promptLabel, 0, -28, 520, 58, 18, 25, 'title');
        this.layoutLabel(this.ruleLabel, 0, -92, 520, 54, 17, 24, 'muted');

        this.layoutNode(this.gameplayPanelNode, 0, -52, 600, 560);
        this.drawRoundedRect(this.gameplayPanelNode, 600, 560, UI_THEME.panelMuted, 22, UI_THEME.accentSoft);
        this.layoutPanel(this.levelCardSprite?.node ?? null, 0, 0, 600, 560, UI_THEME.panelMuted, UI_THEME.accentSoft, 22);
        this.layoutLabel(this.levelCardTitleLabel, 0, 232, 520, 34, 22, 28, 'success');
        this.layoutNode(this.levelContainer, 0, 18, 550, 414);
        this.layoutLabel(this.levelStateLabel, 0, -238, 520, 50, 18, 24, 'muted');

        this.layoutNode(this.bottomPanelNode, 0, -514, 600, 120);
        this.drawRoundedRect(this.bottomPanelNode, 600, 120, UI_THEME.panelRaised, 22, UI_THEME.outlineBright);
        this.layoutButton(this.confirmButton, this.confirmButtonSprite, this.confirmButtonLabel, -96, 0, 348, 68, 24, 'primary');
        this.layoutButton(this.retryButton, this.retryButtonSprite, this.retryButtonLabel, 188, 0, 176, 58, 20, 'secondary');
    }

    private ensureStructure(): void {
        this.backgroundNode = this.ensureChild(this.node, 'Background');
        this.topBarNode = this.ensureChild(this.node, 'TopBar');
        this.headerPanelNode = this.ensureChild(this.node, 'HeaderPanel');
        this.gameplayPanelNode = this.ensureChild(this.node, 'GameplayPanel');
        this.bottomPanelNode = this.ensureChild(this.node, 'BottomPanel');

        this.reparent(this.panelBackgroundSprite?.node ?? null, this.topBarNode);
        this.reparent(this.backMenuButton?.node ?? null, this.topBarNode);
        this.reparent(this.levelCodeLabel?.node ?? null, this.topBarNode);
        this.reparent(this.statusChipSprite?.node ?? null, this.topBarNode);
        this.reparent(this.statusLabel?.node ?? null, this.topBarNode);
        this.reparentTopStatusBar();

        this.reparent(this.instructionPanelSprite?.node ?? null, this.headerPanelNode);
        this.reparent(this.titleLabel?.node ?? null, this.headerPanelNode);
        this.reparent(this.subtitleLabel?.node ?? null, this.headerPanelNode);
        this.reparent(this.promptLabel?.node ?? null, this.headerPanelNode);
        this.reparent(this.ruleLabel?.node ?? null, this.headerPanelNode);

        this.reparent(this.levelCardSprite?.node ?? null, this.gameplayPanelNode);
        this.reparent(this.levelCardTitleLabel?.node ?? null, this.gameplayPanelNode);
        this.reparent(this.levelContainer, this.gameplayPanelNode);
        this.reparent(this.levelStateLabel?.node ?? null, this.gameplayPanelNode);

        this.reparent(this.confirmButton?.node ?? null, this.bottomPanelNode);
        this.reparent(this.retryButton?.node ?? null, this.bottomPanelNode);

        this.backgroundNode.setSiblingIndex(0);
        this.topBarNode.setSiblingIndex(1);
        this.headerPanelNode.setSiblingIndex(2);
        this.gameplayPanelNode.setSiblingIndex(3);
        this.bottomPanelNode.setSiblingIndex(4);
        this.panelBackgroundSprite?.node.setSiblingIndex(0);
        this.instructionPanelSprite?.node.setSiblingIndex(0);
        this.levelCardSprite?.node.setSiblingIndex(0);
    }

    private reparentTopStatusBar(): void {
        if (!this.topStatusBarNode || !this.topBarNode || this.topStatusBarNode === this.topBarNode) {
            return;
        }

        const topBarSize = this.topBarNode.getComponent(UITransform)?.contentSize ?? { width: 640, height: 92 };
        const widget = this.topStatusBarNode.getComponent(Widget);

        if (widget) {
            widget.enabled = false;
        }

        if (this.topStatusBarNode.parent !== this.topBarNode) {
            this.topStatusBarNode.setParent(this.topBarNode, false);
        }

        this.topStatusBarNode.setPosition(new Vec3(0, 0, 0));
        this.ensureTransform(this.topStatusBarNode, topBarSize.width, topBarSize.height);
    }

    private ensureChild(parent: Node, name: string): Node {
        const existing = parent.getChildByName(name);

        if (existing) {
            return existing;
        }

        const node = new Node(name);
        parent.addChild(node);
        return node;
    }

    private reparent(node: Node | null, parent: Node | null): void {
        if (!node || !parent || node === parent || node.parent === parent) {
            return;
        }

        node.setParent(parent, false);
    }

    private layoutPanel(node: Node | null, x: number, y: number, width: number, height: number, fillColor: Color, strokeColor?: Color, radius = 8): void {
        if (!node) {
            return;
        }

        node.active = true;
        node.setPosition(new Vec3(x, y, 0));
        this.drawRoundedRect(node, width, height, fillColor, radius, strokeColor);
    }

    private layoutNode(node: Node | null, x: number, y: number, width: number, height: number): void {
        if (!node) {
            return;
        }

        node.active = true;
        node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(node, width, height);
    }

    private layoutLabel(
        label: Label | null,
        x: number,
        y: number,
        width: number,
        height: number,
        fontSize: number,
        lineHeight: number,
        tone: 'title' | 'muted' | 'success' | 'danger' | 'warning',
    ): void {
        if (!label) {
            return;
        }

        this.layoutNode(label.node, x, y, width, height);
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        label.enableWrapText = true;
        label.overflow = Label.Overflow.SHRINK;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        applyLabelTone(label, tone);
    }

    private layoutButton(
        button: Button | null,
        sprite: Sprite | null,
        label: Label | null,
        x: number,
        y: number,
        width: number,
        height: number,
        fontSize: number,
        tone: 'primary' | 'secondary' | 'danger',
    ): void {
        if (!button) {
            return;
        }

        this.layoutNode(button.node, x, y, width, height);
        this.layoutPanel(sprite?.node ?? button.node, sprite ? 0 : x, sprite ? 0 : y, width, height, tone === 'primary' ? UI_THEME.buttonPrimary : tone === 'danger' ? UI_THEME.buttonDanger : UI_THEME.buttonSecondary, UI_THEME.outline, 18);
        applyButtonTheme(button, sprite, label, tone);

        if (!label) {
            return;
        }

        this.layoutNode(label.node, 0, 0, width - 32, height - 14);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.enableWrapText = false;
        label.overflow = Label.Overflow.SHRINK;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        applyLabelTone(label, 'title');
    }

    private ensureTransform(node: Node, width: number, height: number): UITransform {
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
        return transform;
    }

    private drawRoundedRect(node: Node, width: number, height: number, fillColor: Color, radius: number, strokeColor?: Color): void {
        this.ensureTransform(node, width, height);

        const graphics = node.getComponent(Graphics) ?? node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = fillColor;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.fill();

        if (!strokeColor) {
            return;
        }

        graphics.strokeColor = strokeColor;
        graphics.lineWidth = 4;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.stroke();
    }
}
