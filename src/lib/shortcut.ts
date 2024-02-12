// from: https://svelte.dev/repl/acd92c9726634ec7b3d8f5f759824d15?version=4.2.10
export const shortcut = <T extends HTMLElement>(node: T, params: {control?:boolean, alt?: boolean, shift?: boolean, code: KeyboardEvent['code'], callback?: (node: T) => void}) => {
    let handler: any;
    const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
        removeHandler();
        if (!params)
            return;
        handler = (e: KeyboardEvent) => {
            if ((!!params.alt != e.altKey) ||
                (!!params.shift != e.shiftKey) ||
                (!!params.control != (e.ctrlKey || e.metaKey)) ||
                params.code != e.code)
                return;
            e.preventDefault();
            params.callback ? params.callback(node) : node.click();
        };
        window.addEventListener('keydown', handler);
    };
    setHandler();
    return {
        update: setHandler,
        destroy: removeHandler,
    };
};

