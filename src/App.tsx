import React, { useState } from 'react';
import { useReservations } from './hooks/useReservations';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Reservations } from './pages/Reservations';
import { Confirmation } from './pages/Confirmation';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { ReservationData, MenuItem } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [confirmedReservation, setConfirmedReservation] = useState<ReservationData | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Core reservation state & business logic hook
  const {
    reservations,
    tables,
    stats,
    selectedDate,
    setSelectedDate,
    selectedShift,
    setSelectedShift,
    selectedTime,
    setSelectedTime,
    selectedGuests,
    setSelectedGuests,
    selectedZone,
    setSelectedZone,
    selectedTableId,
    setSelectedTableId,
    selectedTable,
    createReservation,
    updateReservationStatus,
    cancelReservation,
    resetToInitialData,
    notification,
  } = useReservations();

  // Handler when a reservation is successfully created
  const handleReservationComplete = (newRes: ReservationData) => {
    setConfirmedReservation(newRes);
    setActiveTab('confirmacion');
  };

  // Handler when user clicks "Degustar en Reserva" from Menu page
  const handleSelectDishForReservation = (_dish: MenuItem) => {
    setActiveTab('reservas');
  };

  // Handler when Admin clicks "Ver Comprobante"
  const handleViewReservationFromAdmin = (res: ReservationData) => {
    setConfirmedReservation(res);
    setActiveTab('confirmacion');
  };

  const isFullAdminView = activeTab === 'admin' && isAdminLoggedIn;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar (hidden in full SB Admin mode to avoid duplicate topbars) */}
      {!isFullAdminView && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl max-w-md text-xs font-medium backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-stone-900/95 border-amber-500/40 text-amber-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Dynamic View Content */}
      <main className={`flex-1 ${isFullAdminView ? 'w-full' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8'}`}>
        
        {activeTab === 'home' && (
          <Home
            onGoToReservations={() => setActiveTab('reservas')}
            onGoToMenu={() => setActiveTab('menu')}
            onGoToAdmin={() => setActiveTab('admin')}
            tables={tables}
          />
        )}

        {activeTab === 'menu' && (
          <Menu
            onSelectDishForReservation={handleSelectDishForReservation}
            onGoToReservations={() => setActiveTab('reservas')}
          />
        )}

        {activeTab === 'reservas' && (
          <Reservations
            tables={tables}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedGuests={selectedGuests}
            setSelectedGuests={setSelectedGuests}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
            selectedTable={selectedTable}
            onCreateReservation={createReservation}
            onReservationComplete={handleReservationComplete}
          />
        )}

        {activeTab === 'confirmacion' && (
          <Confirmation
            reservation={confirmedReservation}
            onNewReservation={() => {
              setSelectedTableId(null);
              setActiveTab('reservas');
            }}
            onGoHome={() => setActiveTab('home')}
            onGoAdmin={() => setActiveTab('admin')}
          />
        )}

        {/* Admin Routing: If not logged in -> Login Screen; If logged in -> Full SB Admin Panel */}
        {activeTab === 'admin' && !isAdminLoggedIn && (
          <Login
            onLoginSuccess={() => setIsAdminLoggedIn(true)}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'admin' && isAdminLoggedIn && (
          <Admin
            reservations={reservations}
            tables={tables}
            stats={stats}
            onUpdateStatus={updateReservationStatus}
            onCancelReservation={cancelReservation}
            onResetData={resetToInitialData}
            onSelectReservationForView={handleViewReservationFromAdmin}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setActiveTab('home');
            }}
            onBackToClientSite={() => setActiveTab('home')}
          />
        )}

      </main>

      {/* Footer (hidden in full SB Admin mode) */}
      {!isFullAdminView && (
        <Footer
          setActiveTab={setActiveTab}
        />
      )}

    </div>
  );
}