import {
    _decorator,
    BlockInputEvents,
    Button,
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    ScrollView,
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
    UI_THEME,
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
    private readonly panelHeight = 520;
    private maskNode: Node | null = null;
    private panelNode: Node | null = null;
    private messageViewportNode: Node | null = null;
    private messageContentNode: Node | null = null;
    private messageScrollView: ScrollView | null = null;

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
        this.applyResultLayout(isSuccess);

        if (this.titleLabel) {
            this.titleLabel.string = content.title;
        }

        if (this.stateLabel) {
            this.stateLabel.string = '';
            this.stateLabel.node.active = false;
        }

        const bodyText = this.composeBody(content);

        if (this.messageLabel) {
            this.messageLabel.string = bodyText;
            if (isSuccess) {
                this.layoutMessageContent(bodyText);
            }
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
        if (content.resultType === LevelResultType.Failure) {
            return '';
        }

        const fallback = content.resultType === LevelResultType.Success
            ? '你通过了本关验证。'
            : '';
        const sections = [
            fallback,
            content.message,
            content.absurdRule,
            content.aiJudgeText,
            content.systemNote ?? '',
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
        this.drawRoundedRect(this.maskNode, this.rootWidth, this.rootHeight, UI_THEME.overlay, 0);
        this.drawRoundedRect(this.panelNode, this.panelWidth, this.panelHeight, UI_THEME.panelRaised, 24, UI_THEME.outlineBright);

        const backgroundNode = this.windowBackgroundSprite?.node ?? null;
        if (backgroundNode) {
            backgroundNode.active = true;
            backgroundNode.setPosition(new Vec3(0, 0, 0));
            this.ensureTransform(backgroundNode, this.panelWidth, this.panelHeight);
        }

        this.layoutNode(this.resultStateBarSprite?.node ?? null, 0, this.panelHeight * 0.5 - 8, this.panelWidth, 8);
        this.layoutLabel(this.titleLabel, 0, 180, 480, 56, 36, 44);
        this.layoutNode(this.messageViewportNode, 0, 48, 476, 220);
        this.layoutMessageContent(this.messageLabel?.string ?? '');
        this.layoutButton(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 0, -150, 380, 64, 24);
        this.layoutButton(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 0, -220, 380, 56, 22);
    }

    private applyResultLayout(isSuccess: boolean): void {
        if (isSuccess) {
            this.layoutNode(this.panelNode, 0, 0, this.panelWidth, this.panelHeight);
            this.layoutNode(this.windowBackgroundSprite?.node ?? null, 0, 0, this.panelWidth, this.panelHeight);
            this.layoutNode(this.resultStateBarSprite?.node ?? null, 0, this.panelHeight * 0.5 - 8, this.panelWidth, 8);
            this.layoutLabel(this.titleLabel, 0, 180, 480, 56, 36, 44);
            this.layoutNode(this.messageViewportNode, 0, 48, 476, 220);
            this.layoutButton(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 0, -150, 380, 64, 24);
            this.layoutButton(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 0, -220, 380, 56, 22);
            return;
        }

        const failurePanelHeight = 340;
        this.layoutNode(this.panelNode, 0, 0, this.panelWidth, failurePanelHeight);
        this.layoutNode(this.windowBackgroundSprite?.node ?? null, 0, 0, this.panelWidth, failurePanelHeight);
        this.layoutNode(this.resultStateBarSprite?.node ?? null, 0, failurePanelHeight * 0.5 - 8, this.panelWidth, 8);
        this.layoutLabel(this.titleLabel, 0, 92, 492, 64, 36, 44);
        this.layoutButton(this.primaryButton, this.primaryButtonSprite, this.primaryButtonLabel, 0, -34, 380, 64, 24);
        this.layoutButton(this.secondaryButton, this.secondaryButtonSprite, this.secondaryButtonLabel, 0, -112, 380, 56, 22);

        if (this.messageViewportNode) {
            this.messageViewportNode.active = false;
        }

        if (this.messageContentNode) {
            this.messageContentNode.active = false;
        }
    }

    private ensureStructure(): void {
        this.maskNode = this.dimMaskSprite?.node ?? this.ensureChild(this.node, 'Mask');
        this.maskNode.name = 'Mask';
        this.maskNode.setParent(this.node, false);

        this.panelNode = this.windowBackgroundSprite?.node.parent ?? this.ensureChild(this.node, 'Panel');
        this.panelNode.name = 'Panel';
        this.panelNode.setParent(this.node, false);

        this.messageViewportNode = this.ensureChild(this.panelNode, 'MessageViewport');
        this.messageViewportNode.name = 'MessageViewport';
        this.messageContentNode = this.ensureChild(this.messageViewportNode, 'MessageContent');
        this.messageContentNode.name = 'MessageContent';
        this.ensureTransform(this.messageViewportNode, 476, 220);
        this.ensureTransform(this.messageContentNode, 476, 220);
        this.messageScrollView = this.messageViewportNode.getComponent(ScrollView) ?? this.messageViewportNode.addComponent(ScrollView);
        if (this.messageScrollView.content !== this.messageContentNode) {
            this.messageScrollView.content = this.messageContentNode;
        }
        this.messageScrollView.horizontal = false;
        this.messageScrollView.vertical = true;
        this.messageScrollView.inertia = true;
        this.messageViewportNode.getComponent(Mask) ?? this.messageViewportNode.addComponent(Mask);

        this.reparent(this.windowBackgroundSprite?.node ?? null, this.panelNode);
        this.reparent(this.resultStateBarSprite?.node ?? null, this.panelNode);
        this.reparent(this.titleLabel?.node ?? null, this.panelNode);
        this.reparent(this.stateLabel?.node ?? null, this.panelNode);
        this.reparent(this.messageViewportNode, this.panelNode);
        this.reparent(this.messageContentNode, this.messageViewportNode);
        this.reparent(this.messageLabel?.node ?? null, this.messageContentNode);
        this.reparent(this.primaryButton?.node ?? null, this.panelNode);
        this.reparent(this.secondaryButton?.node ?? null, this.panelNode);

        this.maskNode.setSiblingIndex(0);
        this.panelNode.setSiblingIndex(1);
        this.windowBackgroundSprite?.node.setSiblingIndex(0);
        this.messageViewportNode.setSiblingIndex(3);
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
        this.layoutLabel(label, 0, 0, width - 32, height - 14, fontSize, fontSize + 10);
        button.interactable = true;
    }

    private applyPopupTheme(isSuccess: boolean): void {
        const panelHeight = isSuccess ? this.panelHeight : 340;
        this.drawRoundedRect(this.panelNode, this.panelWidth, panelHeight, isSuccess ? UI_THEME.panelRaised : UI_THEME.buttonDanger, 24, isSuccess ? UI_THEME.outlineBright : UI_THEME.warning);
        this.drawRoundedRect(this.windowBackgroundSprite?.node ?? null, this.panelWidth, panelHeight, isSuccess ? UI_THEME.panelRaised : UI_THEME.buttonDanger, 24, isSuccess ? UI_THEME.outlineBright : UI_THEME.warning);
        this.drawRoundedRect(this.primaryButtonSprite?.node ?? this.primaryButton?.node ?? null, 380, 64, isSuccess ? UI_THEME.buttonPrimary : UI_THEME.warning, 18, UI_THEME.outline);
        this.drawRoundedRect(this.secondaryButtonSprite?.node ?? this.secondaryButton?.node ?? null, 380, 56, UI_THEME.buttonSecondary, 18, UI_THEME.outline);

        if (this.dimMaskSprite) {
            this.dimMaskSprite.color = UI_THEME.overlay;
        }

        if (this.titleLabel) {
            this.titleLabel.color = isSuccess ? UI_THEME.textTitle : UI_THEME.warning;
        }

        if (this.stateLabel) {
            this.stateLabel.color = isSuccess ? UI_THEME.success : UI_THEME.warning;
        }

        if (this.messageLabel) {
            this.messageLabel.color = UI_THEME.textPrimary;
        }

        if (this.primaryButtonLabel) {
            this.primaryButtonLabel.color = isSuccess ? UI_THEME.textTitle : UI_THEME.background;
        }

        if (this.secondaryButtonLabel) {
            this.secondaryButtonLabel.color = UI_THEME.textTitle;
        }
    }

    private layoutMessageContent(text: string): void {
        const viewportWidth = 476;
        const viewportHeight = 220;
        const labelWidth = 444;
        const labelFontSize = 23;
        const labelLineHeight = 32;
        const contentHeight = this.calculateBodyHeight(text, labelWidth, labelFontSize, labelLineHeight, viewportHeight);

        this.layoutNode(this.messageContentNode, 0, (viewportHeight - contentHeight) * 0.5, viewportWidth, contentHeight);
        this.layoutLabel(this.messageLabel, 0, 0, labelWidth, contentHeight, labelFontSize, labelLineHeight);

        if (this.messageLabel) {
            this.messageLabel.overflow = Label.Overflow.RESIZE_HEIGHT;
            this.messageLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.messageLabel.verticalAlign = VerticalTextAlignment.TOP;
            this.messageLabel.color = UI_THEME.textPrimary;
        }
    }

    private calculateBodyHeight(text: string, width: number, fontSize: number, lineHeight: number, minimumHeight: number): number {
        const charactersPerLine = Math.max(12, Math.floor(width / (fontSize * 0.95)));
        const paragraphs = text.split('\n');
        const lineCount = paragraphs.reduce((total, paragraph) => {
            if (paragraph.length === 0) {
                return total + 1;
            }

            return total + Math.max(1, Math.ceil(paragraph.length / charactersPerLine));
        }, 0);

        return Math.max(minimumHeight, lineCount * lineHeight + 18);
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
        graphics.lineWidth = 4;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.stroke();
    }

    private normalizeText(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    private bringToFront(node: Node): void {
        const parent = node.parent;

        if (!parent) {
            return;
        }

        node.setSiblingIndex(parent.children.length - 1);
    }
}
