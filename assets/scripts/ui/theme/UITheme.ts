import { Button, Color, Graphics, Label, Node, Sprite, UITransform } from 'cc';

export type UiTone = 'neutral' | 'success' | 'danger' | 'warning' | 'muted' | 'title';
export type ButtonTone = 'primary' | 'secondary' | 'danger';

export const UI_THEME = {
    background: new Color(18, 26, 36, 255),
    panel: new Color(42, 54, 66, 244),
    panelRaised: new Color(54, 68, 80, 248),
    panelMuted: new Color(34, 44, 56, 236),
    overlay: new Color(0, 0, 0, 190),
    textPrimary: new Color(232, 240, 238, 255),
    textMuted: new Color(126, 148, 152, 255),
    textTitle: new Color(244, 252, 248, 255),
    accent: new Color(79, 224, 163, 255),
    accentSoft: new Color(57, 140, 110, 255),
    success: new Color(79, 224, 163, 255),
    danger: new Color(222, 94, 94, 255),
    warning: new Color(224, 166, 79, 255),
    buttonPrimary: new Color(48, 136, 97, 255),
    buttonSecondary: new Color(76, 98, 116, 255),
    buttonDanger: new Color(132, 56, 56, 255),
};

function copyColor(source: Color): Color {
    return new Color(source.r, source.g, source.b, source.a);
}

function getToneColor(tone: UiTone): Color {
    switch (tone) {
    case 'success':
        return UI_THEME.success;
    case 'danger':
        return UI_THEME.danger;
    case 'warning':
        return UI_THEME.warning;
    case 'muted':
        return UI_THEME.textMuted;
    case 'title':
        return UI_THEME.textTitle;
    default:
        return UI_THEME.textPrimary;
    }
}

function getButtonColor(tone: ButtonTone): Color {
    switch (tone) {
    case 'primary':
        return UI_THEME.buttonPrimary;
    case 'danger':
        return UI_THEME.buttonDanger;
    default:
        return UI_THEME.buttonSecondary;
    }
}

function ensureTransform(node: Node, width: number, height: number): UITransform {
    const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
    transform.setContentSize(width, height);
    return transform;
}

function drawRoundedRect(node: Node, width: number, height: number, fillColor: Color, radius = 8, strokeColor?: Color): void {
    ensureTransform(node, width, height);

    const graphics = node.getComponent(Graphics) ?? node.addComponent(Graphics);
    graphics.clear();
    graphics.fillColor = copyColor(fillColor);
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
    graphics.fill();

    if (!strokeColor) {
        return;
    }

    graphics.strokeColor = copyColor(strokeColor);
    graphics.lineWidth = 2;
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
    graphics.stroke();
}

export function applyPanelStyle(sprite: Sprite | null, raised: boolean = false): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(raised ? UI_THEME.panelRaised : UI_THEME.panel);
    drawRoundedRect(sprite.node, sprite.node.getComponent(UITransform)?.contentSize.width ?? 560, sprite.node.getComponent(UITransform)?.contentSize.height ?? 420, raised ? UI_THEME.panelRaised : UI_THEME.panel, 8);
}

export function applyMutedPanelStyle(sprite: Sprite | null): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(UI_THEME.panelMuted);
    drawRoundedRect(sprite.node, sprite.node.getComponent(UITransform)?.contentSize.width ?? 520, sprite.node.getComponent(UITransform)?.contentSize.height ?? 180, UI_THEME.panelMuted, 8, new Color(84, 104, 120, 255));
}

export function applyMaskStyle(sprite: Sprite | null): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(UI_THEME.overlay);
    drawRoundedRect(sprite.node, 720, 1280, UI_THEME.overlay, 0);
}

export function applyAccentStyle(sprite: Sprite | null, tone: UiTone = 'success'): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(getToneColor(tone));
}

export function applyLabelTone(label: Label | null, tone: UiTone): void {
    if (!label) {
        return;
    }

    label.color = copyColor(getToneColor(tone));
}

export function applyButtonTheme(
    button: Button | null,
    sprite: Sprite | null,
    label: Label | null,
    tone: ButtonTone,
): void {
    if (button) {
        button.interactable = true;
        button.target = sprite?.node ?? button.node;
        button.transition = Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 1.04;
    }

    if (sprite) {
        sprite.color = copyColor(getButtonColor(tone));
        drawRoundedRect(sprite.node, sprite.node.getComponent(UITransform)?.contentSize.width ?? 360, sprite.node.getComponent(UITransform)?.contentSize.height ?? 72, getButtonColor(tone), 8);
    } else if (button) {
        drawRoundedRect(button.node, button.node.getComponent(UITransform)?.contentSize.width ?? 360, button.node.getComponent(UITransform)?.contentSize.height ?? 72, getButtonColor(tone), 8);
    }

    if (label) {
        label.color = copyColor(UI_THEME.textTitle);
    }
}
