/* context/EntityContext.tsx — TrustBox
   Stores entities above the router so they survive tab switches.
   Also persists to localStorage for page refreshes.
*/

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Entity {
  id:          number;
  addedAt:     string;
  typeMeta:    any;
  data:        any;
  lastAction?: string;
  lastScore?:  any;
  lastActionAt?: string;
}

interface EntityContextValue {
  entities:     Entity[];
  addEntity:    (entity: Omit<Entity, "id" | "addedAt">) => Entity;
  removeEntity: (id: number) => void;
  updateEntity: (id: number, patch: Partial<Entity>) => void;
  clearAll:     () => void;
}

const EntityContext = createContext<EntityContextValue | null>(null);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(() => {
    try {
      const saved = localStorage.getItem("tb_entities");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("tb_entities", JSON.stringify(entities));
  }, [entities]);

  const addEntity = (entity: Omit<Entity, "id" | "addedAt">): Entity => {
    const record: Entity = { ...entity, id: Date.now(), addedAt: new Date().toISOString() };
    setEntities(prev => [record, ...prev]);
    return record;
  };

  const removeEntity = (id: number) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const updateEntity = (id: number, patch: Partial<Entity>) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const clearAll = () => {
    setEntities([]);
    localStorage.removeItem("tb_entities");
  };

  return (
    <EntityContext.Provider value={{ entities, addEntity, removeEntity, updateEntity, clearAll }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities() {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error("useEntities must be used inside EntityProvider");
  return ctx;
}