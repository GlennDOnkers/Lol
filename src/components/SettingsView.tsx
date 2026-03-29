import { useState } from 'react';
import { useAppStore } from '../store';
import { Settings, Key, Bot, Moon, Sun, DollarSign, Save, Check, FileDown, Share2, Map } from 'lucide-react';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function SettingsView() {
  const { 
    aiModel, 
    setAiModel, 
    anthropicApiKey, 
    setAnthropicApiKey,
    isDarkMode,
    toggleDarkMode,
    currency,
    setCurrency,
    calendar
  } = useAppStore();

  const [localApiKey, setLocalApiKey] = useState(anthropicApiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = () => {
    setAnthropicApiKey(localApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.text("Reisplan", 10, 10);
    doc.text(JSON.stringify(calendar, null, 2), 10, 20);
    doc.save("reisplan.pdf");
  };

  const exportToGPX = () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Amerika Reisplanner">
  <trk>
    <name>Reisplan</name>
    <trkseg>
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reisplan.gpx';
    a.click();
  };

  const models = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)', provider: 'Google' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Advanced)', provider: 'Google' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10">
        <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Settings className="w-7 h-7 text-orange-600 dark:text-orange-500" />
          </div>
          Instellingen
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mt-3 text-lg">
          Beheer je AI-modellen, API-sleutels en app-voorkeuren.
        </p>
      </div>

      <div className="space-y-8">
        {/* Export Section */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <h3 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileDown className="w-5 h-5 text-green-600 dark:text-green-500" />
              </div>
              Export & Delen
            </h3>
          </div>
          <div className="p-8 flex gap-4">
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700">
              <FileDown className="w-4 h-4" /> PDF
            </button>
            <button onClick={exportToGPX} className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700">
              <Map className="w-4 h-4" /> GPX
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700">
              <Share2 className="w-4 h-4" /> Deelbare link
            </button>
          </div>
        </section>

        {/* AI Settings Section */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <h3 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              AI Assistent Configuratie
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4 uppercase tracking-wider">
                Kies een AI Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setAiModel(model.id)}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all duration-200",
                      aiModel === model.id
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                        : "border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-700/50 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    )}
                  >
                    <span className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">{model.name}</span>
                    <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{model.provider}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Key className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                Claude (Anthropic) API Key
              </label>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
                Gemini modellen gebruiken de ingebouwde API-sleutel. Voor Claude modellen moet je je eigen Anthropic API-sleutel opgeven. Deze wordt lokaal opgeslagen in je browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 transition-all font-mono text-sm"
                />
                <button
                  onClick={handleSaveKey}
                  className="flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-6 py-3 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-white transition-all shadow-sm"
                >
                  {isSaved ? <Check className="w-5 h-5 text-green-400 dark:text-green-600" /> : <Save className="w-5 h-5" />}
                  {isSaved ? 'Opgeslagen' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance & Preferences */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <h3 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Sun className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              Weergave & Voorkeuren
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Dark Mode</h4>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Schakel tussen licht en donker thema</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 dark:focus:ring-offset-stone-900",
                  isDarkMode ? "bg-orange-500" : "bg-stone-300 dark:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
                  Valuta
                </h4>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Kies je voorkeursvaluta voor het budget</p>
              </div>
              <div className="flex bg-stone-100 dark:bg-stone-800/50 rounded-xl p-1.5 border border-stone-200/50 dark:border-stone-700/50">
                <button
                  onClick={() => setCurrency('EUR')}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    currency === 'EUR' ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  )}
                >
                  EUR (€)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    currency === 'USD' ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  )}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
