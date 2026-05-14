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
import { VOLUME_STEP } from '../../data/GameConst';
import { AudioSettingsData } from '../../data/SaveData';
import { BasePanel } from '../base/BasePanel';
import {
    applyButtonTheme,
    applyLabelTone,
    applyMaskStyle,
    UI_THEME,
} from '../theme/UITheme';

const { ccclass, property } = _decorator;
const ROOT_WIDTH = 720;
const ROOT_HEIGHT = 1280;
const PANEL_WIDTH = 560;
const PANEL_HEIGHT = 520;

export interface SettingsPopupActions {
    onAdjustBgm: (delta: number) => void;
    onAdjustSfx: (delta: number) => void;
    onToggleMute: () => void;
    onToggleVibration: () => void;
    onResetProgress: () => void;
    onClose: () => void;
}

@ccclass('SettingsPopup')
export class SettingsPopup extends BasePanel {
    @property(Sprite)
    public dimMaskSprite: Sprite | null = null;

    @property(Sprite)
    public windowBackgroundSprite: Sprite | null = null;

    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public soundStateValueLabel: Label | null = null;

    @property(Label)
    public bgmValueLabel: Label | null = null;

    @property(Label)
    public sfxValueLabel: Label | null = null;

    @property(Label)
    public vibrationStateValueLabel: Label | null = null;

    @property(Label)
    public resetHintLabel: Label | null = null;

    @property(Button)
    public toggleSoundButton: Button | null = null;

    @property(Sprite)
    public toggleSoundButtonSprite: Sprite | null = null;

    @property(Label)
    public toggleSoundButtonLabel: Label | null = null;

    @property(Button)
    public bgmDownButton: Button | null = null;

    @property(Sprite)
    public bgmDownButtonSprite: Sprite | null = null;

    @property(Label)
    public bgmDownButtonLabel: Label | null = null;

    @property(Button)
    public bgmUpButton: Button | null = null;

    @property(Sprite)
    public bgmUpButtonSprite: Sprite | null = null;

    @property(Label)
    public bgmUpButtonLabel: Label | null = null;

    @property(Button)
    public sfxDownButton: Button | null = null;

    @property(Sprite)
    public sfxDownButtonSprite: Sprite | null = null;

    @property(Label)
    public sfxDownButtonLabel: Label | null = null;

    @property(Button)
    public sfxUpButton: Button | null = null;

    @property(Sprite)
    public sfxUpButtonSprite: Sprite | null = null;

    @property(Label)
    public sfxUpButtonLabel: Label | null = null;

    @property(Button)
    public toggleVibrationButton: Button | null = null;

    @property(Sprite)
    public toggleVibrationButtonSprite: Sprite | null = null;

    @property(Label)
    public toggleVibrationButtonLabel: Label | null = null;

    @property(Button)
    public resetProgressButton: Button | null = null;

    @property(Sprite)
    public resetProgressButtonSprite: Sprite | null = null;

    @property(Label)
    public resetProgressButtonLabel: Label | null = null;

    @property(Button)
    public closeButton: Button | null = null;

    @property(Sprite)
    public closeButtonSprite: Sprite | null = null;

    @property(Label)
    public closeButtonLabel: Label | null = null;

    private actions: SettingsPopupActions | null = null;
    private maskNode: Node | null = null;
    private panelNode: Node | null = null;
    private contentNode: Node | null = null;

    protected onLoad(): void {
        this.applyTheme();
        this.applyLayout();
        this.syncStaticText();
        this.enableInputBlocker();
        this.bindButtonEvents();
    }

    protected onDestroy(): void {
        this.unbindButtonEvents();
    }

    public hide(): void {
        this.resetContent();
        super.hide();
    }

    public bindActions(actions: SettingsPopupActions): void {
        this.actions = actions;
    }

    public refresh(settings: AudioSettingsData): void {
        this.applyLayout();
        this.resetContent();
        this.syncStaticText();

        if (this.soundStateValueLabel) {
            this.soundStateValueLabel.string = `声音：${settings.isMuted ? '关闭' : '开启'}`;
        }

        if (this.bgmValueLabel) {
            this.bgmValueLabel.string = `音乐：${Math.round(settings.bgmVolume * 100)}%`;
        }

        if (this.sfxValueLabel) {
            this.sfxValueLabel.string = `音效：${Math.round(settings.sfxVolume * 100)}%`;
        }

        if (this.vibrationStateValueLabel) {
            this.vibrationStateValueLabel.string = `震动：${settings.vibrationEnabled ? '开启' : '关闭'}`;
        }

        if (this.toggleSoundButtonLabel) {
            this.toggleSoundButtonLabel.string = settings.isMuted ? '开启声音' : '静音';
        }

        if (this.toggleVibrationButtonLabel) {
            this.toggleVibrationButtonLabel.string = settings.vibrationEnabled ? '关闭震动' : '开启震动';
        }
    }

