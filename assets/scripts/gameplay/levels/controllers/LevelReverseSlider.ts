import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    Input,
    Node,
    UITransform,
    Vec3,
    input,
} from 'cc';
import {
    ReverseSliderLevelConfig,
    SliderDirection,
    SliderDragRange,
} from '../../../data/LevelConfig';
import { BaseLevelController } from '../BaseLevelController';
import { LevelValidationResult } from '../LevelControllerTypes';
import {
    createLevelLabel,
    createLevelPanel,
    getNodeSize,
} from '../LevelUiFactory';
import { UI_THEME } from '../../../ui/theme/UITheme';
import { LevelResultType } from '../../../data/GameConst';

type SliderPointerEvent = EventMouse | EventTouch;
type DragDirection = SliderDirection | 'none';
type SliderFailureReason = 'no-drag' | 'ordinary-direction' | 'path-too-direct' | 'threshold-not-reached';

function clamp01(value: number): number {
    if (value <= 0) {
        return 0;
    }

    if (value >= 1) {
        return 1;
    }

    return value;
}

function clamp(value: number, min: number, max: number): number {
    if (value <= min) {
        return min;
    }

    if (value >= max) {
        return max;
    }

    return value;
}

function copyColor(color: Color): Color {
    return new Color(color.r, color.g, color.b, color.a);
}

function drawRoundedRect(
    graphics: Graphics,
    width: number,
    height: number,
    fillColor: Color,
    radius: number,
    strokeColor?: Color,
    lineWidth: number = 2,
): void {
    graphics.clear();
    graphics.fillColor = copyColor(fillColor);
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
    graphics.fill();

    if (!strokeColor) {
        return;
    }

    graphics.strokeColor = copyColor(strokeColor);
    graphics.lineWidth = lineWidth;
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, radius);
    graphics.stroke();
}

function getDirectionSign(direction: SliderDirection): number {
    return direction === 'left' ? -1 : 1;
}

function getDirectionLabel(direction: SliderDirection): string {
    return direction === 'left' ? 'LEFT' : 'RIGHT';
}

function getNormalizedTrackProgress(trackProgress: number, dragRange: SliderDragRange): number {
    const width = dragRange.max - dragRange.min;

    if (width <= 0) {
        return 0;
    }

    return clamp01((trackProgress - dragRange.min) / width);
}

function getTrackProgressFromVisual(visualProgress: number, dragRange: SliderDragRange): number {
    return dragRange.min + (dragRange.max - dragRange.min) * clamp01(visualProgress);
}

export class LevelReverseSlider extends BaseLevelController<ReverseSliderLevelConfig> {
    private panelNode: Node | null = null;
    private trackNode: Node | null = null;
    private trackGraphics: Graphics | null = null;
    private fillNode: Node | null = null;
    private fillGraphics: Graphics | null = null;
    private handleNode: Node | null = null;
    private handleGraphics: Graphics | null = null;

    private infoLabel = null as ReturnType<typeof createLevelLabel> | null;
    private stateLabel = null as ReturnType<typeof createLevelLabel> | null;
    private statusLabel = null as ReturnType<typeof createLevelLabel> | null;

    private dragStartTargets: Node[] = [];
    private inputEventsBound = false;

    private trackWidth = 0;
    private trackHeight = 20;
    private handleWidth = 58;
    private handleHeight = 44;

    private visualProgress = 0;
    private internalProgress = 0;
    private dragStartVisualProgress = 0;
    private dragStartInternalProgress = 0;
    private dragPointerOffset = 0;

    private dragging = false;
    private hasEffectiveDrag = false;
    private hasReleased = false;
    private lastDragDirection: DragDirection = 'none';
    private totalVisualDistance = 0;
    private directionChangeCount = 0;
    private lastDeltaSign = 0;
    private releaseCount = 0;

    protected onInit(config: ReverseSliderLevelConfig): void {
        this.validatePayload(config);
    }

    protected onMount(rootNode: Node): void {
        this.buildUI(rootNode);
        this.bindDragEvents();
    }

