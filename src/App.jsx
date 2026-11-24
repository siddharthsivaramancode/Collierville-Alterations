import { useCallback, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GarmentGuide from './components/GarmentGuide';
import FitVisualizer from './components/FitVisualizer';
import Process from './components/Process';
import Reviews from './components/Reviews';
import Visit from './components/Visit';
import Footer from './components/Footer';
import FittingModal from './components/FittingModal';
import { PhoneIcon, StitchDivider } from './components/ui';
import { BUSINESS } from './data/content';

export default function App() {
  const [eventDate, setEventDate] = useState('');
  const [modal, setModal] = useState({ open: false, prefill: {} });

  const openFitting = useCallback(
    (prefill = {}) => {
      setModal({
        open: true,
        prefill: { ...prefill, eventDate: prefill.eventDate || eventDate },
      });
    },
    [eventDate],
  );

  const closeFitting = useCallback(() => {
    setModal((current) => ({ ...current, open: false }));
  }, []);

  return (
    <div className="relative min-h-screen">
      <Header onRequest={openFitting} />

      <main>
        <Hero onRequest={openFitting} />
        <StitchDivider className="py-1" />
        <GarmentGuide
          eventDate={eventDate}
          onEventDateChange={setEventDate}
          onRequest={openFitting}
        />
        <StitchDivider className="py-1" />
        <FitVisualizer onRequest={openFitting} />
        <StitchDivider className="py-1" />
        <Process onRequest={openFitting} />
        <StitchDivider className="py-1" />
        <Reviews />
        <StitchDivider className="py-1" />
        <Visit />
      </main>

      <Footer onRequest={openFitting} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-linen/[0.97] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:hidden">
        <div className="flex gap-2.5">
          <a href={BUSINESS.phoneHref} className="btn-ghost flex-1 !px-4 !py-3 !text-[10px]">
            <PhoneIcon className="h-3.5 w-3.5" />
            Call Studio
          </a>
          <button
            type="button"
            onClick={() => openFitting()}
            className="btn-primary flex-1 !px-4 !py-3 !text-[10px]"
          >
            Request a Fitting
          </button>
        </div>
      </div>

      <FittingModal open={modal.open} onClose={closeFitting} prefill={modal.prefill} />
    </div>
  );
}