    public onClickToggleSound(): void {
        console.log('[SettingsPopup] toggle sound click');
        this.actions?.onToggleMute();
    }

    public onClickBgmDown(): void {
        console.log('[SettingsPopup] bgm down click');
        this.actions?.onAdjustBgm(-VOLUME_STEP);
    }

    public onClickBgmUp(): void {
        console.log('[SettingsPopup] bgm up click');
        this.actions?.onAdjustBgm(VOLUME_STEP);
    }

    public onClickSfxDown(): void {
        console.log('[SettingsPopup] sfx down click');
        this.actions?.onAdjustSfx(-VOLUME_STEP);
    }

    public onClickSfxUp(): void {
        console.log('[SettingsPopup] sfx up click');
        this.actions?.onAdjustSfx(VOLUME_STEP);
    }

    public onClickToggleVibration(): void {
        console.log('[SettingsPopup] toggle vibration click');
        this.actions?.onToggleVibration();
    }

    public onClickResetProgress(): void {
        console.log('[SettingsPopup] reset progress click');
        this.actions?.onResetProgress();
    }

    public onClickClose(): void {
        console.log('[SettingsPopup] close click');
        if (this.actions) {
            this.actions.onClose();
            return;
        }

        this.hide();
    }

    public resetContent(): void {
        if (this.soundStateValueLabel) {
            this.soundStateValueLabel.string = '';
        }

        if (this.bgmValueLabel) {
            this.bgmValueLabel.string = '';
        }

        if (this.sfxValueLabel) {
            this.sfxValueLabel.string = '';
        }

        if (this.vibrationStateValueLabel) {
            this.vibrationStateValueLabel.string = '';
        }
    }

    private applyTheme(): void {
        applyMaskStyle(this.dimMaskSprite);
        applyLabelTone(this.titleLabel, 'title');
        applyLabelTone(this.soundStateValueLabel, 'success');
        applyLabelTone(this.bgmValueLabel, 'success');
        applyLabelTone(this.sfxValueLabel, 'success');
        applyLabelTone(this.vibrationStateValueLabel, 'success');
        applyLabelTone(this.resetHintLabel, 'muted');
        applyButtonTheme(this.toggleSoundButton, this.toggleSoundButtonSprite, this.toggleSoundButtonLabel, 'secondary');
        applyButtonTheme(this.bgmDownButton, this.bgmDownButtonSprite, this.bgmDownButtonLabel, 'secondary');
        applyButtonTheme(this.bgmUpButton, this.bgmUpButtonSprite, this.bgmUpButtonLabel, 'secondary');
        applyButtonTheme(this.sfxDownButton, this.sfxDownButtonSprite, this.sfxDownButtonLabel, 'secondary');
        applyButtonTheme(this.sfxUpButton, this.sfxUpButtonSprite, this.sfxUpButtonLabel, 'secondary');
        applyButtonTheme(
            this.toggleVibrationButton,
            this.toggleVibrationButtonSprite,
            this.toggleVibrationButtonLabel,
            'secondary',
        );
        applyButtonTheme(this.resetProgressButton, this.resetProgressButtonSprite, this.resetProgressButtonLabel, 'danger');
        applyButtonTheme(this.closeButton, this.closeButtonSprite, this.closeButtonLabel, 'secondary');
    }

