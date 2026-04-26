import { Color, Node } from 'cc';
import { FakeButtonLevelConfig } from '../../../data/LevelConfig';
import { BaseLevelController } from '../BaseLevelController';
import { LevelValidationResult } from '../LevelControllerTypes';
import {
    LevelButtonHandle,
    createLevelButton,
    createLevelLabel,
    getNodeSize,
} from '../LevelUiFactory';

type FakeButtonPhase = 'initial' | 'first-fail' | 'waiting' | 'ready' | 'success';

export class LevelFakeButton extends BaseLevelController<FakeButtonLevelConfig> {
    private infoLabel = null as ReturnType<typeof createLevelLabel> | null;
    private stateLabel = null as ReturnType<typeof createLevelLabel> | null;
    private actionButton: LevelButtonHandle | null = null;
    private phase: FakeButtonPhase = 'initial';
    private readyTimerId: ReturnType<typeof setTimeout> | null = null;
    private waitStartAt = 0;

    protected onMount(rootNode: Node): void {
        const { width, height } = getNodeSize(rootNode, 420, 220);
        const config = this.requireConfig();

        createLevelLabel(rootNode, 'FakeButtonTitleLabel', config.payload.controllerTitle, {
            width: width - 20,
            height: 32,
            fontSize: 22,
            color: new Color(79, 224, 163, 255),
            x: 0,
            y: height * 0.5 - 26,
        });

        this.stateLabel = createLevelLabel(rootNode, 'FakeButtonStateLabel', 'STATUS: READY', {
            width: width - 20,
            height: 26,
            fontSize: 18,
            color: new Color(224, 166, 79, 255),
            x: 0,
            y: height * 0.5 - 58,
        });

        this.infoLabel = createLevelLabel(rootNode, 'FakeButtonInfoLabel', config.payload.controllerHint, {
            width: width - 30,
            height: 90,
            fontSize: 18,
            color: new Color(204, 218, 214, 255),
            x: 0,
            y: 30,
        });

        this.actionButton = createLevelButton(
            rootNode,
            'FakeConfirmButton',
            config.payload.initialButtonText,
            200,
            72,
            new Color(48, 136, 97, 255),
            config.payload.initialOffsetX,
            config.payload.initialOffsetY - 58,
        );

        this.actionButton.node.on(Node.EventType.TOUCH_END, this.handleActionButtonClick, this);
    }

    protected onReset(): void {
        this.clearReadyTimer();
        this.phase = 'initial';
        this.waitStartAt = 0;
        this.applyPhaseVisuals();
    }

    protected onValidate(): LevelValidationResult {
        switch (this.phase) {
        case 'success': {
            const result = this.buildSuccessResult(
                'The delayed confirm sequence was accepted.',
                'You clicked the changed button only after the waiting window completed.',
                {
                    reasonKey: 'delayed-confirm',
                },
            );
            this.updateInfo(result.detailText);
            return result;
        }
        case 'ready': {
            const result = this.buildFailureResult(
                'The final changed button was not clicked.',
                'The button has shifted into its valid state. Click it once more before submitting.',
                {
                    reasonKey: 'changed-button-ignored',
                },
            );
            this.updateInfo(result.detailText);
            return result;
        }
        case 'waiting': {
            const remainingMs = Math.max(0, this.requireConfig().payload.minWaitMs - (Date.now() - this.waitStartAt));
            const result = this.buildFailureResult(
                'The system is still watching your impatience.',
                `Wait at least ${Math.ceil(remainingMs / 100) / 10}s more, then click the changed button.`,
                {
                    reasonKey: 'waiting-window',
                },
            );
            this.updateInfo(result.detailText);
            return result;
        }
        case 'first-fail': {
            const result = this.buildFailureResult(
                'The first confirm was too quick.',
                'Repeating the same click pattern will still fail. Watch for the button to change.',
                {
                    reasonKey: 'too-fast',
                },
            );
            this.updateInfo(result.detailText);
            return result;
        }
        default: {
            const result = this.buildFailureResult(
                'No valid hesitation pattern was detected.',
                'Press the internal confirm button and let the controller expose the trap first.',
                {
                    reasonKey: 'no-pattern',
                },
            );
            this.updateInfo(result.detailText);
            return result;
        }
        }
    }

