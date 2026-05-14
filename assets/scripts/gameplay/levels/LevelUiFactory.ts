import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    UITransform,
    Vec3,
    VerticalTextAlignment,
} from 'cc';
import { UI_THEME } from '../../ui/theme/UITheme';

export interface LevelButtonHandle {
    node: Node;
    label: Label;
    setText: (text: string) => void;
    setColor: (color: Color) => void;
    setPosition: (x: number, y: number) => void;
}

export interface LevelCardHandle {
    node: Node;
    titleLabel: Label;
    descriptionLabel: Label;
    setSelected: (isSelected: boolean) => void;
    setPosition: (x: number, y: number) => void;
}

function ensureTransform(node: Node, width: number, height: number): UITransform {
    const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
    transform.setContentSize(width, height);
    return transform;
}

function drawRoundedRect(
    graphics: Graphics,
    width: number,
    height: number,
    fillColor: Color,
    radius: number = 16,
    strokeColor?: Color,
    lineWidth: number = 4,
): void {
    graphics.clear();
    graphics.fillColor = fillColor;
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
    graphics.fill();

    if (strokeColor) {
        graphics.strokeColor = strokeColor;
        graphics.lineWidth = lineWidth;
        graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
        graphics.stroke();
    }
}

function createTextLabel(
    parent: Node,
    name: string,
    text: string,
    width: number,
    height: number,
    fontSize: number,
    color: Color,
    x: number,
    y: number,
): Label {
    const node = new Node(name);
    parent.addChild(node);
    ensureTransform(node, width, height);
    node.setPosition(new Vec3(x, y, 0));

    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = color;
    label.enableWrapText = true;
    label.overflow = Label.Overflow.SHRINK;
    label.horizontalAlign = HorizontalTextAlignment.CENTER;
    label.verticalAlign = VerticalTextAlignment.CENTER;

    return label;
}

export function clearNodeChildren(node: Node): void {
    const children = [...node.children];
    children.forEach((child) => {
        child.destroy();
    });
}

export function getNodeSize(node: Node, fallbackWidth: number, fallbackHeight: number): { width: number; height: number } {
    const transform = node.getComponent(UITransform);

    if (!transform) {
        return { width: fallbackWidth, height: fallbackHeight };
    }

    return {
        width: transform.contentSize.width || fallbackWidth,
        height: transform.contentSize.height || fallbackHeight,
    };
}

export function createLevelPanel(
    parent: Node,
    name: string,
    width: number,
    height: number,
    color: Color,
): Node {
    const node = new Node(name);
    parent.addChild(node);
    ensureTransform(node, width, height);

    const graphics = node.addComponent(Graphics);
    drawRoundedRect(graphics, width, height, color, 16, UI_THEME.outline);
    return node;
}

export function createLevelLabel(
    parent: Node,
    name: string,
    text: string,
    options: {
        width: number;
        height: number;
        fontSize: number;
        color: Color;
        x?: number;
        y?: number;
    },
): Label {
    return createTextLabel(
        parent,
        name,
        text,
        options.width,
        options.height,
        options.fontSize,
        options.color,
        options.x ?? 0,
        options.y ?? 0,
    );
}

export function createLevelButton(
    parent: Node,
    name: string,
    text: string,
    width: number,
    height: number,
    color: Color,
    x: number,
    y: number,
): LevelButtonHandle {
    const node = new Node(name);
    parent.addChild(node);
    ensureTransform(node, width, height);
    node.setPosition(new Vec3(x, y, 0));

    const graphics = node.addComponent(Graphics);
    drawRoundedRect(graphics, width, height, color);

    const label = createTextLabel(node, `${name}Label`, text, width - 18, height - 12, 24, UI_THEME.textTitle, 0, 0);
    label.overflow = Label.Overflow.SHRINK;

    return {
        node,
        label,
        setText: (value: string) => {
            label.string = value;
        },
        setColor: (value: Color) => {
            drawRoundedRect(graphics, width, height, value, 18, UI_THEME.outline);
        },
        setPosition: (nextX: number, nextY: number) => {
            node.setPosition(new Vec3(nextX, nextY, 0));
        },
    };
}

export function createSelectableLevelCard(
    parent: Node,
    name: string,
    title: string,
    description: string,
    width: number,
    height: number,
    x: number,
    y: number,
): LevelCardHandle {
    const node = new Node(name);
    parent.addChild(node);
    ensureTransform(node, width, height);
    node.setPosition(new Vec3(x, y, 0));

    const graphics = node.addComponent(Graphics);

    const titleLabel = createTextLabel(
        node,
        `${name}TitleLabel`,
        title,
        width - 18,
        30,
        17,
        UI_THEME.textTitle,
        0,
        height * 0.5 - 23,
    );
    titleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    titleLabel.verticalAlign = VerticalTextAlignment.CENTER;

    const descriptionLabel = createTextLabel(
        node,
        `${name}DescriptionLabel`,
        description,
        width - 18,
        height - 48,
        13,
        UI_THEME.textMuted,
        0,
        -6,
    );
    descriptionLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    descriptionLabel.verticalAlign = VerticalTextAlignment.TOP;

    const applyStyle = (selected: boolean): void => {
        drawRoundedRect(
            graphics,
            width,
            height,
            selected ? UI_THEME.buttonPrimary : UI_THEME.panelRaised,
            16,
            selected ? UI_THEME.accent : UI_THEME.outline,
            selected ? 5 : 4,
        );
        titleLabel.color = selected ? UI_THEME.textTitle : UI_THEME.textPrimary;
        descriptionLabel.color = selected ? UI_THEME.textTitle : UI_THEME.textMuted;
    };

    applyStyle(false);

    return {
        node,
        titleLabel,
        descriptionLabel,
        setSelected: (isSelected: boolean) => {
            applyStyle(isSelected);
        },
        setPosition: (nextX: number, nextY: number) => {
            node.setPosition(new Vec3(nextX, nextY, 0));
        },
    };
}