    private applyLayout(): void {
        this.ensureTransform(this.node, ROOT_WIDTH, ROOT_HEIGHT);
        this.node.setPosition(new Vec3(0, 0, 0));
        this.bringToFront(this.node);
        this.ensureStructure();

        this.layoutPanel(this.maskNode, 0, 0, ROOT_WIDTH, ROOT_HEIGHT, UI_THEME.overlay, 0);
        this.layoutNode(this.panelNode, 0, 0, PANEL_WIDTH, PANEL_HEIGHT);
        this.drawRoundedRect(this.panelNode, PANEL_WIDTH, PANEL_HEIGHT, UI_THEME.panelRaised, 24, UI_THEME.outlineBright);
        this.layoutNode(this.contentNode, 0, 12, PANEL_WIDTH, 356);

        if (this.windowBackgroundSprite?.node) {
            this.windowBackgroundSprite.node.active = true;
            this.windowBackgroundSprite.node.setPosition(new Vec3(0, 0, 0));
            this.drawRoundedRect(this.windowBackgroundSprite.node, PANEL_WIDTH, PANEL_HEIGHT, UI_THEME.panelRaised, 24, UI_THEME.outlineBright);
        }

        this.layoutLabel(this.titleLabel, 0, 202, 460, 54, 34, 42, UI_THEME.textTitle);
        this.layoutLabel(this.soundStateValueLabel, -105, 122, 230, 34, 22, 30, UI_THEME.textPrimary);
        this.layoutButton(this.toggleSoundButton, this.toggleSoundButtonSprite, this.toggleSoundButtonLabel, 158, 122, 190, 52, 20, 'secondary');
        this.layoutLabel(this.bgmValueLabel, -122, 62, 210, 34, 22, 30, UI_THEME.textPrimary);
        this.layoutButton(this.bgmDownButton, this.bgmDownButtonSprite, this.bgmDownButtonLabel, 86, 62, 92, 50, 18, 'secondary');
        this.layoutButton(this.bgmUpButton, this.bgmUpButtonSprite, this.bgmUpButtonLabel, 196, 62, 92, 50, 18, 'secondary');
        this.layoutLabel(this.sfxValueLabel, -122, 2, 210, 34, 22, 30, UI_THEME.textPrimary);
        this.layoutButton(this.sfxDownButton, this.sfxDownButtonSprite, this.sfxDownButtonLabel, 86, 2, 92, 50, 18, 'secondary');
        this.layoutButton(this.sfxUpButton, this.sfxUpButtonSprite, this.sfxUpButtonLabel, 196, 2, 92, 50, 18, 'secondary');
        this.layoutLabel(this.vibrationStateValueLabel, -105, -58, 230, 34, 22, 30, UI_THEME.textPrimary);
        this.layoutButton(this.toggleVibrationButton, this.toggleVibrationButtonSprite, this.toggleVibrationButtonLabel, 158, -58, 190, 52, 20, 'secondary');
        this.layoutLabel(this.resetHintLabel, 0, -118, 440, 34, 18, 24, UI_THEME.textMuted);
        this.layoutButton(this.resetProgressButton, this.resetProgressButtonSprite, this.resetProgressButtonLabel, 0, -170, 260, 56, 20, 'danger');
        this.layoutButton(this.closeButton, this.closeButtonSprite, this.closeButtonLabel, 0, -226, 360, 64, 24, 'primary');
    }

