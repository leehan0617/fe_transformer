import React, { useState } from 'react';

export default function TabsShell({ children }) {
    const items = React.Children.toArray(children);
    const firstId = items[0]?.props.id ?? '';
    const [activeId, setActiveId] = useState(firstId);

    return (
        <div className="w-full">
            {/* Tab list */}
            <div role="tablist" aria-label="검색 탭" className="flex gap-2 border-b border-gray-200">
                {items.map((child) => {
                    const { id, label } = child.props;
                    const isActive = id === activeId;
                    return (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${id}-panel`}
                            id={`${id}-tab`}
                            onClick={() => setActiveId(id)}
                            className={`relative -mb-px px-4 py-2 text-sm font-medium border-b-2 focus:outline-none ${
                                isActive ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Tab panels */}
            <div className="pt-4">
                {items.map((child) => {
                    const { id } = child.props;
                    const isActive = id === activeId;
                    return (
                        <div
                            key={id}
                            id={`${id}-panel`}
                            role="tabpanel"
                            aria-labelledby={`${id}-tab`}
                            hidden={!isActive}
                        >
                            {child}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function Tab({ children }) {
    return <>{children}</>;
}