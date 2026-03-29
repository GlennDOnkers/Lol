import { useState, useEffect } from 'react';
import { Joyride, Step } from 'react-joyride';

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welkom bij de AI Roadtrip Planner! Laten we je snel rondleiden.',
      placement: 'center',
    },
    {
      target: '#activity-planner',
      content: 'Hier kun je je reis plannen met behulp van AI.',
    },
    {
      target: '#map-view',
      content: 'Hier zie je je route op de kaart.',
    },
  ];

  const JoyrideComponent = Joyride as any;

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      continuous
      callback={(data: any) => {
        if (data.status === 'finished' || data.status === 'skipped') {
          setRun(false);
          localStorage.setItem('hasSeenTour', 'true');
        }
      }}
    />
  );
}
