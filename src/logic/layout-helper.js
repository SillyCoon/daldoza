export class LayoutHelper {

    static makeControlButton({ name, disabled = false }) {
        const btn = document.createElement('button')
        btn.id = `btn-${name}`;
        btn.textContent = name;
        btn.disabled = disabled;
        return btn;
    }
}