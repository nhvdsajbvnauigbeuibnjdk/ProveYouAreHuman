import { Node } from 'cc';
import { SelectImageLevelConfig } from '../../../data/LevelConfig';
import { BaseLevelController } from '../BaseLevelController';
import { LevelValidationResult } from '../LevelControllerTypes';
import {
    LevelCardHandle,
    createSelectableLevelCard,
    getNodeSize,
} from '../LevelUiFactory';

export class LevelSelectImage extends BaseLevelController<SelectImageLevelConfig> {
    private optionCards: LevelCardHandle[] = [];
    private selectedIndexes: Set<number> = new Set<number>();

    protected onInit(config: SelectImageLevelConfig): void {
        const expectedOptionCount = config.payload.gridSize * config.payload.gridSize;
        const indexedGroups = [
            ...config.payload.correctIndexes,
            ...config.payload.ambiguousIndexes,
            ...config.payload.decoyIndexes,
        ];

        if (config.payload.options.length !== expectedOptionCount) {
            throw new Error(
                `[LevelSelectImage] Option count mismatch. Expected ${expectedOptionCount}, got ${config.payload.options.length}.`,
            );
        }

        if (config.payload.gridSize <= 0) {
            throw new Error('[LevelSelectImage] Grid size must be greater than zero.');
        }

        if (indexedGroups.some((index) => index < 0 || index >= config.payload.options.length)) {
            throw new Error('[LevelSelectImage] Payload index out of range.');
        }

        if (new Set<number>(indexedGroups).size !== indexedGroups.length) {
            throw new Error('[LevelSelectImage] Payload index groups must not overlap.');
        }
    }

    protected onMount(rootNode: Node): void {
        const { width, height } = getNodeSize(rootNode, 420, 220);
        const config = this.requireConfig();
        const gridSize = config.payload.gridSize;
        const horizontalPadding = 8;
        const verticalPadding = 8;
        const columnGap = 8;
        const rowGap = 8;
        const cardWidth = Math.floor((width - horizontalPadding * 2 - columnGap * (gridSize - 1)) / gridSize);
        const cardHeight = Math.floor((height - verticalPadding * 2 - rowGap * (gridSize - 1)) / gridSize);
        const startX = -width * 0.5 + horizontalPadding + cardWidth * 0.5;
        const startY = height * 0.5 - verticalPadding - cardHeight * 0.5;

        config.payload.options.forEach((option, index) => {
            const column = index % gridSize;
            const row = Math.floor(index / gridSize);
            const cardX = startX + column * (cardWidth + columnGap);
            const cardY = startY - row * (cardHeight + rowGap);
            const card = createSelectableLevelCard(
                rootNode,
                `ImageOptionCard${index + 1}`,
                option.title,
                option.description,
                cardWidth,
                cardHeight,
                cardX,
                cardY,
            );

            card.node.on(Node.EventType.TOUCH_END, () => {
                this.toggleSelection(index);
            });

            this.optionCards.push(card);
        });
    }

    protected onReset(): void {
        this.selectedIndexes.clear();
        this.refreshSelectionVisuals();
    }

