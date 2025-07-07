import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Reservation } from '@/types/reservation';
import { Property } from '@/types/property';
import { useLanguage } from '@shared/contexts/LanguageContext';

interface CalendarProps {
  reservations: Reservation[];
  properties: Property[];
  onDateClick?: (date: Date, dayReservations: Reservation[]) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  reservations: Reservation[];
}

const Calendar: React.FC<CalendarProps> = ({ reservations, properties, onDateClick }) => {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener el primer día del mes actual
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Obtener el último día del mes actual
  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Verificar si una fecha es hoy
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Obtener reservas para una fecha específica
  const getReservationsForDate = (date: Date): Reservation[] => {
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      return date >= checkIn && date <= checkOut;
    });
  };

  // Generar los días del calendario (incluyendo días del mes anterior y siguiente)
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    
    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Agregar días del mes anterior
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - i - 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        reservations: getReservationsForDate(date)
      });
    }

    // Agregar días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        reservations: getReservationsForDate(date)
      });
    }

    // Agregar días del mes siguiente para completar la grilla (hasta 42 días = 6 semanas)
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        reservations: getReservationsForDate(date)
      });
    }

    return days;
  }, [currentDate, reservations]);

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Manejar clic en un día
  const handleDayClick = (day: CalendarDay) => {
    if (onDateClick) {
      onDateClick(day.date, day.reservations);
    }
  };

  // Nombres de los días de la semana según el idioma
  const weekDays = language === 'es' 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Formatear el mes y año actual según el idioma
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const monthName = currentDate.toLocaleDateString(locale, { month: 'long' });
  const year = currentDate.getFullYear();
  const currentMonthYear = `${monthName} ${year}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">
          {currentMonthYear}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title={language === 'es' ? 'Mes anterior' : 'Previous month'}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title={language === 'es' ? 'Mes siguiente' : 'Next month'}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grilla del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días de la semana */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`
              p-3 min-h-[60px] border border-gray-100 cursor-pointer transition-colors relative
              ${day.isCurrentMonth 
                ? 'bg-white hover:bg-gray-50' 
                : 'bg-gray-50 text-gray-400'
              }
              ${day.isToday 
                ? 'ring-2 ring-primary-500 bg-primary-50' 
                : ''
              }
            `}
          >
            {/* Número del día */}
            <div className={`
              text-sm font-medium
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'text-primary-600' : ''}
            `}>
              {day.date.getDate()}
            </div>

            {/* Indicadores de reservas */}
            {day.reservations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {day.reservations.slice(0, 2).map((reservation, idx) => (
                  <div
                    key={reservation.id}
                    className="w-2 h-2 rounded-full bg-green-500"
                    title={language === 'es' ? 'Reserva' : 'Reservation'}
                  />
                ))}
                {day.reservations.length > 2 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{day.reservations.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>{language === 'es' ? 'Reserva' : 'Reservation'}</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 