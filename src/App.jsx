import React from 'react';
import TabsShell, { Tab } from './components/common/TabsShell';
import SummaryTab from "./tabs/SummaryTab.jsx";
import DetailTab from "./tabs/DetailTab.jsx";
import './index.css';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
                <div className="w-full px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight">변압기 이용률 현황 예측 모델</h1>
                    <div className="text-sm text-gray-500">데이터사이언스랩 + 부산울산본부</div>
                </div>
            </header>
            <main className="w-full p-4 md:p-6">
                <TabsShell>
                    <Tab id="tab-1" label="변압기 이용률 현황">
                        <SummaryTab />
                    </Tab>
                    <Tab id="tab-2" label="변압기 이용률 상세">
                        <DetailTab />
                    </Tab>
                </TabsShell>
            </main>
        </div>
    );
}
