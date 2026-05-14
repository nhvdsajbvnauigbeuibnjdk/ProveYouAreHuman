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
} from 'cc';
import { GAME_NAME } from '../../data/GameConst';
import { buildMainMenuNotice, calculateHumanIndex, formatLevelCode, getHumanIndexRank } from '../../data/ProgressDisplay';
import { SaveData } from '../../data/SaveData';
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
const MENU_WIDTH = 720;
const MENU_HEIGHT = 1280;
const CARD_WIDTH = 620;
const CARD_HEIGHT = 760;

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
    private backgroundNode: Node | null = null;
    private centerPanelNode: Node | null = null;
    private progressNode: Node | null = null;
    private levelMetricNode: Node | null = null;
    private humanMetricNode: Node | null = null;
    private failureMetricNode: Node | null = null;

    protected onLoad(): void {
        this.applyTheme();
        this.applyLayout();
        this.syncStaticText();
        this.bindButtonEvents();
    }

    protected onDestroy(): void {
        this.unbindButtonEvents();
    }

    public bindActions(actions: MainMenuActions): void {
        this.actions = actions;
    }

    public refresh(saveData: Readonly<SaveData>, levelCount: number): void {
        this.applyLayout();
        this.syncStaticText();

        const humanIndex = calculateHumanIndex(saveData);

        if (this.currentLevelValueLabel) {
            this.currentLevelValueLabel.string = `${formatLevelCode(saveData.selectedLevelId)}\n共 ${levelCount} 关`;
        }

        if (this.humanIndexValueLabel) {
            this.humanIndexValueLabel.string = `${humanIndex}\n${getHumanIndexRank(humanIndex)}`;
        }

        if (this.failureCountValueLabel) {
            this.failureCountValueLabel.string = `失败\n${saveData.stats.totalFailures}`;
        }

        if (this.systemNoticeLabel) {
            this.systemNoticeLabel.string = buildMainMenuNotice(saveData, levelCount);
        }
    }

    public onClickStartVerify(): void {
        console.log('[MainMenuView] start click');
        this.actions?.onStart();
    }

    public onClickOpenSettings(): void {
        console.log('[MainMenuView] settings click');
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

    private applyLayout(): void {
        this.ensureTransform(this.node, MENU_WIDTH, MENU_HEIGHT);
        this.node.setPosition(new Vec3(0, 0, 0));
        this.ensureStructure();

        this.layoutPanel(this.backgroundNode, 0, 0, MENU_WIDTH, MENU_HEIGHT, UI_THEME.background, undefined, 0);
        this.layoutNode(this.centerPanelNode, 0, -8, CARD_WIDTH, CARD_HEIGHT);
        this.drawRoundedRect(this.centerPanelNode, CARD_WIDTH, CARD_HEIGHT, UI_THEME.panelRaised, 24, UI_THEME.outlineBright);
        this.layoutPanel(this.panelBackgroundSprite?.node ?? null, 0, 0, CARD_WIDTH, CARD_HEIGHT, UI_THEME.panelRaised, UI_THEME.outlineBright, 24);
        this.layoutPanel(this.panelAccentLineSprite?.node ?? null, 0, 338, CARD_WIDTH - 64, 10, UI_THEME.accent, UI_THEME.outline, 8);

        this.layoutLabel(this.titleLabel, 0, 250, 540, 62, 42, 50, 'title');
        this.layoutLabel(this.subtitleLabel, 0, 198, 540, 34, 22, 28, 'muted');
        this.layoutNode(this.progressNode, 0, 52, 540, 246);
        this.layoutMetric(this.levelMetricNode, this.currentLevelValueLabel, -178, 62, 164, 76, 'success');
        this.layoutMetric(this.humanMetricNode, this.humanIndexValueLabel, 0, 62, 164, 76, 'success');
        this.layoutMetric(this.failureMetricNode, this.failureCountValueLabel, 178, 62, 164, 76, 'danger');
        this.layoutPanel(this.noticePanelSprite?.node ?? null, 0, -54, 540, 112, UI_THEME.panelMuted, UI_THEME.accent, 18);
        this.layoutLabel(this.systemNoticeLabel, 0, -54, 492, 74, 20, 28, 'muted');
        this.layoutButton(this.startVerifyButton, this.startVerifyButtonSprite, this.startVerifyButtonLabel, 0, -220, 420, 76, 28);
        this.layoutButton(this.openSettingsButton, this.openSettingsButtonSprite, this.openSettingsButtonLabel, 0, -310, 420, 60, 22);
    }

    private ensureStructure(): void {
        this.backgroundNode = this.ensureChild(this.node, 'Background');
        this.centerPanelNode = this.ensureChild(this.node, 'CenterPanel');
        this.progressNode = this.ensureChild(this.centerPanelNode, 'Progress');
        this.levelMetricNode = this.ensureChild(this.progressNode, 'LevelMetric');
        this.humanMetricNode = this.ensureChild(this.progressNode, 'HumanMetric');
        this.failureMetricNode = this.ensureChild(this.progressNode, 'FailureMetric');

        this.reparent(this.panelBackgroundSprite?.node ?? null, this.centerPanelNode);
        this.reparent(this.panelAccentLineSprite?.node ?? null, this.centerPanelNode);
        this.reparent(this.titleLabel?.node ?? null, this.centerPanelNode);
        this.reparent(this.subtitleLabel?.node ?? null, this.centerPanelNode);
        this.reparent(this.progressNode, this.centerPanelNode);
        this.reparent(this.noticePanelSprite?.node ?? null, this.progressNode);
        this.reparent(this.levelMetricNode, this.progressNode);
        this.reparent(this.humanMetricNode, this.progressNode);
        this.reparent(this.failureMetricNode, this.progressNode);
        this.reparent(this.currentLevelValueLabel?.node ?? null, this.levelMetricNode);
        this.reparent(this.humanIndexValueLabel?.node ?? null, this.humanMetricNode);
        this.reparent(this.failureCountValueLabel?.node ?? null, this.failureMetricNode);
        this.reparent(this.systemNoticeLabel?.node ?? null, this.progressNode);
        this.reparent(this.startVerifyButton?.node ?? null, this.centerPanelNode);
        this.reparent(this.openSettingsButton?.node ?? null, this.centerPanelNode);

        this.backgroundNode.setSiblingIndex(0);
        this.centerPanelNode.setSiblingIndex(this.node.children.length - 1);
        this.panelBackgroundSprite?.node.setSiblingIndex(0);
        this.noticePanelSprite?.node.setSiblingIndex(0);
    }

    private layoutMetric(node: Node | null, label: Label | null, x: number, y: number, width: number, height: number, tone: 'success' | 'danger'): void {
        if (!node) {
            return;
        }

        this.layoutPanel(node, x, y, width, height, UI_THEME.panelMuted, tone === 'success' ? UI_THEME.accent : UI_THEME.danger, 18);
        this.layoutLabel(label, 0, 0, width - 22, height - 18, 19, 26, tone);
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
        tone: 'title' | 'muted' | 'success' | 'danger',
    ): void {
        if (!label) {
            return;
        }

        label.node.active = true;
        label.node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(label.node, width, height);
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        label.enableWrapText = true;
        label.overflow = Label.Overflow.SHRINK;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        applyLabelTone(label, tone);
    }

    private layoutButton(button: Button | null, sprite: Sprite | null, label: Label | null, x: number, y: number, width: number, height: number, fontSize: number): void {
        if (!button) {
            return;
        }

        button.node.active = true;
        button.node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(button.node, width, height);
        this.layoutPanel(sprite?.node ?? button.node, sprite ? 0 : x, sprite ? 0 : y, width, height, sprite ? sprite.color : UI_THEME.buttonPrimary, UI_THEME.outline, 18);

        if (label) {
            label.node.setPosition(new Vec3(0, 0, 0));
            this.ensureTransform(label.node, width - 36, height - 16);
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.enableWrapText = false;
            label.overflow = Label.Overflow.SHRINK;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
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

    private syncStaticText(): void {
        if (this.titleLabel) {
            this.titleLabel.string = GAME_NAME;
        }

        if (this.subtitleLabel) {
            this.subtitleLabel.string = '请认真配合这套不太聪明的系统';
        }

        if (this.startVerifyButtonLabel) {
            this.startVerifyButtonLabel.string = '开始装人类';
        }

        if (this.openSettingsButtonLabel) {
            this.openSettingsButtonLabel.string = '系统旋钮';
        }
    }

    private bindButtonEvents(): void {
        this.unbindButtonEvents();
        this.clearSerializedClickEvents(this.startVerifyButton);
        this.clearSerializedClickEvents(this.openSettingsButton);
        this.startVerifyButton?.node.on(Button.EventType.CLICK, this.onClickStartVerify, this);
        this.openSettingsButton?.node.on(Button.EventType.CLICK, this.onClickOpenSettings, this);
    }

    private unbindButtonEvents(): void {
        this.startVerifyButton?.node.off(Button.EventType.CLICK, this.onClickStartVerify, this);
        this.openSettingsButton?.node.off(Button.EventType.CLICK, this.onClickOpenSettings, this);
    }

    private clearSerializedClickEvents(button: Button | null): void {
        if (button) {
            button.clickEvents.length = 0;
        }
    }
}