    protected onReset(): void {
        this.dragging = false;
        this.hasEffectiveDrag = false;
        this.hasReleased = false;
        this.lastDragDirection = 'none';
        this.totalVisualDistance = 0;
        this.directionChangeCount = 0;
        this.lastDeltaSign = 0;
        this.releaseCount = 0;
        this.dragPointerOffset = 0;

        const payload = this.requireConfig().payload;
        this.visualProgress = clamp01(payload.visualStartPosition);
        this.internalProgress = clamp01(payload.startPosition);
        this.dragStartVisualProgress = this.visualProgress;
        this.dragStartInternalProgress = this.internalProgress;

        this.updateVisualPosition();
        this.refreshTrackVisual();
        this.refreshHandleVisual();
        this.refreshStatusLabel();
        this.updateState('STATUS: CALIBRATING', copyColor(UI_THEME.warning));
        this.updateInfo(payload.controllerHint);
    }

    protected onValidate(): LevelValidationResult {
        const result = this.buildValidationResult();
        this.updateState(
            result.resultType === LevelResultType.Success ? 'STATUS: ACCEPTED' : 'STATUS: REJECTED',
            result.resultType === LevelResultType.Success ? copyColor(UI_THEME.success) : copyColor(UI_THEME.danger),
        );
        this.updateInfo(result.detailText);
        this.refreshHandleVisual();
        return result;
    }

    protected onBeforeUnmount(): void {
        this.unbindDragEvents();
        this.clearState();
    }

    private validatePayload(config: ReverseSliderLevelConfig): void {
        const payload = config.payload;

        if (payload.threshold <= 0 || payload.threshold >= 1) {
            throw new Error('[LevelReverseSlider] threshold must be between 0 and 1.');
        }

        if (payload.startPosition < 0 || payload.startPosition > 1) {
            throw new Error('[LevelReverseSlider] startPosition must be between 0 and 1.');
        }

        if (payload.visualStartPosition < 0 || payload.visualStartPosition > 1) {
            throw new Error('[LevelReverseSlider] visualStartPosition must be between 0 and 1.');
        }

        if (payload.dragRange.min < 0 || payload.dragRange.max > 1 || payload.dragRange.min >= payload.dragRange.max) {
            throw new Error('[LevelReverseSlider] dragRange must satisfy 0 <= min < max <= 1.');
        }

        if (!payload.promptText.trim()) {
            throw new Error('[LevelReverseSlider] promptText must not be empty.');
        }
    }

    private buildUI(rootNode: Node): void {
        const { width, height } = getNodeSize(rootNode, 420, 220);
        const payload = this.requireConfig().payload;
        const panelWidth = Math.min(width - 16, 450);

        createLevelLabel(rootNode, 'ReverseSliderTitleLabel', payload.controllerTitle, {
            width: width - 20,
            height: 32,
            fontSize: 22,
            color: copyColor(UI_THEME.accent),
            x: 0,
            y: height * 0.5 - 24,
        });

        this.stateLabel = createLevelLabel(rootNode, 'ReverseSliderStateLabel', 'STATUS: CALIBRATING', {
            width: width - 20,
            height: 24,
            fontSize: 17,
            color: copyColor(UI_THEME.warning),
            x: 0,
            y: height * 0.5 - 54,
        });

        this.infoLabel = createLevelLabel(rootNode, 'ReverseSliderInfoLabel', payload.controllerHint, {
            width: panelWidth - 22,
            height: 40,
            fontSize: 14,
            color: copyColor(UI_THEME.textPrimary),
            x: 0,
            y: 42,
        });

        this.panelNode = createLevelPanel(
            rootNode,
            'ReverseSliderPanel',
            panelWidth,
            Math.min(158, height - 50),
            copyColor(UI_THEME.panelMuted),
        );
        this.panelNode.setPosition(new Vec3(0, -6, 0));

        createLevelLabel(this.panelNode, 'ReverseSliderPromptLabel', payload.promptText, {
            width: panelWidth - 28,
            height: 28,
            fontSize: 17,
            color: copyColor(UI_THEME.warning),
            x: 0,
            y: 46,
        });

        this.statusLabel = createLevelLabel(this.panelNode, 'ReverseSliderStatusLabel', 'VISUAL 00 / INTERNAL 00 / LAST NONE', {
            width: panelWidth - 28,
            height: 24,
            fontSize: 13,
            color: copyColor(UI_THEME.textMuted),
            x: 0,
            y: -50,
        });

        this.buildTrack(this.panelNode, panelWidth - 58);
    }

