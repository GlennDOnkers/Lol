import { useState, useRef, useEffect } from 'react';
import { Activity } from '../types';
import { useAppStore, AIScenario, Message } from '../store';
import { CoPilotMap } from './CoPilotMap';
import { Send, Bot, User, Sparkles, Loader2, Settings, X, Route, Clock, Navigation, ChevronDown, Save } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { ActivityFilters } from './ActivityFilters';

interface AIPlannerViewProps {
  activities: Activity[];
}

export function AIPlannerView({ activities }: AIPlannerViewProps) {
  const { starredIds, aiScenarios, setAIScenarios, activeScenarioId, setActiveScenario, aiModel, anthropicApiKey, addCustomActivity, aiMessages, setAiMessages, showAiScenariosPanel, setShowAiScenariosPanel, addAnnotation, filters } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starredActivities = activities.filter(a => starredIds.includes(a.id));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, aiScenarios]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setAiMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check cache
    const cacheKey = `ai-response-${userMessage.text}`;
    const cachedResponse = localStorage.getItem(cacheKey);
    if (cachedResponse) {
      setAiMessages(prev => [...prev, JSON.parse(cachedResponse)]);
      setIsLoading(false);
      return;
    }

    try {
      let responseText = '';

      const contextStr = `
Je bent een behulpzame, deskundige reisplanner voor een roadtrip door de westkust van de VS.
De gebruiker heeft de volgende activiteiten gemarkeerd met een ster (favorieten):
${starredActivities.length > 0 ? starredActivities.map(a => `- ${a.title} (Lat: ${a.lat}, Lng: ${a.lng})`).join('\n') : 'Nog geen activiteiten met een ster.'}

Geef antwoord in het Nederlands.
Je MOET je antwoord formatteren als een JSON object met de volgende structuur:
{
  "message": "Je tekstuele antwoord aan de gebruiker (gebruik Markdown).",
  "scenarios": [
    {
      "id": "unieke_id",
      "name": "Korte naam van de route",
      "description": "Korte beschrijving",
      "color": "#HEX_KLEUR",
      "transportMode": "driving" of "flying" of "walking",
      "waypoints": [
        { "name": "Naam locatie", "lat": getal, "lng": getal }
      ]
    }
  ],
  "newActivities": [
    {
      "id": "unieke_id_voor_nieuwe_activiteit",
      "title": "Naam van de activiteit",
      "description": "Beschrijving",
      "category": "adventure" | "nature" | "culture" | "events" | "parks" | "routes" | "wellbeing" | "social",
      "region": "Florida" | "Gulf" | "Texas" | "New Mexico" | "Arizona" | "Utah" | "Nevada" | "California" | "Northeast" | "Multi-region",
      "lat": getal,
      "lng": getal,
      "daysNeeded": getal,
      "costRange": [min, max],
      "priority": "High" | "Medium" | "Low",
      "tip": "Optionele handige tip"
    }
  ]
}
Als je geen route hoeft voor te stellen, laat de scenarios array dan leeg.
Als de gebruiker vraagt om een nieuwe activiteit toe te voegen of als je een specifieke plek aanraadt die nog niet in de app staat, kun je deze toevoegen via de newActivities array. Laat deze anders leeg.
Zorg dat de JSON geldig is.
`;

      if (aiModel.startsWith('gemini')) {
        const keyToUse = process.env.GEMINI_API_KEY;
        if (!keyToUse) {
          throw new Error("Gemini API sleutel is niet ingesteld.");
        }

        const ai = new GoogleGenAI({ apiKey: keyToUse });

        const contents = [
          { role: 'user', parts: [{ text: contextStr }] },
          { role: 'model', parts: [{ text: '{"message": "Begrepen. Ik ben klaar om te helpen.", "scenarios": []}' }] },
          ...aiMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage.text }] }
        ];

        const response = await ai.models.generateContent({
          model: aiModel,
          contents: contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                message: { type: Type.STRING },
                scenarios: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      color: { type: Type.STRING },
                      transportMode: { type: Type.STRING },
                      waypoints: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      }
                    },
                    required: ["id", "name", "description", "color", "transportMode", "waypoints"]
                  }
                },
                newActivities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING },
                      region: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      daysNeeded: { type: Type.NUMBER },
                      costRange: { 
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER }
                      },
                      priority: { type: Type.STRING },
                      tip: { type: Type.STRING }
                    },
                    required: ["id", "title", "description", "category", "region", "lat", "lng", "daysNeeded", "costRange", "priority"]
                  }
                }
              },
              required: ["message"]
            }
          }
        });

        responseText = response.text || '{}';
      } else if (aiModel.startsWith('claude')) {
        if (!anthropicApiKey) {
          throw new Error("Claude API sleutel is niet ingesteld. Vul deze in via de instellingen.");
        }
        
        const anthropic = new Anthropic({
          apiKey: anthropicApiKey,
          dangerouslyAllowBrowser: true
        });
        
        const claudeMessages = [
          ...aiMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: userMessage.text }
        ];

        const response = await anthropic.messages.create({
          model: aiModel,
          max_tokens: 2000,
          system: contextStr,
          messages: claudeMessages as any,
        });

        responseText = (response.content[0] as any).text;
      } else {
        throw new Error(`Model ${aiModel} wordt niet ondersteund.`);
      }

      // Strip markdown code blocks if present
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      const parsed = JSON.parse(responseText);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: parsed.message || 'Sorry, ik kon geen antwoord genereren.',
      };

      setAiMessages(prev => [...prev, modelMessage]);
      
      // Cache response
      localStorage.setItem(cacheKey, JSON.stringify(modelMessage));
      
      if (parsed.scenarios && parsed.scenarios.length > 0) {
        setAIScenarios(parsed.scenarios);
        setActiveScenario(null); // Reset active scenario to show all
        setShowAiScenariosPanel(true); // Open the scenarios panel
      }

      if (parsed.newActivities && parsed.newActivities.length > 0) {
        parsed.newActivities.forEach((act: any) => {
          // Ensure the ID is unique to prevent React key collisions
          const uniqueId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          addCustomActivity({
            ...act,
            id: uniqueId
          });
        });
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setAiMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Er is een fout opgetreden: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 p-4 md:p-6 relative">
      {/* Left Panel: Chat Interface */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-200 relative">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 flex items-center justify-between backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200/50 dark:border-orange-800/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-stone-900 dark:text-stone-100 text-lg leading-tight">AI Reisplanner</h2>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-0.5">Aangedreven door {aiModel.startsWith('gemini') ? 'Gemini' : 'Claude'}</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-3">
          <ActivityFilters />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar">
          {aiMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                msg.role === 'user' 
                  ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900" 
                  : "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm shadow-sm border",
                msg.role === 'user' 
                  ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-tr-sm border-transparent" 
                  : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-sm border-stone-100 dark:border-stone-700"
              )}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-stone-900 prose-pre:text-stone-100 prose-a:text-orange-600 dark:prose-a:text-orange-400">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shrink-0 mt-1 text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Aan het nadenken...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scenarios Panel */}
        {aiScenarios.length > 0 && (
          <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
            <button 
              onClick={() => setShowAiScenariosPanel(!showAiScenariosPanel)}
              className="flex items-center justify-between w-full focus:outline-none group"
            >
              <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                Voorgestelde Routes ({aiScenarios.length})
              </h3>
              <ChevronDown className={cn("w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-transform duration-200", showAiScenariosPanel ? "rotate-180" : "")} />
            </button>
            
            {showAiScenariosPanel && (
              <div className="flex flex-col gap-2 mt-3">
                {aiScenarios.map(scenario => {
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(isActive ? null : scenario.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl text-left transition-all border",
                        isActive 
                          ? "bg-white dark:bg-stone-800 border-orange-500 shadow-sm ring-1 ring-orange-500" 
                          : "bg-white/50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
                      )}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mt-1 shrink-0" 
                        style={{ backgroundColor: scenario.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">{scenario.name}</h4>
                          {scenario.transportMode === 'driving' && <Route className="w-4 h-4 text-stone-400" />}
                          {scenario.transportMode === 'flying' && <Navigation className="w-4 h-4 text-stone-400" />}
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-2">{scenario.description}</p>
                        
                        {scenario.distance && scenario.duration && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 text-xs font-medium text-stone-600 dark:text-stone-300">
                              <span className="flex items-center gap-1">
                                <Route className="w-3 h-3" />
                                {Math.round(scenario.distance / 1000)} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.round(scenario.duration / 3600)} uur
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (savedRoutes[scenario.id]) return;
                                
                                const latlngs = scenario.routeCoordinates || scenario.waypoints.map(w => [w.lat, w.lng] as [number, number]);
                                addAnnotation({
                                  id: `ai-route-${scenario.id}-${Date.now()}`,
                                  type: 'polyline',
                                  latlngs: latlngs,
                                  title: scenario.name
                                });
                                
                                setSavedRoutes(prev => ({ ...prev, [scenario.id]: true }));
                                setTimeout(() => {
                                  setSavedRoutes(prev => ({ ...prev, [scenario.id]: false }));
                                }, 3000);
                              }}
                              disabled={savedRoutes[scenario.id]}
                              className={cn(
                                "flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-md",
                                savedRoutes[scenario.id]
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                  : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                              )}
                            >
                              <Save className="w-3 h-3" />
                              {savedRoutes[scenario.id] ? "Opgeslagen!" : "Opslaan op kaart"}
                            </button>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Vraag om een route, planning of tips..."
              className="w-full max-h-32 min-h-[44px] bg-stone-100 dark:bg-stone-800 border-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl py-3 pl-4 pr-12 resize-none text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-500 hide-scrollbar"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-1.5 p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-center text-stone-400 mt-2">
            AI kan fouten maken. Controleer belangrijke reisinformatie.
          </p>
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className="hidden md:block w-1/2 lg:w-7/12 h-full">
        <CoPilotMap activities={starredActivities.length > 0 ? starredActivities : activities} />
      </div>
    </div>
  );
}
