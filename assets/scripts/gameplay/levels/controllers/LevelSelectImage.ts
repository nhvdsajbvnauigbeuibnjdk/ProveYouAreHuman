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
                'Only clearly visible traffic lights were selected.',
                [
                    `Accepted tiles: ${this.describeIndexes(correctIndexes)}.`,
                    'Strict filter satisfied: cropped signals and lookalikes were excluded.',
                ].join(' '),
                {
                    reasonKey: 'exact-match',
                },
            );
        }

        if (selectedIndexes.length === 0) {
            return this.buildFailureResult(
                'No qualifying traffic-light tiles were selected.',
                [
                    `Prompt: ${config.systemPrompt}`,
                    'The system expected every clearly visible traffic light tile and received no submission.',
                    `Rule: ${config.absurdRule}`,
                ].join(' '),
                {
                    reasonKey: 'no-selection',
                },
            );
        }

        const detailParts: string[] = [];

        if (missingCorrectSelections.length > 0) {
            detailParts.push(`Missing clear traffic lights: ${this.describeIndexes(missingCorrectSelections)}.`);
        }

        if (ambiguousSelections.length > 0) {
            detailParts.push(
                `Rejected partial or distant signal fragments: ${this.describeIndexes(ambiguousSelections)}. Edge exposures do not count.`,
            );
        }

        if (decoySelections.length > 0) {
            detailParts.push(
                `Rejected lookalikes or ordinary street scenes: ${this.describeIndexes(decoySelections)}. Similar shapes do not count.`,
            );
        }

        if (detailParts.length === 0) {
            detailParts.push('The selected tiles did not satisfy the exact strict-match rule.');
        }

        detailParts.push(`System rule: ${config.absurdRule}`);

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
            .map((index) => options[index]?.title ?? `TILE ${index + 1}`)
            .join(', ');
    }

    private buildFailureSummary(hasMissingCorrect: boolean, hasAmbiguous: boolean, hasDecoy: boolean): string {
        if (hasMissingCorrect && (hasAmbiguous || hasDecoy)) {
            return 'The selection missed valid traffic lights and included invalid tiles.';
        }

        if (hasMissingCorrect) {
            return 'Some clearly visible traffic lights were left unselected.';
        }

        if (hasAmbiguous && hasDecoy) {
            return 'The selection included both cropped signals and misleading lookalikes.';
        }

        if (hasAmbiguous) {
            return 'Cropped or distant traffic-light fragments were incorrectly selected.';
        }

        if (hasDecoy) {
            return 'Lookalike objects or ordinary street scenes were incorrectly selected.';
        }

        return 'The system rejected the submitted tile combination.';
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
