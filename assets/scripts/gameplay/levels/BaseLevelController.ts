import { Node, UITransform } from 'cc';
import { LevelResultType } from '../../data/GameConst';
import { LevelDefinition } from '../../data/LevelConfig';
import { LevelValidationMeta, LevelValidationResult } from './LevelControllerTypes';
import { clearNodeChildren } from './LevelUiFactory';

export abstract class BaseLevelController<TConfig extends LevelDefinition = LevelDefinition> {
    protected config: TConfig | null = null;
    protected container: Node | null = null;
    protected rootNode: Node | null = null;
    protected result: LevelValidationResult | null = null;

    public init(config: TConfig): void {
        this.config = config;
        this.result = null;
        this.onInit(config);
    }

    public mount(container: Node): void {
        this.unmount();
        this.container = container;
        clearNodeChildren(container);

        this.rootNode = new Node(`${this.requireConfig().key}Root`);
        const containerTransform = container.getComponent(UITransform);
        const rootTransform = this.rootNode.addComponent(UITransform);
        rootTransform.setContentSize(
            containerTransform?.contentSize.width ?? 420,
            containerTransform?.contentSize.height ?? 220,
        );

        container.addChild(this.rootNode);
        this.onMount(this.rootNode);
    }

    public unmount(): void {
        this.onBeforeUnmount();

        if (this.rootNode?.isValid) {
            this.rootNode.destroy();
        }

        if (this.container?.isValid) {
            clearNodeChildren(this.container);
        }

        this.rootNode = null;
        this.container = null;
        this.result = null;
    }

    public reset(): void {
        this.result = null;
        this.onReset();
    }

    public validate(): LevelValidationResult {
        this.result = this.onValidate();
        return this.result;
    }

    public getResult(): LevelValidationResult | null {
        return this.result;
    }

    protected buildSuccessResult(
        summaryText: string,
        detailText: string,
        meta: LevelValidationMeta = { reasonKey: 'success' },
    ): LevelValidationResult {
        const config = this.requireConfig();

        return {
            resultType: LevelResultType.Success,
            success: true,
            reasonKey: meta.reasonKey,
            message: meta.message ?? summaryText,
            absurdRule: meta.absurdRule ?? config.absurdRule,
            systemPrompt: meta.systemPrompt ?? config.systemPrompt,
            primaryAction: meta.primaryAction ?? config.primaryActionLabel,
            summaryText,
            detailText,
        };
    }

    protected buildFailureResult(
        summaryText: string,
        detailText: string,
        meta: LevelValidationMeta = { reasonKey: 'failure' },
    ): LevelValidationResult {
        const config = this.requireConfig();

        return {
            resultType: LevelResultType.Failure,
            success: false,
            reasonKey: meta.reasonKey,
            message: meta.message ?? summaryText,
            absurdRule: meta.absurdRule ?? config.absurdRule,
            systemPrompt: meta.systemPrompt ?? config.systemPrompt,
            primaryAction: meta.primaryAction ?? config.primaryActionLabel,
            summaryText,
            detailText,
        };
    }

    protected requireConfig(): TConfig {
        if (!this.config) {
            throw new Error('Level controller config is missing.');
        }

        return this.config;
    }

    protected requireRootNode(): Node {
        if (!this.rootNode) {
            throw new Error('Level controller root node is missing.');
        }

        return this.rootNode;
    }

    protected onInit(_config: TConfig): void {}

    protected onBeforeUnmount(): void {}

    protected abstract onMount(rootNode: Node): void;
    protected abstract onReset(): void;
    protected abstract onValidate(): LevelValidationResult;
}