    private buildTrack(parent: Node, width: number): void {
        this.trackWidth = width;

        const trackNode = new Node('ReverseSliderTrack');
        parent.addChild(trackNode);
        const trackTransform = trackNode.addComponent(UITransform);
        trackTransform.setContentSize(width, this.trackHeight + 10);
        trackNode.setPosition(new Vec3(0, -2, 0));

        this.trackNode = trackNode;
        this.trackGraphics = trackNode.addComponent(Graphics);

        const fillNode = new Node('ReverseSliderFill');
        trackNode.addChild(fillNode);
        const fillTransform = fillNode.addComponent(UITransform);
        fillTransform.setContentSize(width, this.trackHeight - 6);
        fillNode.setPosition(new Vec3(0, 0, 0));
        this.fillNode = fillNode;
        this.fillGraphics = fillNode.addComponent(Graphics);

        const handleNode = new Node('ReverseSliderHandle');
        trackNode.addChild(handleNode);
        const handleTransform = handleNode.addComponent(UITransform);
        handleTransform.setContentSize(this.handleWidth, this.handleHeight);
        this.handleNode = handleNode;
        this.handleGraphics = handleNode.addComponent(Graphics);

        createLevelLabel(handleNode, 'ReverseSliderHandleLabel', '<>', {
            width: this.handleWidth - 8,
            height: 20,
            fontSize: 18,
            color: copyColor(UI_THEME.background),
            x: 0,
            y: 0,
        });

        createLevelLabel(parent, 'ReverseSliderLeftLabel', 'LEFT', {
            width: 60,
            height: 18,
            fontSize: 12,
            color: copyColor(UI_THEME.textMuted),
            x: -width * 0.5 + 22,
            y: -24,
        });

        createLevelLabel(parent, 'ReverseSliderRightLabel', 'RIGHT', {
            width: 60,
            height: 18,
            fontSize: 12,
            color: copyColor(UI_THEME.textMuted),
            x: width * 0.5 - 22,
            y: -24,
        });

        this.dragStartTargets = [trackNode, handleNode];
    }

    private bindDragEvents(): void {
        this.dragStartTargets.forEach((node) => {
            node.on(Node.EventType.TOUCH_START, this.handlePointerStart, this);
            node.on(Node.EventType.MOUSE_DOWN, this.handlePointerStart, this);
        });

        if (this.inputEventsBound) {
            return;
        }

        input.on(Input.EventType.TOUCH_MOVE, this.handlePointerMove, this);
        input.on(Input.EventType.TOUCH_END, this.handlePointerEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.handlePointerEnd, this);
        input.on(Input.EventType.MOUSE_MOVE, this.handlePointerMove, this);
        input.on(Input.EventType.MOUSE_UP, this.handlePointerEnd, this);
        this.inputEventsBound = true;
    }

    private unbindDragEvents(): void {
        this.dragStartTargets.forEach((node) => {
            node.off(Node.EventType.TOUCH_START, this.handlePointerStart, this);
            node.off(Node.EventType.MOUSE_DOWN, this.handlePointerStart, this);
        });

        if (!this.inputEventsBound) {
            return;
        }

        input.off(Input.EventType.TOUCH_MOVE, this.handlePointerMove, this);
        input.off(Input.EventType.TOUCH_END, this.handlePointerEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.handlePointerEnd, this);
        input.off(Input.EventType.MOUSE_MOVE, this.handlePointerMove, this);
        input.off(Input.EventType.MOUSE_UP, this.handlePointerEnd, this);
        this.inputEventsBound = false;
    }

    private handlePointerStart(event: SliderPointerEvent): void {
        if (!this.trackNode) {
            return;
        }

        const pointerProgress = this.getPointerVisualProgress(event);

        if (pointerProgress === null) {
            return;
        }

        this.dragging = true;
        this.hasReleased = false;
        this.dragStartVisualProgress = this.visualProgress;
        this.dragStartInternalProgress = this.internalProgress;
        const startedOnHandle = event.currentTarget === this.handleNode;
        this.dragPointerOffset = startedOnHandle ? this.visualProgress - pointerProgress : 0;
        this.updateState('STATUS: DRAGGING', copyColor(UI_THEME.warning));
        this.updateInfo('Visible drag captured. Release the slider, then submit the verification.');
    }

