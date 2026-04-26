import { Button, Color, Label, Sprite } from 'cc';

export type UiTone = 'neutral' | 'success' | 'danger' | 'warning' | 'muted' | 'title';
export type ButtonTone = 'primary' | 'secondary' | 'danger';

export const UI_THEME = {
    background: new Color(10, 14, 18, 255),
    panel: new Color(20, 28, 34, 255),
    panelRaised: new Color(28, 38, 46, 255),
    panelMuted: new Color(16, 22, 28, 255),
    overlay: new Color(4, 8, 12, 188),
    textPrimary: new Color(232, 240, 238, 255),
    textMuted: new Color(126, 148, 152, 255),
    textTitle: new Color(244, 252, 248, 255),
    accent: new Color(79, 224, 163, 255),
    accentSoft: new Color(57, 140, 110, 255),
    success: new Color(79, 224, 163, 255),
    danger: new Color(222, 94, 94, 255),
    warning: new Color(224, 166, 79, 255),
    buttonPrimary: new Color(48, 136, 97, 255),
    buttonSecondary: new Color(55, 67, 77, 255),
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

export function applyPanelStyle(sprite: Sprite | null, raised: boolean = false): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(raised ? UI_THEME.panelRaised : UI_THEME.panel);
}

export function applyMutedPanelStyle(sprite: Sprite | null): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(UI_THEME.panelMuted);
}

export function applyMaskStyle(sprite: Sprite | null): void {
    if (!sprite) {
        return;
    }

    sprite.color = copyColor(UI_THEME.overlay);
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
    }

    if (sprite) {
        sprite.color = copyColor(getButtonColor(tone));
    }

    if (label) {
        label.color = copyColor(UI_THEME.textTitle);
    }
}
