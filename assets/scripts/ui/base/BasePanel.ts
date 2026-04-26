import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('BasePanel')
export class BasePanel extends Component {
    public show(): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }
}