    private handlePointerMove(event: SliderPointerEvent): void {
        if (!this.dragging) {
            return;
        }

        const basePointerProgress = this.getPointerVisualProgress(event);

        if (basePointerProgress === null) {
            return;
        }

        const nextVisualProgress = clamp01(basePointerProgress + this.dragPointerOffset);
        const delta = nextVisualProgress - this.visualProgress;

        if (Math.abs(delta) < 0.0001) {
            return;
        }

        this.updateVisualPosition(nextVisualProgress);
        this.updateInternalProgress();
        this.analyzeDragPattern(delta);
        this.refreshTrackVisual();
        this.refreshHandleVisual();
        this.refreshStatusLabel();
    }

    private handlePointerEnd(): void {
        if (!this.dragging) {
            return;
        }

        this.dragging = false;
        this.hasReleased = true;
        this.releaseCount += 1;
        this.refreshHandleVisual();
        this.refreshStatusLabel();

        if (!this.requireConfig().payload.autoValidateOnRelease) {
            this.updateState('STATUS: READY TO SUBMIT', copyColor(UI_THEME.warning));
            this.updateInfo('Release recorded. Submit the slider to test the hidden rule.');
            return;
        }

        this.applyReleasePreview();
    }

    private updateVisualPosition(nextVisualProgress?: number): void {
        if (typeof nextVisualProgress === 'number') {
            this.visualProgress = clamp01(nextVisualProgress);
        }

        if (!this.handleNode) {
            return;
        }

        const trackProgress = getTrackProgressFromVisual(this.visualProgress, this.requireConfig().payload.dragRange);
        const offsetX = (trackProgress - 0.5) * this.trackWidth;
        this.handleNode.setPosition(new Vec3(offsetX, 0, 0));
    }

    private updateInternalProgress(): void {
        const payload = this.requireConfig().payload;
        const visualDelta = this.visualProgress - payload.visualStartPosition;
        const adjustedDelta = payload.reverseControl ? -visualDelta : visualDelta;
        this.internalProgress = clamp01(payload.startPosition + adjustedDelta);
    }

    private analyzeDragPattern(delta: number): void {
        const absDelta = Math.abs(delta);
        const direction = delta > 0 ? 'right' : 'left';
        const deltaSign = Math.sign(delta);

        this.totalVisualDistance += absDelta;
        this.lastDragDirection = direction;

        if (absDelta >= 0.025) {
            this.hasEffectiveDrag = true;
        }

        if (deltaSign !== 0 && this.lastDeltaSign !== 0 && deltaSign !== this.lastDeltaSign) {
            this.directionChangeCount += 1;
        }

        if (deltaSign !== 0) {
            this.lastDeltaSign = deltaSign;
        }
    }

    private buildValidationResult(): LevelValidationResult {
        const config = this.requireConfig();

        if (!this.hasEffectiveDrag) {
            return this.buildFailureResult(
                'No effective slider movement was detected.',
                [
                    `Prompt: ${config.payload.promptText}`,
                    'The handle never moved far enough to register as a deliberate human action.',
                    `Rule: ${config.absurdRule}`,
                ].join(' '),
                {
                    reasonKey: 'no-drag',
                },
            );
        }

        if (this.internalProgress <= config.payload.threshold) {
            return this.buildSuccessResult(
                'The hidden reverse threshold was satisfied.',
                [
                    `Visual progress stopped at ${this.formatPercent(this.visualProgress)}.`,
                    `Internal progress settled at ${this.formatPercent(this.internalProgress)}, which is below the required ${this.formatPercent(config.payload.threshold)}.`,
                    `The last drag segment started from visual ${this.formatPercent(this.dragStartVisualProgress)} and internal ${this.formatPercent(this.dragStartInternalProgress)}.`,
                    config.payload.reverseControl
                        ? 'Reverse control was active, so moving the handle visually away from the prompt produced the correct hidden result.'
                        : 'Direct control path satisfied the hidden rule.',
                ].join(' '),
                {
                    reasonKey: 'reverse-threshold',
                },
            );
        }

        const failureReason = this.getFailureReason();
        return this.buildFailureResult(
            this.buildFailureSummary(failureReason),
            this.buildFailureDetail(failureReason),
            {
                reasonKey: failureReason,
            },
        );
    }

    private getFailureReason(): SliderFailureReason {
        if (this.usedOrdinaryDirection()) {
            return 'ordinary-direction';
        }

        if (this.isPathTooDirect()) {
            return 'path-too-direct';
        }

        return 'threshold-not-reached';
    }

