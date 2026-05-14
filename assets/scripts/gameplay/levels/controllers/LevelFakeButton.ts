import { Node } from 'cc';
import { FakeButtonLevelConfig } from '../../../data/LevelConfig';
import { BaseLevelController } from '../BaseLevelController';
import { LevelValidationResult } from '../LevelControllerTypes';
import { UI_THEME } from '../../../ui/theme/UITheme';
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

        this.stateLabel = createLevelLabel(rootNode, 'FakeButtonStateLabel', '状态：就绪', {
            width: width - 20,
            height: 26,
            fontSize: 18,
            color: UI_THEME.warning,
            x: 0,
            y: height * 0.5 - 28,
        });

        this.infoLabel = createLevelLabel(rootNode, 'FakeButtonInfoLabel', config.payload.controllerHint, {
            width: width - 30,
            height: 90,
            fontSize: 18,
            color: UI_THEME.textPrimary,
            x: 0,
            y: 30,
        });

        this.actionButton = createLevelButton(
            rootNode,
            'FakeConfirmButton',
            config.payload.initialButtonText,
            200,
            72,
            UI_THEME.buttonPrimary,
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
                '延迟确认流程已被接受。',
                '你在等待窗口结束后才点击了变化后的按钮。',
                {
                    reasonKey: 'delayed-confirm',
                },
            );
            this.updateInfo('验证结果已生成，请查看弹窗。');
            return result;
        }
        case 'ready': {
            const result = this.buildFailureResult(
                '最后变化后的按钮还没有被点击。',
                '按钮已经进入有效状态。提交前请再点击它一次。',
                {
                    reasonKey: 'changed-button-ignored',
                },
            );
            this.updateInfo('验证结果已生成，请查看弹窗。');
            return result;
        }
        case 'waiting': {
            const remainingMs = Math.max(0, this.requireConfig().payload.minWaitMs - (Date.now() - this.waitStartAt));
            const result = this.buildFailureResult(
                '系统仍在观察你的急躁。',
                `至少再等待 ${Math.ceil(remainingMs / 100) / 10} 秒，然后点击变化后的按钮。`,
                {
                    reasonKey: 'waiting-window',
                },
            );
            this.updateInfo('验证结果已生成，请查看弹窗。');
            return result;
        }
        case 'first-fail': {
            const result = this.buildFailureResult(
                '第一次确认太快了。',
                '重复相同点击模式仍会失败。请观察按钮变化。',
                {
                    reasonKey: 'too-fast',
                },
            );
            this.updateInfo('验证结果已生成，请查看弹窗。');
            return result;
        }
        default: {
            const result = this.buildFailureResult(
                '没有检测到有效的犹豫模式。',
                '请先点击内部确认按钮，让控制器暴露陷阱。',
                {
                    reasonKey: 'no-pattern',
                },
            );
            this.updateInfo('验证结果已生成，请查看弹窗。');
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
            this.updateInfo('太快了。系统期待犹豫，并将这次点击标记为可疑。');
            this.applyPhaseVisuals();
            return;
        }

        if (this.phase === 'first-fail') {
            this.phase = 'waiting';
            this.waitStartAt = Date.now();
            this.updateInfo('重复输入已被拒绝。按钮正在重新校准，请等待并观察变化。');
            this.applyPhaseVisuals();
            this.clearReadyTimer();
            this.readyTimerId = setTimeout(() => {
                this.phase = 'ready';
                this.updateInfo('确认按钮已经变化。现在点击它，然后提交验证。');
                this.applyPhaseVisuals();
            }, config.payload.minWaitMs);
            return;
        }

        if (this.phase === 'waiting') {
            const elapsedMs = Date.now() - this.waitStartAt;
            const remainingMs = Math.max(0, config.payload.minWaitMs - elapsedMs);
            this.updateInfo(`还是太早。再等 ${Math.ceil(remainingMs / 100) / 10} 秒后点击变化后的按钮。`);
            return;
        }

        if (this.phase === 'ready') {
            this.phase = 'success';
            this.updateInfo('延迟点击已接受。现在提交本关。');
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
            this.actionButton.setColor(UI_THEME.buttonPrimary);
            this.actionButton.setPosition(config.payload.initialOffsetX, config.payload.initialOffsetY - 58);
            this.updateState('状态：就绪');
            this.updateInfo(config.payload.controllerHint);
            break;
        case 'first-fail':
            this.actionButton.setText(config.payload.firstFailButtonText);
            this.actionButton.setColor(UI_THEME.buttonDanger);
            this.actionButton.setPosition(config.payload.firstFailOffsetX, config.payload.firstFailOffsetY - 58);
            this.updateState('状态：太快');
            break;
        case 'waiting':
            this.actionButton.setText(config.payload.waitingButtonText);
            this.actionButton.setColor(UI_THEME.buttonSecondary);
            this.actionButton.setPosition(config.payload.waitingOffsetX, config.payload.waitingOffsetY - 58);
            this.updateState('状态：等待');
            break;
        case 'ready':
            this.actionButton.setText(config.payload.readyButtonText);
            this.actionButton.setColor(UI_THEME.warning);
            this.actionButton.setPosition(config.payload.readyOffsetX, config.payload.readyOffsetY - 58);
            this.updateState('状态：已变化');
            break;
        case 'success':
            this.actionButton.setText(config.payload.successButtonText);
            this.actionButton.setColor(UI_THEME.buttonPrimary);
            this.actionButton.setPosition(config.payload.readyOffsetX, config.payload.readyOffsetY - 58);
            this.updateState('状态：已接受');
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
