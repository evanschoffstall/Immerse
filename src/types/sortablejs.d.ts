declare module "sortablejs" {
  type SortableEvent = {
    oldIndex?: number | null;
    newIndex?: number | null;
  };

  type SortableOptions = {
    animation?: number;
    handle?: string;
    draggable?: string;
    ghostClass?: string;
    onEnd?: (evt: SortableEvent) => void;
  };

  class Sortable {
    static create(el: HTMLElement, options?: SortableOptions): Sortable;
    destroy(): void;
  }

  export type { SortableEvent, SortableOptions };
  export default Sortable;
}