    private buildFailureSummary(reason: SliderFailureReason): string {
        switch (reason) {
        case 'ordinary-direction':
            return 'The slider was dragged in the most ordinary direction.';
        case 'path-too-direct':
            return 'The drag path was too direct and predictable.';
        case 'threshold-not-reached':
            return 'The hidden reverse threshold was not reached.';
        default:
            return 'No effective slider movement was detected.';
        }
    }

    private buildFailureDetail(reason: SliderFailureReason): string {
        const config = this.requireConfig();
        const detailParts: string[] = [
            `Visual progress ended at ${this.formatPercent(this.visualProgress)} while internal progress ended at ${this.formatPercent(this.internalProgress)}.`,
            `The last drag segment began at visual ${this.formatPercent(this.dragStartVisualProgress)} and internal ${this.formatPercent(this.dragStartInternalProgress)}.`,
        ];

        if (reason === 'ordinary-direction') {
            detailParts.push(
                `You followed the displayed ${getDirectionLabel(config.payload.direction)} drag cue. The controller marks obvious compliance as suspicious.`,
            );
        }

        if (reason === 'path-too-direct') {
            detailParts.push(
                `The drag stayed almost perfectly linear with ${this.directionChangeCount} direction changes across ${this.formatPercent(this.totalVisualDistance)} of travel.`,
            );
        }

        if (reason === 'threshold-not-reached') {
            detailParts.push(
                `The hidden rule requires internal progress <= ${this.formatPercent(config.payload.threshold)}, but the current value is ${this.formatPercent(this.internalProgress)}.`,
            );
        }

        if (!this.hasReleased) {
            detailParts.push('The drag was submitted without a completed release phase.');
        }

        detailParts.push(`Last drag direction: ${this.lastDragDirection.toUpperCase()}.`);
        detailParts.push(`Rule: ${config.absurdRule}`);

        return detailParts.join(' ');
    }

    private usedOrdinaryDirection(): boolean {
        const netVisualDelta = this.visualProgress - this.requireConfig().payload.visualStartPosition;

        if (Math.abs(netVisualDelta) < 0.08) {
            return false;
        }

        return Math.sign(netVisualDelta) === getDirectionSign(this.requireConfig().payload.direction);
    }

    private isPathTooDirect(): boolean {
        const netDelta = Math.abs(this.visualProgress - this.requireConfig().payload.visualStartPosition);

        if (this.totalVisualDistance < 0.16) {
            return false;
        }

        return this.directionChangeCount === 0 && netDelta / Math.max(this.totalVisualDistance, 0.001) >= 0.9;
    }

    private applyReleasePreview(): void {
        if (this.internalProgress <= this.requireConfig().payload.threshold) {
            this.updateState('STATUS: PRECHECK PASS', copyColor(UI_THEME.success));
            this.updateInfo('Release preview: hidden threshold currently looks valid. Submit to lock the judgment.');
            return;
        }

        const failureReason = this.getFailureReason();
        this.updateState('STATUS: PRECHECK FAIL', copyColor(UI_THEME.danger));

        if (failureReason === 'ordinary-direction') {
            this.updateInfo('Release preview: the drag looked too obedient. The obvious visual direction is not trusted.');
            return;
        }

        if (failureReason === 'path-too-direct') {
            this.updateInfo('Release preview: the motion path was too straight. The system expected more confusion.');
            return;
        }

        this.updateInfo('Release preview: the hidden threshold still has not been reached.');
    }

