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
    radius: number = 8,
    strokeColor?: Color,
    lineWidth: number = 2,
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
    drawRoundedRect(graphics, width, height, color, 8, new Color(96, 118, 132, 255));
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

    const label = createTextLabel(node, `${name}Label`, text, width - 18, height - 12, 24, new Color(244, 252, 248, 255), 0, 0);
    label.overflow = Label.Overflow.SHRINK;

    return {
        node,
        label,
        setText: (value: string) => {
            label.string = value;
        },
        setColor: (value: Color) => {
            drawRoundedRect(graphics, width, height, value, 8, new Color(116, 136, 148, 255));
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
        new Color(244, 252, 248, 255),
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
        new Color(188, 206, 210, 255),
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
            selected ? new Color(48, 112, 84, 255) : new Color(50, 62, 74, 255),
            8,
            selected ? new Color(92, 244, 178, 255) : new Color(116, 136, 148, 255),
            selected ? 3 : 2,
        );
        titleLabel.color = selected ? new Color(244, 252, 248, 255) : new Color(220, 232, 228, 255);
        descriptionLabel.color = selected ? new Color(214, 232, 226, 255) : new Color(150, 168, 172, 255);
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
