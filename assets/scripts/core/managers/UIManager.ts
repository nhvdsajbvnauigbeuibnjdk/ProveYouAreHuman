import { Node } from 'cc';
import { UIPageId, UIPopupId } from '../../data/GameConst';

export class UIManager {
    private readonly pages = new Map<UIPageId, Node>();
    private readonly popups = new Map<UIPopupId, Node>();
    private popupStack: UIPopupId[] = [];
    private currentPage: UIPageId | null = null;

    public registerPage(pageId: UIPageId, node: Node): void {
        this.pages.set(pageId, node);
        node.active = false;
    }

    public registerPopup(popupId: UIPopupId, node: Node): void {
        this.popups.set(popupId, node);
        node.active = false;
    }

    public showPage(pageId: UIPageId): void {
        this.closeAllPopups();

        this.pages.forEach((node, id) => {
            node.active = id === pageId;
        });

        this.currentPage = pageId;
    }

    public getCurrentPage(): UIPageId | null {
        return this.currentPage;
    }

    public openPopup(popupId: UIPopupId): void {
        const popup = this.popups.get(popupId);

        if (!popup) {
            console.warn(`[UIManager] Popup is not registered: ${popupId}`);
            return;
        }

        this.popups.forEach((node, id) => {
            node.active = id === popupId;
        });

        popup.active = true;
        this.bringToFront(popup);
        this.popupStack = [popupId];
    }

    public closePopup(popupId: UIPopupId): void {
        const popup = this.popups.get(popupId);

        if (!popup) {
            return;
        }

        popup.active = false;
        this.popupStack = this.popupStack.filter((id) => id !== popupId);
    }

    public isPopupOpen(popupId: UIPopupId): boolean {
        return this.popupStack.includes(popupId);
    }

    public closeAllPopups(): void {
        this.popups.forEach((node) => {
            node.active = false;
        });

        this.popupStack = [];
    }

    public closeTopPopup(): void {
        const topPopupId = this.popupStack[this.popupStack.length - 1];

        if (!topPopupId) {
            return;
        }

        this.closePopup(topPopupId);
    }

    private bringToFront(node: Node): void {
        const parent = node.parent;

        if (!parent) {
            return;
        }

        node.setSiblingIndex(parent.children.length - 1);
    }
}
