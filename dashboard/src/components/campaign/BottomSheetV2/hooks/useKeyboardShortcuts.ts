import { useEffect } from 'react';

/**
 * useKeyboardShortcuts - Global keyboard shortcuts for canvas
 * 
 * Shortcuts:
 * - Ctrl+Z: Undo
 * - Ctrl+Y / Ctrl+Shift+Z: Redo
 * - Delete/Backspace: Delete selected
 * - Ctrl+D: Duplicate selected
 * - Arrow keys: Move selected (1px or 10px with Shift)
 * - Ctrl+A: Select all
 * - Escape: Deselect
 */

interface KeyboardShortcutsOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMove?: (dx: number, dy: number) => void;
  onSelectAll?: () => void;
  onDeselect?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onMove,
  onSelectAll,
  onDeselect,
  enabled = true,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
      if (
        (modifier && e.key === 'y') ||
        (modifier && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Delete or Backspace: Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete?.();
        return;
      }

      // Ctrl/Cmd + D: Duplicate
      if (modifier && e.key === 'd') {
        e.preventDefault();
        onDuplicate?.();
        return;
      }

      // Ctrl/Cmd + A: Select all
      if (modifier && e.key === 'a') {
        e.preventDefault();
        onSelectAll?.();
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        onDeselect?.();
        return;
      }

      // Arrow keys: Move selected
      if (onMove) {
        const step = e.shiftKey ? 10 : 1; // Shift = 10px, normal = 1px

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            onMove(-step, 0);
            break;
          case 'ArrowRight':
            e.preventDefault();
            onMove(step, 0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            onMove(0, -step);
            break;
          case 'ArrowDown':
            e.preventDefault();
            onMove(0, step);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onUndo,
    onRedo,
    onDelete,
    onDuplicate,
    onMove,
    onSelectAll,
    onDeselect,
  ]);
};