    protected onBeforeUnmount(): void {
        this.clearReadyTimer();

        if (this.actionButton) {
            this.actionButton.node.off(Node.EventType.TOUCH_END, this.handleActionButtonClick, this);
        }
    }

    private handleActionButtonClick(): void {
        const config = this.requireConfig();

        if (this.phase === 'initial') {
            this.phase = 'first-fail';
            this.updateInfo('Too fast. The system expected hesitation and marked this click as suspicious.');
            this.applyPhaseVisuals();
            return;
        }

        if (this.phase === 'first-fail') {
            this.phase = 'waiting';
            this.waitStartAt = Date.now();
            this.updateInfo('Repeated input rejected. The button is recalibrating. Wait and watch for the change.');
            this.applyPhaseVisuals();
            this.clearReadyTimer();
            this.readyTimerId = setTimeout(() => {
                this.phase = 'ready';
                this.updateInfo('The confirm button has changed. Click it now, then press SUBMIT CHECK.');
                this.applyPhaseVisuals();
            }, config.payload.minWaitMs);
            return;
        }

        if (this.phase === 'waiting') {
            const elapsedMs = Date.now() - this.waitStartAt;
            const remainingMs = Math.max(0, config.payload.minWaitMs - elapsedMs);
            this.updateInfo(`Still too early. Wait ${Math.ceil(remainingMs / 100) / 10}s before clicking the changed button.`);
            return;
        }

        if (this.phase === 'ready') {
            this.phase = 'success';
            this.updateInfo('Delayed click accepted. Submit the level now.');
            this.applyPhaseVisuals();
        }
    }

    private applyPhaseVisuals(): void {
        const config = this.requireConfig();

        if (!this.actionButton) {
            return;
        }

        switch (this.phase) {
        case 'initial':
            this.actionButton.setText(config.payload.initialButtonText);
            this.actionButton.setColor(new Color(48, 136, 97, 255));
            this.actionButton.setPosition(config.payload.initialOffsetX, config.payload.initialOffsetY - 58);
            this.updateState('STATUS: READY');
            this.updateInfo(config.payload.controllerHint);
            break;
        case 'first-fail':
            this.actionButton.setText(config.payload.firstFailButtonText);
            this.actionButton.setColor(new Color(132, 56, 56, 255));
            this.actionButton.setPosition(config.payload.firstFailOffsetX, config.payload.firstFailOffsetY - 58);
            this.updateState('STATUS: TOO FAST');
            break;
        case 'waiting':
            this.actionButton.setText(config.payload.waitingButtonText);
            this.actionButton.setColor(new Color(86, 92, 102, 255));
            this.actionButton.setPosition(config.payload.waitingOffsetX, config.payload.waitingOffsetY - 58);
            this.updateState('STATUS: WAIT');
            break;
        case 'ready':
            this.actionButton.setText(config.payload.readyButtonText);
            this.actionButton.setColor(new Color(224, 166, 79, 255));
            this.actionButton.setPosition(config.payload.readyOffsetX, config.payload.readyOffsetY - 58);
            this.updateState('STATUS: CHANGED');
            break;
        case 'success':
            this.actionButton.setText(config.payload.successButtonText);
            this.actionButton.setColor(new Color(48, 136, 97, 255));
            this.actionButton.setPosition(config.payload.readyOffsetX, config.payload.readyOffsetY - 58);
            this.updateState('STATUS: ACCEPTED');
            break;
        }
    }

    private updateState(text: string): void {
        if (this.stateLabel) {
            this.stateLabel.string = text;
        }
    }

    private updateInfo(text: string): void {
        if (this.infoLabel) {
            this.infoLabel.string = text;
        }
    }

    private clearReadyTimer(): void {
        if (this.readyTimerId) {
            clearTimeout(this.readyTimerId);
            this.readyTimerId = null;
        }
    }
}
