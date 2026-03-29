import { useState } from 'react';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { DollarSign, Euro, PieChart, TrendingUp, TrendingDown, Settings, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BudgetViewProps {
  activities: Activity[];
}

export function BudgetView({ activities }: BudgetViewProps) {
  const { starredIds, budgetSettings, updateBudget, currency, setCurrency, paidActivities, togglePaidActivity } = useAppStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  
  const starredActivities = activities.filter(a => starredIds.includes(a.id));
  
  // Calculate totals
  const totalDays = starredActivities.reduce((sum, a) => sum + a.daysNeeded, 0) || 21; // Default to 21 if no activities
  
  const activitiesMinCost = starredActivities.reduce((sum, a) => sum + a.costRange[0], 0);
  const activitiesMaxCost = starredActivities.reduce((sum, a) => sum + a.costRange[1], 0);
  const activitiesAvgCost = (activitiesMinCost + activitiesMaxCost) / 2;

  const totalFoodCost = budgetSettings.dailyFood * totalDays;
  const totalTransportCost = budgetSettings.transport;
  const totalPackageCost = budgetSettings.package;
  const totalCustomCost = (budgetSettings.customCategories || []).reduce((sum, cat) => sum + cat.amount, 0);

  const totalEstimatedCost = totalFoodCost + totalTransportCost + totalPackageCost + activitiesAvgCost + totalCustomCost;

  const CurrencyIcon = currency === 'EUR' ? Euro : DollarSign;
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'EUR' ? 'nl-NL' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim() || !newCategoryAmount) return;
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      amount: Number(newCategoryAmount)
    };
    
    updateBudget({
      customCategories: [...(budgetSettings.customCategories || []), newCategory]
    });
    
    setNewCategoryName('');
    setNewCategoryAmount('');
  };

  const handleRemoveCustomCategory = (id: string) => {
    updateBudget({
      customCategories: (budgetSettings.customCategories || []).filter(cat => cat.id !== id)
    });
  };

  const chartData = [
    { name: 'Eten & Drinken', value: totalFoodCost, color: '#f97316' }, // orange-500
    { name: 'Transport & Vluchten', value: totalTransportCost, color: '#3b82f6' }, // blue-500
    { name: 'Accommodatie', value: totalPackageCost, color: '#10b981' }, // emerald-500
    { name: 'Activiteiten', value: activitiesAvgCost, color: '#a855f7' }, // purple-500
    ...(budgetSettings.customCategories || []).map((cat, i) => ({
      name: cat.name,
      value: cat.amount,
      color: ['#ec4899', '#eab308', '#06b6d4', '#6366f1'][i % 4] // pink, yellow, cyan, indigo
    }))
  ].filter(item => item.value > 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Settings Panel */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Settings className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            Budget Instellingen
          </h2>
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${currency === 'EUR' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'}`}
            >
              EUR (€)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${currency === 'USD' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'}`}
            >
              USD ($)
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Dagelijks Eten ({currencySymbol})</label>
            <div className="relative">
              <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="number" 
                value={budgetSettings.dailyFood}
                onChange={(e) => updateBudget({ dailyFood: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium"
              />
            </div>
            <p className="text-xs font-medium text-stone-400 mt-2">Voor {totalDays} dagen: <span className="text-stone-600 dark:text-stone-300">{formatCurrency(totalFoodCost)}</span></p>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Transport (Vlucht/Huurauto)</label>
            <div className="relative">
              <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="number" 
                value={budgetSettings.transport}
                onChange={(e) => updateBudget({ transport: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Overige Pakketkosten (Hotels)</label>
            <div className="relative">
              <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="number" 
                value={budgetSettings.package}
                onChange={(e) => updateBudget({ package: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Custom Categories */}
        <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
          <h3 className="text-sm font-display font-semibold text-stone-800 dark:text-stone-200 mb-4">Aangepaste Categorieën</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input 
              type="text" 
              placeholder="Naam categorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium"
            />
            <div className="relative sm:w-40">
              <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="number" 
                placeholder="Bedrag"
                value={newCategoryAmount}
                onChange={(e) => setNewCategoryAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 text-stone-900 dark:text-white transition-all font-medium"
              />
            </div>
            <button 
              onClick={handleAddCustomCategory}
              disabled={!newCategoryName.trim() || !newCategoryAmount}
              className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium rounded-xl hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Toevoegen</span>
            </button>
          </div>

          {budgetSettings.customCategories && budgetSettings.customCategories.length > 0 && (
            <div className="space-y-2">
              {budgetSettings.customCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3.5 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-700/50 group transition-colors">
                  <span className="font-medium text-stone-700 dark:text-stone-300">{cat.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-stone-900 dark:text-white font-display font-semibold">{formatCurrency(cat.amount)}</span>
                    <button 
                      onClick={() => handleRemoveCustomCategory(cat.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-8 rounded-3xl shadow-md text-white flex flex-col justify-between relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium tracking-wider uppercase text-xs opacity-90">Totaal Geschat Budget</h3>
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-sm">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
            <p className="text-5xl font-display font-semibold tracking-tight">{formatCurrency(totalEstimatedCost)}</p>
            <p className="text-sm mt-4 opacity-90 font-medium">Gebaseerd op instellingen en {starredActivities.length} opgeslagen activiteiten.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20 relative z-10">
            <div>
              <h3 className="text-white/80 font-medium tracking-wider uppercase text-[10px] mb-1.5">Activiteiten (Min)</h3>
              <p className="text-2xl font-display font-medium">{formatCurrency(activitiesMinCost)}</p>
            </div>
            <div>
              <h3 className="text-white/80 font-medium tracking-wider uppercase text-[10px] mb-1.5">Activiteiten (Max)</h3>
              <p className="text-2xl font-display font-medium">{formatCurrency(activitiesMaxCost)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 h-[350px] flex flex-col transition-colors duration-200"
        >
          <h3 className="text-stone-800 dark:text-white font-display font-semibold text-lg mb-4">Kostenverdeling</h3>
          <div className="flex-1 w-full relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                Geen data om weer te geven
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-8 transition-colors duration-200">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50">
          <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-white">Kostenverdeling</h2>
        </div>
        
        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          <div className="p-6 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
            <div>
              <h3 className="font-display font-medium text-stone-800 dark:text-stone-200 text-lg">Transport & Vluchten</h3>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Vaste kosten</p>
            </div>
            <span className="text-xl font-display font-semibold text-stone-900 dark:text-white">{formatCurrency(totalTransportCost)}</span>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
            <div>
              <h3 className="font-display font-medium text-stone-800 dark:text-stone-200 text-lg">Accommodatie (Pakket)</h3>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Vaste kosten</p>
            </div>
            <span className="text-xl font-display font-semibold text-stone-900 dark:text-white">{formatCurrency(totalPackageCost)}</span>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
            <div>
              <h3 className="font-display font-medium text-stone-800 dark:text-stone-200 text-lg">Eten & Drinken</h3>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{currencySymbol}{budgetSettings.dailyFood} per dag × {totalDays} dagen</p>
            </div>
            <span className="text-xl font-display font-semibold text-stone-900 dark:text-white">{formatCurrency(totalFoodCost)}</span>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
            <div>
              <h3 className="font-display font-medium text-stone-800 dark:text-stone-200 text-lg">Activiteiten (Gemiddeld)</h3>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{starredActivities.length} opgeslagen items</p>
            </div>
            <span className="text-xl font-display font-semibold text-stone-900 dark:text-white">{formatCurrency(activitiesAvgCost)}</span>
          </div>

          {budgetSettings.customCategories?.map(cat => (
            <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
              <div>
                <h3 className="font-display font-medium text-stone-800 dark:text-stone-200 text-lg">{cat.name}</h3>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Aangepaste categorie</p>
              </div>
              <span className="text-xl font-display font-semibold text-stone-900 dark:text-white">{formatCurrency(cat.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Activities Tracking */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-white">Betaalde Activiteiten</h2>
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
            {starredActivities.filter(a => paidActivities[a.id]).length} van {starredActivities.length} betaald
          </span>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          {starredActivities.map(activity => {
            const isPaid = paidActivities[activity.id];
            return (
              <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <button onClick={() => togglePaidActivity(activity.id)} className="focus:outline-none shrink-0 transition-transform active:scale-95">
                    {isPaid ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-stone-300 dark:text-stone-600 group-hover:text-stone-400 dark:group-hover:text-stone-500" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-display font-medium text-base leading-tight mb-0.5 transition-colors ${isPaid ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-800 dark:text-stone-200'}`}>{activity.title}</h3>
                    <p className={`text-xs font-medium transition-colors ${isPaid ? 'text-stone-400/70 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>{activity.region}</p>
                  </div>
                </div>
                <span className={`text-sm font-display font-semibold transition-colors ${isPaid ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-white'}`}>
                  {formatCurrency(activity.costRange[0])} - {formatCurrency(activity.costRange[1])}
                </span>
              </div>
            );
          })}
          {starredActivities.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-stone-500 dark:text-stone-400 font-medium">Geen opgeslagen activiteiten om bij te houden.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