    private refreshTrackVisual(): void {
        if (!this.trackGraphics || !this.fillGraphics || !this.fillNode) {
            return;
        }

        const payload = this.requireConfig().payload;
        const activeLeft = (payload.dragRange.min - 0.5) * this.trackWidth;
        const activeWidth = (payload.dragRange.max - payload.dragRange.min) * this.trackWidth;
        const promptMarkerProgress = payload.direction === 'left' ? 0.12 : 0.88;
        const promptMarkerX = (getTrackProgressFromVisual(promptMarkerProgress, payload.dragRange) - 0.5) * this.trackWidth;

        drawRoundedRect(
            this.trackGraphics,
            this.trackWidth,
            this.trackHeight,
            UI_THEME.background,
            10,
            UI_THEME.panelRaised,
            2,
        );

        this.trackGraphics.fillColor = new Color(UI_THEME.accent.r, UI_THEME.accent.g, UI_THEME.accent.b, 28);
        this.trackGraphics.roundRect(activeLeft, -this.trackHeight * 0.5, activeWidth, this.trackHeight, 10);
        this.trackGraphics.fill();

        this.trackGraphics.strokeColor = new Color(UI_THEME.warning.r, UI_THEME.warning.g, UI_THEME.warning.b, 168);
        this.trackGraphics.lineWidth = 2;
        this.trackGraphics.moveTo(promptMarkerX, -14);
        this.trackGraphics.lineTo(promptMarkerX, 14);
        this.trackGraphics.stroke();

        const fillTrackProgress = getTrackProgressFromVisual(this.visualProgress, payload.dragRange);
        const fillWidth = Math.max(4, (fillTrackProgress - payload.dragRange.min) * this.trackWidth);
        drawRoundedRect(
            this.fillGraphics,
            fillWidth,
            this.trackHeight - 6,
            new Color(UI_THEME.accentSoft.r, UI_THEME.accentSoft.g, UI_THEME.accentSoft.b, 255),
            8,
        );
        this.fillNode.setPosition(new Vec3(activeLeft + fillWidth * 0.5, 0, 0));
    }

    private refreshHandleVisual(): void {
        if (!this.handleGraphics) {
            return;
        }

        const thresholdReached = this.internalProgress <= this.requireConfig().payload.threshold;
        const fillColor = thresholdReached
            ? copyColor(UI_THEME.success)
            : this.dragging
                ? copyColor(UI_THEME.warning)
                : copyColor(UI_THEME.textPrimary);
        const strokeColor = thresholdReached
            ? copyColor(UI_THEME.accentSoft)
            : copyColor(UI_THEME.panelRaised);

        drawRoundedRect(this.handleGraphics, this.handleWidth, this.handleHeight, fillColor, 12, strokeColor, 2);
    }

    private refreshStatusLabel(): void {
        if (!this.statusLabel) {
            return;
        }

        this.statusLabel.string = [
            `VISUAL ${this.formatPercent(this.visualProgress)}`,
            `INTERNAL ${this.formatPercent(this.internalProgress)}`,
            `LAST ${this.lastDragDirection.toUpperCase()}`,
            `TURNS ${this.directionChangeCount}`,
            `RELEASES ${this.releaseCount}`,
        ].join(' / ');
    }

    private getPointerVisualProgress(event: SliderPointerEvent): number | null {
        if (!this.trackNode) {
            return null;
        }

        const trackTransform = this.trackNode.getComponent(UITransform);

        if (!trackTransform) {
            return null;
        }

        const location = event.getUILocation();
        const local = trackTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
        const rawTrackProgress = clamp01((local.x + this.trackWidth * 0.5) / this.trackWidth);
        const clampedTrackProgress = clamp(rawTrackProgress, this.requireConfig().payload.dragRange.min, this.requireConfig().payload.dragRange.max);
        return getNormalizedTrackProgress(clampedTrackProgress, this.requireConfig().payload.dragRange);
    }

    private updateState(text: string, color: Color): void {
        if (!this.stateLabel) {
            return;
        }

        this.stateLabel.string = text;
        this.stateLabel.color = color;
    }

    private updateInfo(text: string): void {
        if (!this.infoLabel) {
            return;
        }

        this.infoLabel.string = text;
    }

    private formatPercent(value: number): string {
        return `${Math.round(clamp01(value) * 100)}%`;
    }

    private clearState(): void {
        this.panelNode = null;
        this.trackNode = null;
        this.trackGraphics = null;
        this.fillNode = null;
        this.fillGraphics = null;
        this.handleNode = null;
        this.handleGraphics = null;
        this.infoLabel = null;
        this.stateLabel = null;
        this.statusLabel = null;
        this.dragStartTargets = [];
        this.trackWidth = 0;
        this.visualProgress = 0;
        this.internalProgress = 0;
        this.dragStartVisualProgress = 0;
        this.dragStartInternalProgress = 0;
        this.dragPointerOffset = 0;
        this.dragging = false;
        this.hasEffectiveDrag = false;
        this.hasReleased = false;
        this.lastDragDirection = 'none';
        this.totalVisualDistance = 0;
        this.directionChangeCount = 0;
        this.lastDeltaSign = 0;
        this.releaseCount = 0;
    }
}