    protected onValidate(): LevelValidationResult {
        const config = this.requireConfig();
        const selectedIndexes = Array.from(this.selectedIndexes).sort((left, right) => left - right);
        const correctIndexes = [...config.payload.correctIndexes].sort((left, right) => left - right);
        const ambiguousSelections = selectedIndexes.filter((index) => config.payload.ambiguousIndexes.includes(index));
        const decoySelections = selectedIndexes.filter((index) => config.payload.decoyIndexes.includes(index));
        const missingCorrectSelections = correctIndexes.filter((index) => !this.selectedIndexes.has(index));
        const hasExactMatch = this.isExactSelectionMatch(selectedIndexes, correctIndexes);

        if (hasExactMatch) {
            return this.buildSuccessResult(
                '只选择了清晰可见的红绿灯。',
                [
                    `已接受格子：${this.describeIndexes(correctIndexes)}。`,
                    '严格筛选通过：裁切信号和相似物都已排除。',
                ].join(' '),
                {
                    reasonKey: 'exact-match',
                },
            );
        }

        if (selectedIndexes.length === 0) {
            return this.buildFailureResult(
                '没有选择任何符合条件的红绿灯格子。',
                [
                    `提示：${config.systemPrompt}`,
                    '系统要求选中每一个清晰可见的红绿灯格子，但没有收到有效选择。',
                    `规则：${config.absurdRule}`,
                ].join(' '),
                {
                    reasonKey: 'no-selection',
                },
            );
        }

        const detailParts: string[] = [];

        if (missingCorrectSelections.length > 0) {
            detailParts.push(`遗漏了清晰红绿灯：${this.describeIndexes(missingCorrectSelections)}。`);
        }

        if (ambiguousSelections.length > 0) {
            detailParts.push(
                `已拒绝残缺或远处信号片段：${this.describeIndexes(ambiguousSelections)}。边缘露出不算。`,
            );
        }

        if (decoySelections.length > 0) {
            detailParts.push(
                `已拒绝相似物或普通街景：${this.describeIndexes(decoySelections)}。形状相似不算。`,
            );
        }

        if (detailParts.length === 0) {
            detailParts.push('当前选择不满足严格匹配规则。');
        }

        detailParts.push(`系统规则：${config.absurdRule}`);

        const summaryText = this.buildFailureSummary(
            missingCorrectSelections.length > 0,
            ambiguousSelections.length > 0,
            decoySelections.length > 0,
        );

        return this.buildFailureResult(summaryText, detailParts.join(' '), {
            reasonKey: this.buildFailureReasonKey(
                missingCorrectSelections.length > 0,
                ambiguousSelections.length > 0,
                decoySelections.length > 0,
            ),
        });
    }

    protected onBeforeUnmount(): void {
        this.selectedIndexes.clear();
        this.optionCards = [];
    }

    private toggleSelection(index: number): void {
        if (this.selectedIndexes.has(index)) {
            this.selectedIndexes.delete(index);
        } else {
            this.selectedIndexes.add(index);
        }

        this.refreshSelectionVisuals();
    }

    private refreshSelectionVisuals(): void {
        this.optionCards.forEach((card, index) => {
            card.setSelected(this.selectedIndexes.has(index));
        });
    }

    private isExactSelectionMatch(selectedIndexes: number[], correctIndexes: number[]): boolean {
        if (selectedIndexes.length !== correctIndexes.length) {
            return false;
        }

        return selectedIndexes.every((value, index) => value === correctIndexes[index]);
    }

    private describeIndexes(indexes: number[]): string {
        const options = this.requireConfig().payload.options;

        return indexes
            .map((index) => options[index]?.title ?? `格子 ${index + 1}`)
            .join(', ');
    }

    private buildFailureSummary(hasMissingCorrect: boolean, hasAmbiguous: boolean, hasDecoy: boolean): string {
        if (hasMissingCorrect && (hasAmbiguous || hasDecoy)) {
            return '选择遗漏了有效红绿灯，同时包含了无效格子。';
        }

        if (hasMissingCorrect) {
            return '有清晰可见的红绿灯没有被选中。';
        }

        if (hasAmbiguous && hasDecoy) {
            return '选择同时包含裁切信号和误导性相似物。';
        }

        if (hasAmbiguous) {
            return '裁切或远处的红绿灯片段被错误选中。';
        }

        if (hasDecoy) {
            return '相似物或普通街景被错误选中。';
        }

        return '系统拒绝了提交的格子组合。';
    }

    private buildFailureReasonKey(hasMissingCorrect: boolean, hasAmbiguous: boolean, hasDecoy: boolean): string {
        if (hasMissingCorrect && (hasAmbiguous || hasDecoy)) {
            return 'mixed-selection';
        }

        if (hasMissingCorrect) {
            return 'missing-valid';
        }

        if (hasAmbiguous && hasDecoy) {
            return 'mixed-selection';
        }

        if (hasAmbiguous) {
            return 'selected-ambiguous';
        }

        if (hasDecoy) {
            return 'selected-decoy';
        }

        return 'strict-mismatch';
    }
}
