import { pointerWithin, type CollisionDetection } from "@dnd-kit/core";

/** 指针同时命中父、子容器时，保留最内层放置区。 */
export const containerCollisionDetection: CollisionDetection = (args) => {
    const collisions = pointerWithin(args);
    return collisions.filter((collision) => {
        const element = args.droppableContainers.find((item) => item.id === collision.id)?.node.current;
        return !collisions.some((other) => {
            if (other.id === collision.id) return false;
            const otherElement = args.droppableContainers.find((item) => item.id === other.id)?.node.current;
            return element && otherElement && element.contains(otherElement);
        });
    });
};

export function getContainerDropPosition(
    active: { left: number; top: number },
    target: { left: number; top: number },
    scale: number,
    scroll = { left: 0, top: 0 },
) {
    return {
        left: (active.left - target.left) / scale + scroll.left,
        top: (active.top - target.top) / scale + scroll.top,
    };
}
