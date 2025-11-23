import { useState, useCallback } from 'react';
import type { Component } from '../core/types';

/**
 * useHistory - Undo/Redo functionality for component state
 * 
 * Manages history stack with past/present/future states.
 * Provides undo (Ctrl+Z) and redo (Ctrl+Y) functionality.
 * 
 * @param initialState - Initial components array
 * @param maxHistorySize - Maximum number of states to keep (default: 50)
 */

const MAX_HISTORY_SIZE = 50;

interface HistoryState {
  past: Component[][];
  present: Component[];
  future: Component[][];
}

interface UseHistoryReturn {
  state: Component[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setState: (newState: Component[]) => void;
  reset: (newState: Component[]) => void;
}

export const useHistory = (initialState: Component[]): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Undo: Move to previous state
  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory((current) => {
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, [canUndo]);

  // Redo: Move to next state
  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((current) => {
      const next = current.future[0];
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  // Set state: Add to history stack with size limit
  const setState = useCallback((newState: Component[]) => {
    setHistory((current) => {
      // Don't add to history if state hasn't changed
      if (JSON.stringify(current.present) === JSON.stringify(newState)) {
        return current;
      }

      // Add current state to past
      const newPast = [...current.past, current.present];
      
      // Limit history size (remove oldest if exceeds max)
      const limitedPast = newPast.length > MAX_HISTORY_SIZE 
        ? newPast.slice(-MAX_HISTORY_SIZE)
        : newPast;

      return {
        past: limitedPast,
        present: newState,
        future: [], // Clear future when new action is taken
      };
    });
  }, []);

  // Reset: Clear history and set new state
  const reset = useCallback((newState: Component[]) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    canUndo,
    canRedo,
    undo,
    redo,
    setState,
    reset,
  };
};
