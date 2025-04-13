import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a date string or Date object to a human-readable distance string (e.g., "hace 5 minutos")
 */
export const formatDateDistance = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObject, new Date(), { 
    addSuffix: true, 
    locale: es 
  });
};

/**
 * Format a date string or Date object to a standard date format (e.g., "01/01/2023")
 */
export const formatStandardDate = (date: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObject, pattern, { locale: es });
};

/**
 * Format a date string or Date object to a date and time format (e.g., "01/01/2023 14:30")
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObject, 'dd/MM/yyyy HH:mm', { locale: es });
};

/**
 * Format a date string or Date object to a relative format (e.g., "ayer, 14:30", "hoy, 09:15")
 */
export const formatRelativeDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObject, new Date(), { locale: es });
};

/**
 * Get day of the week in spanish (e.g., "lunes", "martes")
 */
export const getDayOfWeek = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObject, 'EEEE', { locale: es });
};

/**
 * Get month name in spanish (e.g., "enero", "febrero")
 */
export const getMonthName = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObject, 'MMMM', { locale: es });
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return dateObject < new Date();
};

/**
 * Check if a date is in the future
 */
export const isDateInFuture = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  return dateObject > new Date();
};

/**
 * Check if a date is today
 */
export const isDateToday = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObject = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return dateObject.getDate() === today.getDate() &&
    dateObject.getMonth() === today.getMonth() &&
    dateObject.getFullYear() === today.getFullYear();
};

/**
 * Get number of days between two dates
 */
export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
