import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: "Helvetica",
        color: "#333",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        borderBottom: "1px solid #eee",
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2563eb",
    },
    schoolInfo: {
        textAlign: "right",
    },
    section: {
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        borderBottom: "1px solid #f9f9f9",
        paddingBottom: 5,
    },
    label: {
        color: "#666",
        fontSize: 10,
        textTransform: "uppercase",
    },
    value: {
        fontWeight: "bold",
    },
    amountSection: {
        marginTop: 30,
        padding: 20,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        textAlign: "center",
    },
    amountLabel: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 5,
    },
    amountValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
    },
    footer: {
        marginTop: 50,
        textAlign: "center",
        fontSize: 9,
        color: "#94a3b8",
    },
    qrPlaceholder: {
        marginTop: 20,
        alignSelf: "center",
    }
});

interface ReceiptProps {
    transactionId: string;
    date: string;
    studentName: string;
    matricule: string;
    schoolName: string;
    amount: number;
    paymentMethod: string;
}

export const ReceiptPDF = ({
    transactionId,
    date,
    studentName,
    matricule,
    schoolName,
    amount,
    paymentMethod,
}: ReceiptProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>ScolPay</Text>
                    <Text style={{ fontSize: 10, color: "#666" }}>Reçu de Paiement Officiel</Text>
                </View>
                <View style={styles.schoolInfo}>
                    <Text style={{ fontWeight: "bold" }}>{schoolName}</Text>
                    <Text style={{ fontSize: 9 }}>Bénin / UEMOA</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ marginBottom: 15, fontSize: 11, color: "#475569", fontWeight: "bold" }}>DÉTAILS DU PAIEMENT</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>ID Transaction</Text>
                    <Text style={styles.value}>{transactionId}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{date}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Élève</Text>
                    <Text style={styles.value}>{studentName}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Matricule</Text>
                    <Text style={styles.value}>{matricule}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Méthode</Text>
                    <Text style={styles.value}>{paymentMethod}</Text>
                </View>
            </View>

            <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Montant Versé</Text>
                <Text style={styles.amountValue}>{amount.toLocaleString()} FCFA</Text>
            </View>

            <View style={styles.footer}>
                <Text>Ce document est un reçu technique délivré par ScolPay.</Text>
                <Text>Il atteste de l'enregistrement de votre transaction vers l'établissement.</Text>
                <Text style={{ marginTop: 10 }}>© 2026 ScolPay Bénin - Tous droits réservés.</Text>
            </View>
        </Page>
    </Document>
);
