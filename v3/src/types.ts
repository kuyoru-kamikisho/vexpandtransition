export interface HTMLExpandElement extends HTMLElement {
    _parent?: (Node & ParentNode & HTMLElement) | null
    _initialStyle?: {
        transition: string
        overflow: string
        height?: string | null
        width?: string | null
    }
}