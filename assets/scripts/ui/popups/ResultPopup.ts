import {
    _decorator,
    BlockInputEvents,
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
import { LevelResultType } from '../../data/GameConst';
import { BasePanel } from '../base/BasePanel';
import {
    applyAccentStyle,
    applyButtonTheme,
    applyMaskStyle,
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
    private readonly rootWidth = 720;
    private readonly rootHeight = 1280;
    private readonly panelWidth = 560;
    private readonly panelHeight = 420;
    private maskNode: Node | null = null;
    private panelNode: Node | null = null;

    protected onLoad(): void {
        this.applyBaseTheme();
        this.enableInputBlocker();
        this.bindButtonEvents();
    }

    protected onDestroy(): void {
        this.unbindButtonEvents();
    }

    public hide(): void {
        super.hide();
        this.resetContent();
    }

    public bindActions(actions: ResultPopupActions): void {
        this.actions = actions;
    }

    public refresh(content: ResultPopupContent): void {
        console.log(`[ResultPopup] show result: ${content.resultType}`);
        this.resetContent();
        this.ensurePopupLayout();

        const isSuccess = content.resultType === LevelResultType.Success;

        if (this.titleLabel) {
            this.titleLabel.string = content.title;
        }

        if (this.stateLabel) {
            this.stateLabel.string = '';
            this.stateLabel.node.active = false;
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
        applyButtonTheme(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, isSuccess ? 'primary' : 'danger');
        applyButtonTheme(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 'secondary');
        this.applyPopupTheme(isSuccess);
    }

    private composeBody(content: ResultPopupContent): string {
        const fallback = content.resultType === LevelResultType.Success
            ? '你通过了本关验证。'
            : '请重新尝试本关。';
        const sections = [
            fallback,
            content.message,
        ]
            .map((item) => this.normalizeText(item))
            .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index);

        return sections.join('\n\n');
    }

    public onClickPrimary(): void {
        console.log('[ResultPopup] primary click');
        if (this.actions) {
            this.actions.onPrimary();
            return;
        }

        this.hide();
    }

    public onClickSecondary(): void {
        console.log('[ResultPopup] secondary click / back to menu');
        if (this.actions) {
            this.actions.onSecondary();
            return;
        }

        this.hide();
    }

    public resetContent(): void {
        if (this.titleLabel) {
            this.titleLabel.string = '';
        }

        if (this.stateLabel) {
            this.stateLabel.string = '';
        }

        if (this.messageLabel) {
            this.messageLabel.string = '';
        }

        if (this.primaryButtonLabel) {
            this.primaryButtonLabel.string = '';
        }

        if (this.secondaryButtonLabel) {
            this.secondaryButtonLabel.string = '';
        }
    }

    private bindButtonEvents(): void {
        this.unbindButtonEvents();
        this.clearSerializedClickEvents(this.primaryButton);
        this.clearSerializedClickEvents(this.secondaryButton);
        this.primaryButton?.node.on(Button.EventType.CLICK, this.onClickPrimary, this);
        this.secondaryButton?.node.on(Button.EventType.CLICK, this.onClickSecondary, this);
    }

    private unbindButtonEvents(): void {
        this.primaryButton?.node.off(Button.EventType.CLICK, this.onClickPrimary, this);
        this.secondaryButton?.node.off(Button.EventType.CLICK, this.onClickSecondary, this);
    }

    private clearSerializedClickEvents(button: Button | null): void {
        if (button) {
            button.clickEvents.length = 0;
        }
    }

    private enableInputBlocker(): void {
        this.ensureBlockInput(this.node);
        this.ensureBlockInput(this.dimMaskSprite?.node ?? null);
        this.ensureBlockInput(this.windowBackgroundSprite?.node ?? null);
    }

    private ensureBlockInput(node: Node | null): void {
        if (node && !node.getComponent(BlockInputEvents)) {
            node.addComponent(BlockInputEvents);
        }
    }

    private applyBaseTheme(): void {
        applyMaskStyle(this.dimMaskSprite);
        this.ensurePopupLayout();
        applyButtonTheme(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 'primary');
        applyButtonTheme(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 'secondary');
        this.applyPopupTheme(true);
    }

    private ensurePopupLayout(): void {
        this.ensureTransform(this.node, this.rootWidth, this.rootHeight);
        this.node.setPosition(new Vec3(0, 0, 0));
        this.bringToFront(this.node);
        this.ensureStructure();

        this.layoutNode(this.maskNode, 0, 0, this.rootWidth, this.rootHeight);
        this.layoutNode(this.panelNode, 0, 0, this.panelWidth, this.panelHeight);
        this.drawRoundedRect(this.maskNode, this.rootWidth, this.rootHeight, new Color(0, 0, 0, 190), 0);
        this.drawRoundedRect(this.panelNode, this.panelWidth, this.panelHeight, new Color(245, 248, 246, 255), 8, new Color(178, 194, 194, 255));

        const backgroundNode = this.windowBackgroundSprite?.node ?? null;
        if (backgroundNode) {
            backgroundNode.active = true;
            backgroundNode.setPosition(new Vec3(0, 0, 0));
            this.ensureTransform(backgroundNode, this.panelWidth, this.panelHeight);
        }

        this.layoutNode(this.resultStateBarSprite?.node ?? null, 0, this.panelHeight * 0.5 - 8, this.panelWidth, 8);
        this.layoutLabel(this.titleLabel, 0, 132, 480, 54, 36, 44);
        this.layoutLabel(this.messageLabel, 0, 38, 460, 118, 24, 32);
        this.layoutButton(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 0, -88, 360, 72, 26);
        this.layoutButton(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 0, -170, 360, 64, 24);
    }

    private ensureStructure(): void {
        this.maskNode = this.dimMaskSprite?.node ?? this.ensureChild(this.node, 'Mask');
        this.maskNode.name = 'Mask';
        this.maskNode.setParent(this.node, false);

        this.panelNode = this.windowBackgroundSprite?.node.parent ?? this.ensureChild(this.node, 'Panel');
        this.panelNode.name = 'Panel';
        this.panelNode.setParent(this.node, false);

        this.reparent(this.windowBackgroundSprite?.node ?? null, this.panelNode);
        this.reparent(this.resultStateBarSprite?.node ?? null, this.panelNode);
        this.reparent(this.titleLabel?.node ?? null, this.panelNode);
        this.reparent(this.stateLabel?.node ?? null, this.panelNode);
        this.reparent(this.messageLabel?.node ?? null, this.panelNode);
        this.reparent(this.primaryButton?.node ?? null, this.panelNode);
        this.reparent(this.secondaryButton?.node ?? null, this.panelNode);

        this.maskNode.setSiblingIndex(0);
        this.panelNode.setSiblingIndex(1);
        this.windowBackgroundSprite?.node.setSiblingIndex(0);
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

    private ensureTransform(node: Node, width: number, height: number): UITransform {
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
        return transform;
    }

    private layoutNode(node: Node | null, x: number, y: number, width: number, height: number): void {
        if (!node) {
            return;
        }

        node.active = true;
        node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(node, width, height);
    }

    private layoutLabel(label: Label | null, x: number, y: number, width: number, height: number, fontSize: number, lineHeight: number): void {
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
    }

    private layoutButton(button: Button | null, sprite: Sprite | null, label: Label | null, x: number, y: number, width: number, height: number, fontSize: number): void {
        if (!button) {
            return;
        }

        this.layoutNode(button.node, x, y, width, height);
        this.layoutNode(sprite?.node ?? null, 0, 0, width, height);
        this.layoutLabel(label, 0, 0, width - 32, height - 14, fontSize, fontSize + 8);
        button.interactable = true;
    }

    private applyPopupTheme(isSuccess: boolean): void {
        this.drawRoundedRect(this.windowBackgroundSprite?.node ?? null, this.panelWidth, this.panelHeight, new Color(245, 248, 246, 255), 8, new Color(178, 194, 194, 255));
        this.drawRoundedRect(this.primaryButtonSprite?.node ?? this.primaryButton?.node ?? null, 360, 72, isSuccess ? new Color(30, 148, 114, 255) : new Color(197, 72, 78, 255), 8);
        this.drawRoundedRect(this.secondaryButtonSprite?.node ?? this.secondaryButton?.node ?? null, 360, 64, new Color(216, 224, 224, 255), 8, new Color(136, 150, 154, 255));

        if (this.dimMaskSprite) {
            this.dimMaskSprite.color = new Color(0, 0, 0, 190);
        }

        if (this.titleLabel) {
            this.titleLabel.color = new Color(20, 32, 38, 255);
        }

        if (this.stateLabel) {
            this.stateLabel.color = isSuccess ? new Color(20, 130, 93, 255) : new Color(176, 50, 56, 255);
        }

        if (this.messageLabel) {
            this.messageLabel.color = new Color(48, 60, 66, 255);
        }

        if (this.primaryButtonLabel) {
            this.primaryButtonLabel.color = new Color(255, 255, 255, 255);
        }

        if (this.secondaryButtonLabel) {
            this.secondaryButtonLabel.color = new Color(36, 48, 54, 255);
        }
    }

    private drawRoundedRect(node: Node | null, width: number, height: number, fillColor: Color, radius: number, strokeColor?: Color): void {
        if (!node) {
            return;
        }

        const graphics = node.getComponent(Graphics) ?? node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = fillColor;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.fill();

        if (!strokeColor) {
            return;
        }

        graphics.strokeColor = strokeColor;
        graphics.lineWidth = 2;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.stroke();
    }

    private normalizeText(text: string): string {
        return this.truncateText(text.replace(/\s+/g, ' ').trim(), 54);
    }

    private truncateText(text: string, maxLength: number): string {
        const normalized = text.replace(/\s+/g, ' ').trim();

        if (normalized.length <= maxLength) {
            return normalized;
        }

        return `${normalized.slice(0, maxLength)}...`;
    }

    private bringToFront(node: Node): void {
        const parent = node.parent;

        if (!parent) {
            return;
        }

        node.setSiblingIndex(parent.children.length - 1);
    }
}
