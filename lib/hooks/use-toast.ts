"use client";

import * as React from "react";
import type { ToastActionElement } from "@/components/feedback/toast";

const TOAST_LIMIT = 3;

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastActionElement;
  open?: boolean;
}

type State = { toasts: ToastItem[] };
type Action =
  | { type: "ADD"; toast: ToastItem }
  | { type: "DISMISS"; id: string }
  | { type: "REMOVE"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "DISMISS":
      return { toasts: state.toasts.map((t) => (t.id === action.id ? { ...t, open: false } : t)) };
    case "REMOVE":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

let idCounter = 0;

export function toast(props: Omit<ToastItem, "id">) {
  const id = String(idCounter++);
  dispatch({ type: "ADD", toast: { ...props, id, open: true } });
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS", id }),
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS", id }),
    remove: (id: string) => dispatch({ type: "REMOVE", id }),
  };
}
