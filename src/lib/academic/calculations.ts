/**
 * Academic Calculations Utilities
 * Handles grade calculations, averages, rankings, and appreciations
 */

export interface Grade {
    value: number;
    weight: number;
    type: string;
}

export interface SubjectGrade {
    subject_name: string;
    subject_code: string;
    coefficient: number;
    grades: Grade[];
}

export interface StudentResult {
    student_id: string;
    student_name: string;
    subject_averages: Array<{
        subject: string;
        average: number;
        coefficient: number;
    }>;
    general_average: number;
    rank?: number;
    total_students?: number;
}

/**
 * Calculate average for a single subject
 * Average = Σ(grade × weight) / Σ(weight)
 */
export function calculateSubjectAverage(grades: Grade[]): number | null {
    if (!grades || grades.length === 0) return null;

    const totalWeightedScore = grades.reduce((sum, grade) => {
        return sum + (grade.value * grade.weight);
    }, 0);

    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);

    if (totalWeight === 0) return null;

    return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
}

/**
 * Calculate general average across all subjects
 * General Average = Σ(subject_average × coefficient) / Σ(coefficient)
 */
export function calculateGeneralAverage(
    subjectAverages: Array<{ average: number | null; coefficient: number }>
): number | null {
    const validSubjects = subjectAverages.filter(s => s.average !== null);

    if (validSubjects.length === 0) return null;

    const totalWeightedScore = validSubjects.reduce((sum, subject) => {
        return sum + (subject.average! * subject.coefficient);
    }, 0);

    const totalCoefficient = validSubjects.reduce((sum, subject) => {
        return sum + subject.coefficient;
    }, 0);

    if (totalCoefficient === 0) return null;

    return Math.round((totalWeightedScore / totalCoefficient) * 100) / 100;
}

/**
 * Get appreciation based on average
 */
export function getAppreciation(average: number | null): string {
    if (average === null) return "Non évalué";

    if (average >= 18) return "Excellent";
    if (average >= 16) return "Très Bien";
    if (average >= 14) return "Bien";
    if (average >= 12) return "Assez Bien";
    if (average >= 10) return "Passable";
    if (average >= 8) return "Insuffisant";
    return "Médiocre";
}

/**
 * Calculate rank for a student among their classmates
 */
export function calculateRank(
    studentAverage: number,
    allAverages: number[]
): { rank: number; total: number } {
    // Sort averages in descending order
    const sortedAverages = [...allAverages].sort((a, b) => b - a);

    // Find the rank (1-indexed)
    const rank = sortedAverages.findIndex(avg => avg === studentAverage) + 1;

    return {
        rank,
        total: allAverages.length
    };
}

/**
 * Process all grades for a student and calculate results
 */
export function processStudentGrades(
    subjectGrades: SubjectGrade[]
): {
    subjectAverages: Array<{
        subject: string;
        code: string;
        average: number | null;
        coefficient: number;
    }>;
    generalAverage: number | null;
} {
    const subjectAverages = subjectGrades.map(sg => ({
        subject: sg.subject_name,
        code: sg.subject_code,
        average: calculateSubjectAverage(sg.grades),
        coefficient: sg.coefficient
    }));

    const generalAverage = calculateGeneralAverage(subjectAverages);

    return {
        subjectAverages,
        generalAverage
    };
}

/**
 * Format a grade for display
 */
export function formatGrade(grade: number | null): string {
    if (grade === null) return "-";
    return grade.toFixed(2);
}

/**
 * Get color class based on grade value
 */
export function getGradeColor(grade: number | null): string {
    if (grade === null) return "text-gray-400";
    if (grade >= 16) return "text-green-600";
    if (grade >= 10) return "text-blue-600";
    return "text-red-600";
}
