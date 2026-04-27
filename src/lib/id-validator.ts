export type UserRole = 
  | 'student' 
  | 'staff' 
  | 'faculty' 
  | 'admin' 
  | 'maintenance' 
  | 'hostel' 
  | 'academic';

export interface UserInfo {
  id: string;
  role: UserRole;
  year?: string;
  type?: 'Masters' | 'Bachelors' | 'Doctoral';
  number?: string;
}

export const validateID = (id: string): UserInfo | null => {
  const upperId = id.toUpperCase();

  // Student: SCXXYABC
  const studentRegex = /^SC(\d{2})([MBD])(\d{3})$/;
  const studentMatch = upperId.match(studentRegex);
  if (studentMatch) {
    const [_, year, typeCode, number] = studentMatch;
    const num = parseInt(number, 10);
    if (num >= 0 && num <= 250) {
      const typeMap: Record<string, UserInfo['type']> = {
        'M': 'Masters',
        'B': 'Bachelors',
        'D': 'Doctoral'
      };
      return {
        id: upperId,
        role: 'student',
        year: `20${year}`,
        type: typeMap[typeCode],
        number
      };
    }
  }

  // Staff: STXXXXX
  if (upperId.startsWith('ST') && upperId.length === 7) {
    return { id: upperId, role: 'staff' };
  }

  // Faculty: FAXXXXX
  if (upperId.startsWith('FA') && upperId.length === 7) {
    return { id: upperId, role: 'faculty' };
  }

  // Admin: ADXXXXX
  if (upperId.startsWith('AD') && upperId.length === 7) {
    return { id: upperId, role: 'admin' };
  }

  // Maintenance: MNXXXXX
  if (upperId.startsWith('MN') && upperId.length === 7) {
    return { id: upperId, role: 'maintenance' };
  }

  // Hostel Authority: HAXXXXX
  if (upperId.startsWith('HA') && upperId.length === 7) {
    return { id: upperId, role: 'hostel' };
  }

  // Academic Authority: AAXXXXX
  if (upperId.startsWith('AA') && upperId.length === 7) {
    return { id: upperId, role: 'academic' };
  }

  return null;
};
