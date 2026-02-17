import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import BulletinPDF from "@/components/academic/BulletinPDF";
import {
    calculateSubjectAverage,
    calculateGeneralAverage,
    getAppreciation,
    calculateRank
} from "@/lib/academic/calculations";

export async function GET(
    request: Request,
    { params }: { params: { studentId: string; termId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { studentId, termId } = params;

        // 1. Verify parent has access to this student
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("id, first_name, last_name, matricule, class_name, school_id, parent_email")
            .eq("id", studentId)
            .single();

        if (studentError || !student) {
            return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
        }

        // Check if parent owns this student
        if (user.user_metadata.role === 'parent' && student.parent_email !== user.email) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // 2. Get school info
        const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", student.school_id)
            .single();

        // 3. Get term info
        const { data: term } = await supabase
            .from("terms")
            .select("name, start_date")
            .eq("id", termId)
            .single();

        if (!term) {
            return NextResponse.json({ error: "Trimestre non trouvé" }, { status: 404 });
        }

        // 4. Get all grades for this student and term
        const { data: grades, error: gradesError } = await supabase
            .from("grades")
            .select(`
                id,
                value,
                weight,
                type,
                subjects (id, name, code),
                class_subjects!inner (coefficient)
            `)
            .eq("student_id", studentId)
            .eq("term_id", termId);

        if (gradesError) {
            console.error("Error fetching grades:", gradesError);
            return NextResponse.json({ error: "Erreur lors de la récupération des notes" }, { status: 500 });
        }

        // 5. Group grades by subject and calculate averages
        const subjectMap = new Map();

        grades?.forEach(grade => {
            const subjectId = grade.subjects.id;
            if (!subjectMap.has(subjectId)) {
                subjectMap.set(subjectId, {
                    name: grade.subjects.name,
                    code: grade.subjects.code,
                    coefficient: grade.class_subjects.coefficient,
                    grades: []
                });
            }
            subjectMap.get(subjectId).grades.push({
                value: grade.value,
                weight: grade.weight,
                type: grade.type
            });
        });

        // Calculate subject averages
        const subjects = Array.from(subjectMap.values()).map(subject => {
            const average = calculateSubjectAverage(subject.grades);
            const gradesStr = subject.grades.map((g: { value: number }) => g.value).join(', ');

            return {
                name: subject.name,
                code: subject.code,
                coefficient: subject.coefficient,
                grades: gradesStr,
                average
            };
        });

        // Calculate general average
        const generalAverage = calculateGeneralAverage(
            subjects.map(s => ({ average: s.average, coefficient: s.coefficient }))
        );

        // 6. Get class averages for ranking (optional)
        const { data: classGrades } = await supabase
            .from("grades")
            .select(`
                student_id,
                value,
                weight,
                subjects (id),
                class_subjects!inner (coefficient)
            `)
            .eq("term_id", termId)
            .in("student_id",
                (await supabase
                    .from("students")
                    .select("id")
                    .eq("class_name", student.class_name)
                    .eq("school_id", student.school_id)
                ).data?.map(s => s.id) || []
            );

        // Calculate all students' averages for ranking
        const studentAverages = new Map<string, number>();
        classGrades?.forEach(grade => {
            const sid = grade.student_id;
            if (!studentAverages.has(sid)) {
                studentAverages.set(sid, 0);
            }
        });

        // Simplified ranking calculation
        let rank: number | undefined;
        let totalStudents: number | undefined;

        if (generalAverage !== null && classGrades && classGrades.length > 0) {
            // Group by student and calculate their averages
            const studentGradeMap = new Map();
            classGrades.forEach(g => {
                if (!studentGradeMap.has(g.student_id)) {
                    studentGradeMap.set(g.student_id, new Map());
                }
                const subjectId = g.subjects.id;
                if (!studentGradeMap.get(g.student_id).has(subjectId)) {
                    studentGradeMap.get(g.student_id).set(subjectId, {
                        grades: [],
                        coefficient: g.class_subjects.coefficient
                    });
                }
                studentGradeMap.get(g.student_id).get(subjectId).grades.push({
                    value: g.value,
                    weight: g.weight
                });
            });

            const allAverages: number[] = [];
            studentGradeMap.forEach((subjects) => {
                const subjectAvgs: Array<{ average: number | null; coefficient: number }> = [];
                subjects.forEach((data: { grades: Array<{ value: number; weight: number }>; coefficient: number }) => {
                    const avg = calculateSubjectAverage(data.grades);
                    if (avg !== null) {
                        subjectAvgs.push({ average: avg, coefficient: data.coefficient });
                    }
                });
                const genAvg = calculateGeneralAverage(subjectAvgs);
                if (genAvg !== null) {
                    allAverages.push(genAvg);
                }
            });

            if (allAverages.length > 0) {
                const rankData = calculateRank(generalAverage, allAverages);
                rank = rankData.rank;
                totalStudents = rankData.total;
            }
        }

        // 7. Generate PDF
        const appreciation = getAppreciation(generalAverage);
        const academicYear = new Date(term.start_date).getFullYear() + "-" + (new Date(term.start_date).getFullYear() + 1);

        const pdfDoc = BulletinPDF({
            schoolName: school?.name || "École",
            studentName: `${student.first_name} ${student.last_name}`,
            studentMatricule: student.matricule,
            className: student.class_name,
            termName: term.name,
            academicYear,
            subjects,
            generalAverage,
            rank,
            totalStudents,
            appreciation
        });

        const pdfBuffer = await renderToBuffer(pdfDoc);

        // 8. Return PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="bulletin_${student.matricule}_${term.name}.pdf"`
            }
        });

    } catch (error) {
        console.error("Error generating bulletin:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du bulletin" }, { status: 500 });
    }
}
