'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { PackingCategory, PackingItem } from '@/types/trip';

interface PackingListProps {
  items: string[];
  planId?: string; // For localStorage key
}

const CATEGORY_ICONS: Record<PackingCategory, string> = {
  klær: '👕',
  teknologi: '📱',
  helse: '💊',
  dokumenter: '📄',
  aktiviteter: '🎿',
};

const CATEGORY_LABELS: Record<PackingCategory, string> = {
  klær: 'Klær',
  teknologi: 'Teknologi',
  helse: 'Helse',
  dokumenter: 'Dokumenter',
  aktiviteter: 'Aktiviteter',
};

function categorizeItem(item: string): PackingCategory {
  const lower = item.toLowerCase();

  // Klær
  if (
    lower.includes('jakke') ||
    lower.includes('bukse') ||
    lower.includes('sko') ||
    lower.includes('votter') ||
    lower.includes('lue') ||
    lower.includes('skjerf') ||
    lower.includes('sokk') ||
    lower.includes('undertøy') ||
    lower.includes('genser') ||
    lower.includes('ullklær')
  ) {
    return 'klær';
  }

  // Teknologi
  if (
    lower.includes('kamera') ||
    lower.includes('telefon') ||
    lower.includes('lader') ||
    lower.includes('batteri') ||
    lower.includes('adapter') ||
    lower.includes('powerbank') ||
    lower.includes('hodetelefoner')
  ) {
    return 'teknologi';
  }

  // Helse
  if (
    lower.includes('solkrem') ||
    lower.includes('medisiner') ||
    lower.includes('førstehjelpsutstyr') ||
    lower.includes('plaster') ||
    lower.includes('smertestillende') ||
    lower.includes('allergi') ||
    lower.includes('resept')
  ) {
    return 'helse';
  }

  // Dokumenter
  if (
    lower.includes('pass') ||
    lower.includes('id') ||
    lower.includes('billetter') ||
    lower.includes('bekreftelse') ||
    lower.includes('forsikring') ||
    lower.includes('visa')
  ) {
    return 'dokumenter';
  }

  // Aktiviteter
  if (
    lower.includes('ski') ||
    lower.includes('tur') ||
    lower.includes('staver') ||
    lower.includes('sekk') ||
    lower.includes('termos') ||
    lower.includes('kikkert') ||
    lower.includes('stativ')
  ) {
    return 'aktiviteter';
  }

  // Default
  return 'klær';
}

export function PackingList({ items, planId = 'default' }: PackingListProps) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<PackingCategory>>(
    new Set(['klær', 'teknologi', 'helse', 'dokumenter', 'aktiviteter'])
  );

  // Initialize items from props
  useEffect(() => {
    const categorized = items.map((item, index) => ({
      id: `item-${index}`,
      category: categorizeItem(item),
      item,
      checked: false,
    }));

    // Load checked state from localStorage
    const stored = localStorage.getItem(`packing-list-${planId}`);
    if (stored) {
      try {
        const checkedIds = JSON.parse(stored) as string[];
        categorized.forEach((item) => {
          if (checkedIds.includes(item.id)) {
            item.checked = true;
          }
        });
      } catch (e) {
        console.error('Error loading packing list from localStorage:', e);
      }
    }

    setPackingItems(categorized);
  }, [items, planId]);

  // Save to localStorage when checked state changes
  useEffect(() => {
    const checkedIds = packingItems.filter((item) => item.checked).map((item) => item.id);
    localStorage.setItem(`packing-list-${planId}`, JSON.stringify(checkedIds));
  }, [packingItems, planId]);

  const toggleItem = (id: string) => {
    setPackingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleCategory = (category: PackingCategory) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const categories = (Object.keys(CATEGORY_ICONS) as PackingCategory[]).filter((category) => {
    return packingItems.some((item) => item.category === category);
  });

  const totalItems = packingItems.length;
  const checkedItems = packingItems.filter((item) => item.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-arctic-800 rounded-2xl p-6 border border-arctic-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Pakkeliste fremgang</h3>
          <span className="text-sm font-medium text-primary">
            {checkedItems} / {totalItems}
          </span>
        </div>
        <div className="w-full bg-arctic-700 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{progress}% pakket</p>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryItems = packingItems.filter((item) => item.category === category);
          const isExpanded = expandedCategories.has(category);
          const categoryChecked = categoryItems.filter((item) => item.checked).length;

          return (
            <div key={category} className="bg-arctic-800 rounded-2xl border border-arctic-700 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-arctic-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                  <span className="font-semibold">{CATEGORY_LABELS[category]}</span>
                  <span className="text-sm text-muted-foreground">
                    ({categoryChecked}/{categoryItems.length})
                  </span>
                </div>
                <svg
                  className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-6 pb-4">
                  <ul className="space-y-2">
                    {categoryItems.map((item) => (
                      <li key={item.id}>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-arctic-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded border-2 border-arctic-700 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:ring-offset-arctic-800 cursor-pointer"
                          />
                          <span className={cn('text-sm', item.checked && 'line-through text-muted-foreground')}>
                            {item.item}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 border border-primary/30 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-lg">Alt er pakket!</p>
          <p className="text-sm text-muted-foreground mt-1">Du er klar for turen</p>
        </div>
      )}
    </div>
  );
}