    private ensureStructure(): void {
        this.maskNode = this.dimMaskSprite?.node ?? this.ensureChild(this.node, 'Mask');
        this.maskNode.name = 'Mask';
        this.maskNode.setParent(this.node, false);

        this.panelNode = this.windowBackgroundSprite?.node.parent ?? this.ensureChild(this.node, 'Panel');
        this.panelNode.name = 'Panel';
        this.panelNode.setParent(this.node, false);

        this.contentNode = this.ensureChild(this.panelNode, 'Content');

        this.reparent(this.windowBackgroundSprite?.node ?? null, this.panelNode);
        this.reparent(this.titleLabel?.node ?? null, this.panelNode);
        this.reparent(this.contentNode, this.panelNode);
        this.reparent(this.closeButton?.node ?? null, this.panelNode);

        this.reparent(this.soundStateValueLabel?.node ?? null, this.contentNode);
        this.reparent(this.toggleSoundButton?.node ?? null, this.contentNode);
        this.reparent(this.bgmValueLabel?.node ?? null, this.contentNode);
        this.reparent(this.bgmDownButton?.node ?? null, this.contentNode);
        this.reparent(this.bgmUpButton?.node ?? null, this.contentNode);
        this.reparent(this.sfxValueLabel?.node ?? null, this.contentNode);
        this.reparent(this.sfxDownButton?.node ?? null, this.contentNode);
        this.reparent(this.sfxUpButton?.node ?? null, this.contentNode);
        this.reparent(this.vibrationStateValueLabel?.node ?? null, this.contentNode);
        this.reparent(this.toggleVibrationButton?.node ?? null, this.contentNode);
        this.reparent(this.resetHintLabel?.node ?? null, this.contentNode);
        this.reparent(this.resetProgressButton?.node ?? null, this.contentNode);

        this.maskNode.setSiblingIndex(0);
        this.panelNode.setSiblingIndex(1);
        this.windowBackgroundSprite?.node.setSiblingIndex(0);
        this.contentNode.setSiblingIndex(this.panelNode.children.length - 2);
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

    private layoutPanel(node: Node | null, x: number, y: number, width: number, height: number, fillColor: Color, radius: number): void {
        if (!node) {
            return;
        }

        node.active = true;
        node.setPosition(new Vec3(x, y, 0));
        this.drawRoundedRect(node, width, height, fillColor, radius);
    }

    private layoutNode(node: Node | null, x: number, y: number, width: number, height: number): void {
        if (!node) {
            return;
        }

        node.active = true;
        node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(node, width, height);
    }

    private layoutLabel(label: Label | null, x: number, y: number, width: number, height: number, fontSize: number, lineHeight: number, color: Color): void {
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
        label.color = color;
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

        button.node.active = true;
        button.node.setPosition(new Vec3(x, y, 0));
        this.ensureTransform(button.node, width, height);

        const fillColor = tone === 'primary'
            ? UI_THEME.buttonPrimary
            : tone === 'danger'
                ? UI_THEME.buttonDanger
                : UI_THEME.buttonSecondary;
        const labelColor = UI_THEME.textTitle;

        const backgroundNode = sprite?.node ?? button.node;
        backgroundNode.active = true;
        backgroundNode.setPosition(new Vec3(sprite ? 0 : x, sprite ? 0 : y, 0));
        this.drawRoundedRect(backgroundNode, width, height, fillColor, 18, UI_THEME.outline);
        applyButtonTheme(button, sprite, label, tone);

        if (!label) {
            return;
        }

        label.node.setPosition(new Vec3(0, 0, 0));
        this.ensureTransform(label.node, width - 24, height - 12);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.enableWrapText = false;
        label.overflow = Label.Overflow.SHRINK;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.color = labelColor;
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

    private bringToFront(node: Node): void {
        const parent = node.parent;

        if (!parent) {
            return;
        }

        node.setSiblingIndex(parent.children.length - 1);
    }

    private syncStaticText(): void {
        if (this.titleLabel) {
            this.titleLabel.string = '系统旋钮';
        }

        if (this.bgmDownButtonLabel) {
            this.bgmDownButtonLabel.string = '音乐 -';
        }

        if (this.bgmUpButtonLabel) {
            this.bgmUpButtonLabel.string = '音乐 +';
        }

        if (this.sfxDownButtonLabel) {
            this.sfxDownButtonLabel.string = '音效 -';
        }

        if (this.sfxUpButtonLabel) {
            this.sfxUpButtonLabel.string = '音效 +';
        }

        if (this.resetProgressButtonLabel) {
            this.resetProgressButtonLabel.string = '重置进度';
        }

        if (this.closeButtonLabel) {
            this.closeButtonLabel.string = '收工';
        }

        if (this.resetHintLabel) {
            this.resetHintLabel.string = '重置只会清除本地进度。';
        }
    }

    private bindButtonEvents(): void {
        this.unbindButtonEvents();
        this.clearSerializedClickEvents(this.toggleSoundButton);
        this.clearSerializedClickEvents(this.bgmDownButton);
        this.clearSerializedClickEvents(this.bgmUpButton);
        this.clearSerializedClickEvents(this.sfxDownButton);
        this.clearSerializedClickEvents(this.sfxUpButton);
        this.clearSerializedClickEvents(this.toggleVibrationButton);
        this.clearSerializedClickEvents(this.resetProgressButton);
        this.clearSerializedClickEvents(this.closeButton);

        this.toggleSoundButton?.node.on(Button.EventType.CLICK, this.onClickToggleSound, this);
        this.bgmDownButton?.node.on(Button.EventType.CLICK, this.onClickBgmDown, this);
        this.bgmUpButton?.node.on(Button.EventType.CLICK, this.onClickBgmUp, this);
        this.sfxDownButton?.node.on(Button.EventType.CLICK, this.onClickSfxDown, this);
        this.sfxUpButton?.node.on(Button.EventType.CLICK, this.onClickSfxUp, this);
        this.toggleVibrationButton?.node.on(Button.EventType.CLICK, this.onClickToggleVibration, this);
        this.resetProgressButton?.node.on(Button.EventType.CLICK, this.onClickResetProgress, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this.onClickClose, this);
        this.dimMaskSprite?.node.on(Node.EventType.TOUCH_END, this.onClickClose, this);
    }

    private unbindButtonEvents(): void {
        this.toggleSoundButton?.node.off(Button.EventType.CLICK, this.onClickToggleSound, this);
        this.bgmDownButton?.node.off(Button.EventType.CLICK, this.onClickBgmDown, this);
        this.bgmUpButton?.node.off(Button.EventType.CLICK, this.onClickBgmUp, this);
        this.sfxDownButton?.node.off(Button.EventType.CLICK, this.onClickSfxDown, this);
        this.sfxUpButton?.node.off(Button.EventType.CLICK, this.onClickSfxUp, this);
        this.toggleVibrationButton?.node.off(Button.EventType.CLICK, this.onClickToggleVibration, this);
        this.resetProgressButton?.node.off(Button.EventType.CLICK, this.onClickResetProgress, this);
        this.closeButton?.node.off(Button.EventType.CLICK, this.onClickClose, this);
        this.dimMaskSprite?.node.off(Node.EventType.TOUCH_END, this.onClickClose, this);
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
}
