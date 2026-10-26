import { api } from './api';
import type { Activity } from '../types/game';

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: string;
  subject: string;
  description?: string;
  code: string;
  teacherId?: string;
  teacherName?: string;
  studentCount?: number;
  students?: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string }[];
  createdAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className?: string;
  subject?: string;
  dueDate: string;
  maxScore: number;
  submissionCount?: number;
  totalStudents?: number;
  isSubmitted?: boolean;
  myScore?: number | null;
  myFeedback?: string | null;
  mySubmissionDate?: string | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  status: 'pending' | 'graded';
}

const LOCAL_CLASSES_KEY = 'sinif_bulutu_classes';
const LOCAL_ASSIGNMENTS_KEY = 'sinif_bulutu_assignments';
const LOCAL_ACTIVITIES_KEY = 'sinif_bulutu_custom_activities';

// Clean up legacy mock data from local storage if present
try {
  const existingClasses = localStorage.getItem(LOCAL_CLASSES_KEY);
  if (existingClasses && existingClasses.includes('cls_1')) {
    localStorage.removeItem(LOCAL_CLASSES_KEY);
  }
  const existingAssignments = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
  if (existingAssignments && existingAssignments.includes('asg_1')) {
    localStorage.removeItem(LOCAL_ASSIGNMENTS_KEY);
  }
  const existingActivities = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
  if (existingActivities && (existingActivities.includes('act_1') || existingActivities.includes('act_2'))) {
    try {
      const parsed: any[] = JSON.parse(existingActivities);
      const userOnly = parsed.filter((a) => a.id && a.id.startsWith('act_custom_'));
      localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(userOnly));
    } catch {
      localStorage.removeItem(LOCAL_ACTIVITIES_KEY);
    }
  }
} catch {
  // Ignore
}

