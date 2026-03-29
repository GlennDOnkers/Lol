import { BookOpen, Map, Shield, DollarSign, Calendar } from 'lucide-react';

export function GuideView() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8 transition-colors duration-200">
        <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-500" />
          </div>
          Reisgids
        </h2>
        <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg font-medium">
          Stapsgewijze handleiding voor het plannen van je droomreis door de Verenigde Staten.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-6 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-sm border border-orange-200/50 dark:border-orange-800/30">
              1
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-3 flex items-center gap-3">
              <Map className="w-6 h-6 text-orange-400 dark:text-orange-500" />
              De Route Bepalen
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Begin met het vaststellen van je start- en eindpunt. Voor een 3-weekse reis aan de Westkust is een rondje (bijv. San Francisco - San Francisco) of een one-way (bijv. San Francisco - Los Angeles) ideaal.
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 ml-4">
              <li>Kies maximaal 3-4 grote steden.</li>
              <li>Plan voldoende tijd in de Nationale Parken (minimaal 1 volle dag per park).</li>
              <li>Houd rekening met lange rijdagen (max 5-6 uur per dag is aan te raden).</li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-6 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-sm border border-orange-200/50 dark:border-orange-800/30">
              2
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-3 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-orange-400 dark:text-orange-500" />
              Boeken & Reserveren
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Sommige attracties en accommodaties in de VS moeten maanden van tevoren worden geboekt.
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 ml-4">
              <li><strong>Alcatraz:</strong> Exact 90 dagen voor de gewenste datum.</li>
              <li><strong>Nationale Parken (Lodges):</strong> Vaak een jaar van tevoren volgeboekt.</li>
              <li><strong>Antelope Canyon:</strong> Minimaal 3-6 maanden vooraf.</li>
              <li><strong>Huurauto:</strong> Boek vroeg voor de beste prijzen, annuleer en herboek als het goedkoper wordt.</li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-6 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-sm border border-orange-200/50 dark:border-orange-800/30">
              3
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-3 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-orange-400 dark:text-orange-500" />
              Budget & Geldzaken
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              De VS is niet goedkoop. Zorg voor een realistisch budget en de juiste betaalmiddelen.
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 ml-4">
              <li>Een creditcard (Visa of Mastercard) is absoluut noodzakelijk voor autohuur en hotels.</li>
              <li>Zet je pinpas op 'Werelddekking'.</li>
              <li>Houd rekening met 'resort fees' in steden als Las Vegas (vaak $30-$50 per nacht extra).</li>
              <li>Prijzen in winkels zijn exclusief tax (belasting).</li>
            </ul>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-6 transition-colors duration-200 hover:border-orange-200 dark:hover:border-orange-900/50">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-sm border border-orange-200/50 dark:border-orange-800/30">
              4
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-stone-900 dark:text-white mb-3 flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-400 dark:text-orange-500" />
              Veiligheid & Gezondheid
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Bereid je goed voor op de omstandigheden, vooral in de natuur.
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 ml-4">
              <li>Sluit een goede reisverzekering af met werelddekking en medische kosten (zorg in de VS is extreem duur).</li>
              <li>Neem altijd voldoende water mee in de auto (minimaal 1 gallon per persoon per dag in woestijngebieden).</li>
              <li>Blijf op de paden in Nationale Parken en houd afstand van wilde dieren.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
