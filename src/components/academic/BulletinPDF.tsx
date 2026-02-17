import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
    },
    schoolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    studentInfo: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        width: 100,
    },
    value: {
        flex: 1,
    },
    table: {
        marginTop: 10,
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2563eb',
        color: 'white',
        padding: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomColor: '#e5e7eb',
        padding: 8,
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderBottom: 1,
        borderBottomColor: '#e5e7eb',
        padding: 8,
    },
    col1: { width: '35%' },
    col2: { width: '10%', textAlign: 'center' },
    col3: { width: '30%', textAlign: 'center' },
    col4: { width: '25%', textAlign: 'center', fontWeight: 'bold' },
    summary: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#eff6ff',
        borderRadius: 4,
        border: 1,
        borderColor: '#2563eb',
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    summaryLabel: {
        fontWeight: 'bold',
        width: 150,
        fontSize: 11,
    },
    summaryValue: {
        flex: 1,
        fontSize: 11,
    },
    footer: {
        marginTop: 30,
        paddingTop: 15,
        borderTop: 1,
        borderTopColor: '#d1d5db',
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'center',
    },
    appreciation: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#059669',
    },
});

interface BulletinPDFProps {
    schoolName: string;
    studentName: string;
    studentMatricule: string;
    className: string;
    termName: string;
    academicYear: string;
    subjects: Array<{
        name: string;
        code: string;
        coefficient: number;
        grades: string; // "15, 18, 16"
        average: number | null;
    }>;
    generalAverage: number | null;
    rank?: number;
    totalStudents?: number;
    appreciation: string;
}

export const BulletinPDF: React.FC<BulletinPDFProps> = ({
    schoolName,
    studentName,
    studentMatricule,
    className,
    termName,
    academicYear,
    subjects,
    generalAverage,
    rank,
    totalStudents,
    appreciation,
}) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.schoolName}>{schoolName}</Text>
                <Text>République du Bénin</Text>
                <Text>Année Scolaire : {academicYear}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>BULLETIN DE NOTES - {termName.toUpperCase()}</Text>

            {/* Student Information */}
            <View style={styles.studentInfo}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Nom et Prénom :</Text>
                    <Text style={styles.value}>{studentName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Matricule :</Text>
                    <Text style={styles.value}>{studentMatricule}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Classe :</Text>
                    <Text style={styles.value}>{className}</Text>
                </View>
            </View>

            {/* Grades Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Matière</Text>
                    <Text style={styles.col2}>Coef.</Text>
                    <Text style={styles.col3}>Notes</Text>
                    <Text style={styles.col4}>Moyenne</Text>
                </View>

                {subjects.map((subject, index) => (
                    <View key={subject.code} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                        <Text style={styles.col1}>{subject.name}</Text>
                        <Text style={styles.col2}>{subject.coefficient}</Text>
                        <Text style={styles.col3}>{subject.grades || '-'}</Text>
                        <Text style={styles.col4}>
                            {subject.average !== null ? subject.average.toFixed(2) : '-'}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Moyenne Générale :</Text>
                    <Text style={styles.summaryValue}>
                        {generalAverage !== null ? `${generalAverage.toFixed(2)} / 20` : 'Non calculée'}
                    </Text>
                </View>
                {rank && totalStudents && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Rang :</Text>
                        <Text style={styles.summaryValue}>
                            {rank}ème sur {totalStudents} élèves
                        </Text>
                    </View>
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Appréciation :</Text>
                    <Text style={[styles.summaryValue, styles.appreciation]}>{appreciation}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Bulletin généré par ScolPay Bénin - {new Date().toLocaleDateString('fr-FR')}</Text>
            </View>
        </Page>
    </Document>
);

export default BulletinPDF;