export const dashboardService = {
  // --- CLASSES ---
  async getClasses(): Promise<ClassRoom[]> {
    try {
      const res = await api.get('/classes');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // Fallback to local storage
    }

    const saved = localStorage.getItem(LOCAL_CLASSES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Continue
      }
    }
    return [];
  },

  async createClass(payload: { name: string; gradeLevel: string; subject: string; description?: string }): Promise<ClassRoom> {
    const code = `${payload.subject.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    const newClass: ClassRoom = {
      id: `cls_${Date.now()}`,
      name: payload.name,
      gradeLevel: payload.gradeLevel,
      subject: payload.subject,
      description: payload.description || '',
      code,
      studentCount: 0,
      students: [],
    };

    try {
      const res = await api.post('/classes', {
        name: payload.name,
        gradeLevel: payload.gradeLevel,
        subject: payload.subject,
        description: payload.description,
      });
      const data = res.data?.data || res.data;
      if (data && data.id) {
        newClass.id = data.id;
        newClass.code = data.code || code;
      }
    } catch {
      // Fallback
    }

    const current = await this.getClasses();
    const updated = [newClass, ...current];
    localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(updated));
    return newClass;
  },

  async joinClass(code: string): Promise<ClassRoom> {
    const cleanCode = code.trim().toUpperCase();

    try {
      const res = await api.post('/classes/join', { code: cleanCode });
      const data = res.data?.data || res.data;
      if (data) {
        return data;
      }
    } catch {
      // Fallback
    }

    const classes = await this.getClasses();
    const found = classes.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      // Create a virtual enrolled class
      const joinedClass: ClassRoom = {
        id: `cls_joined_${Date.now()}`,
        name: `${cleanCode} Sınıfı`,
        gradeLevel: '5. Sınıf',
        subject: 'Genel Dersler',
        description: 'Sınıf Bulutu dijital ders alanı.',
        code: cleanCode,
        teacherName: 'Ders Öğretmeni',
        studentCount: 15,
      };
      const updated = [joinedClass, ...classes];
      localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(updated));
      return joinedClass;
    }
    return found;
  },

  // --- ASSIGNMENTS ---
  async getAssignments(): Promise<Assignment[]> {
    try {
      const res = await api.get('/assignments');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Continue
      }
    }
    return [];
  },

  async createAssignment(payload: {
    title: string;
    description: string;
    classId: string;
    dueDate: string;
    maxScore?: number;
  }): Promise<Assignment> {
    const classes = await this.getClasses();
    const targetClass = classes.find((c) => c.id === payload.classId);

    const newAssignment: Assignment = {
      id: `asg_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      classId: payload.classId,
      className: targetClass?.name || 'Sınıf',
      subject: targetClass?.subject || 'Ders',
      dueDate: payload.dueDate,
      maxScore: payload.maxScore || 100,
      submissionCount: 0,
      totalStudents: targetClass?.studentCount || 20,
    };

    try {
      const res = await api.post('/assignments', payload);
      const data = res.data?.data || res.data;
      if (data && data.id) {
        newAssignment.id = data.id;
      }
    } catch {
      // Fallback
    }

    const current = await this.getAssignments();
    const updated = [newAssignment, ...current];
    localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(updated));
    return newAssignment;
  },

  async submitAssignment(payload: {
    assignmentId: string;
    content: string;
  }): Promise<Assignment> {
    const current = await this.getAssignments();
    const updated = current.map((asg) => {
      if (asg.id === payload.assignmentId) {
        return {
          ...asg,
          isSubmitted: true,
          submissionCount: (asg.submissionCount || 0) + 1,
          mySubmissionDate: new Date().toISOString().split('T')[0],
          myScore: null,
          myFeedback: 'Ödeviniz başarıyla iletildi. Öğretmeniniz değerlendirdikten sonra notunuz buraya yansıyacaktır.',
        };
      }
      return asg;
    });

    localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(updated));
    return updated.find((a) => a.id === payload.assignmentId)!;
  },

  // --- ACTIVITIES & CUSTOM TEMPLATES ---
  async getActivities(): Promise<Activity[]> {
    try {
      const res = await api.get('/activities');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        const saved = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
        const localList: Activity[] = saved ? JSON.parse(saved) : [];

        const map = new Map<string, Activity>();
        // Add backend activities belonging to this teacher/student
        data.forEach((item: any) => {
          map.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description,
            templateType: item.templateType,
            subject: item.subject || 'Genel',
            gradeLevel: item.gradeLevel || '5. Sınıf',
            items: item.items || [],
            playCount: item.playCount || 0,
            timeLimitSeconds: item.timeLimitSeconds,
            maxScore: item.maxScore,
          });
        });

        // Add locally saved activities created by user
        localList.forEach((item: Activity) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        return Array.from(map.values());
      }
    } catch {
      // Local fallback
    }

    const saved = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        if (Array.isArray(custom)) {
          return custom;
        }
      } catch {
        // Continue
      }
    }
    return [];
  },

  async saveCustomActivity(activity: Activity): Promise<Activity> {
    const activityWithMeta: Activity = {
      ...activity,
      id: activity.id || `act_custom_${Date.now()}`,
      playCount: activity.playCount || 1,
    };

    try {
      await api.post('/activities', {
        title: activityWithMeta.title,
        description: activityWithMeta.description,
        templateType: activityWithMeta.templateType,
        subject: activityWithMeta.subject,
        gradeLevel: activityWithMeta.gradeLevel,
        items: activityWithMeta.items,
      });
    } catch {
      // Local fallback
    }

    const saved = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    let customList: Activity[] = [];
    if (saved) {
      try {
        customList = JSON.parse(saved);
      } catch {
        customList = [];
      }
    }

    // Upsert
    const existingIdx = customList.findIndex((a) => a.id === activityWithMeta.id);
    if (existingIdx >= 0) {
      customList[existingIdx] = activityWithMeta;
    } else {
      customList = [activityWithMeta, ...customList];
    }

    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(customList));
    return activityWithMeta;
  },

  async saveActivity(activity: Activity): Promise<Activity> {
    return this.saveCustomActivity(activity);
  },

  async deleteActivity(activityId: string): Promise<void> {
    try {
      await api.delete(`/activities/${activityId}`);
    } catch {
      // Local fallback
    }

    const saved = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    if (saved) {
      try {
        const customList: Activity[] = JSON.parse(saved);
        const filtered = customList.filter((a) => a.id !== activityId);
        localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(filtered));
      } catch {
        // Continue
      }
    }
  },
};
