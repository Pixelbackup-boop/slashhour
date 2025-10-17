export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface GroupedHours {
  days: string;
  hours: string;
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_ABBREV: { [key: string]: string } = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

/**
 * Format 24-hour time to 12-hour format with AM/PM
 */
export const formatTime12h = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Group consecutive days with same hours
 * Example: Mon-Fri: 9:00 AM - 5:00 PM
 */
export const groupBusinessHours = (hours: BusinessHours | null | undefined): GroupedHours[] => {
  if (!hours) return [];

  const groups: GroupedHours[] = [];
  let currentGroup: string[] = [];
  let currentHours = '';

  DAY_ORDER.forEach((day, index) => {
    const schedule = hours[day];
    if (!schedule) return;

    const hoursText = schedule.closed
      ? 'Closed'
      : `${formatTime12h(schedule.open)} - ${formatTime12h(schedule.close)}`;

    if (currentHours === hoursText) {
      currentGroup.push(day);
    } else {
      if (currentGroup.length > 0) {
        const daysLabel =
          currentGroup.length === 1
            ? DAY_ABBREV[currentGroup[0]]
            : `${DAY_ABBREV[currentGroup[0]]}-${DAY_ABBREV[currentGroup[currentGroup.length - 1]]}`;
        groups.push({ days: daysLabel, hours: currentHours });
      }
      currentGroup = [day];
      currentHours = hoursText;
    }

    // Last day
    if (index === DAY_ORDER.length - 1 && currentGroup.length > 0) {
      const daysLabel =
        currentGroup.length === 1
          ? DAY_ABBREV[currentGroup[0]]
          : `${DAY_ABBREV[currentGroup[0]]}-${DAY_ABBREV[currentGroup[currentGroup.length - 1]]}`;
      groups.push({ days: daysLabel, hours: currentHours });
    }
  });

  return groups;
};
