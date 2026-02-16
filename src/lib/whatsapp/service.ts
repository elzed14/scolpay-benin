// Service d'intégration WhatsApp pour les rappels automatiques
// Utilise l'API WhatsApp Business ou des services tiers comme Twilio

interface WhatsAppConfig {
    apiKey?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
    provider: 'twilio' | 'whatsapp_business' | 'mock';
}

interface WhatsAppMessage {
    to: string;
    template?: string;
    body?: string;
    variables?: Record<string, string>;
}

interface ReminderData {
    parentPhone: string;
    parentName: string;
    studentName: string;
    className: string;
    amountDue: number;
    dueDate?: string;
    schoolName: string;
    paymentLink?: string;
}

// Configuration par défaut (mode mock pour le développement)
const defaultConfig: WhatsAppConfig = {
    provider: 'mock'
};

class WhatsAppService {
    private config: WhatsAppConfig;

    constructor(config: WhatsAppConfig = defaultConfig) {
        this.config = config;
    }

    /**
     * Envoyer un message WhatsApp
     */
    async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
        switch (this.config.provider) {
            case 'twilio':
                return this.sendViaTwilio(message);
            case 'whatsapp_business':
                return this.sendViaWhatsAppBusiness(message);
            default:
                return this.sendMock(message);
        }
    }

    /**
     * Envoyer via Twilio
     */
    private async sendViaTwilio(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

            if (!accountSid || !authToken || !fromNumber) {
                throw new Error('Configuration Twilio manquante');
            }

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        From: `whatsapp:${fromNumber}`,
                        To: `whatsapp:${message.to}`,
                        Body: message.body || '',
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur Twilio');
            }

            const data = await response.json();
            return { success: true, messageId: data.sid };
        } catch (error) {
            console.error('Erreur Twilio:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Envoyer via WhatsApp Business API
     */
    private async sendViaWhatsAppBusiness(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const accessToken = this.config.apiKey || process.env.WHATSAPP_ACCESS_TOKEN;
            const phoneNumberId = this.config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

            if (!accessToken || !phoneNumberId) {
                throw new Error('Configuration WhatsApp Business manquante');
            }

            const response = await fetch(
                `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: message.to,
                        type: 'text',
                        text: { body: message.body },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erreur WhatsApp Business');
            }

            const data = await response.json();
            return { success: true, messageId: data.messages?.[0]?.id };
        } catch (error) {
            console.error('Erreur WhatsApp Business:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Mode mock pour le développement
     */
    private async sendMock(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
        console.log('[WhatsApp Mock] Message envoyé:', {
            to: message.to,
            body: message.body,
        });

        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Envoyer un rappel de paiement
     */
    async sendPaymentReminder(data: ReminderData): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = this.generatePaymentReminderMessage(data);
        return this.sendMessage({
            to: data.parentPhone,
            body: message,
        });
    }

    /**
     * Envoyer une confirmation de paiement
     */
    async sendPaymentConfirmation(data: {
        parentPhone: string;
        parentName: string;
        studentName: string;
        amount: number;
        transactionId: string;
        schoolName: string;
    }): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const message = `✅ *Confirmation de paiement*

Bonjour ${data.parentName},

Votre paiement a été enregistré avec succès !

📋 *Détails:*
• Élève: ${data.studentName}
• Montant: ${data.amount.toLocaleString()} FCFA
• Référence: ${data.transactionId}
• École: ${data.schoolName}

Merci pour votre confiance !

_ScolPay - Paiement scolaire simplifié_`;

        return this.sendMessage({
            to: data.parentPhone,
            body: message,
        });
    }

    /**
     * Générer le message de rappel de paiement
     */
    private generatePaymentReminderMessage(data: ReminderData): string {
        const dueDateText = data.dueDate
            ? `\n• Date limite: ${data.dueDate}`
            : '';

        const paymentLinkText = data.paymentLink
            ? `\n\n🔗 Paiement en ligne:\n${data.paymentLink}`
            : '';

        return `📢 *Rappel de frais scolaires*

Bonjour ${data.parentName},

Nous vous rappelons que des frais scolaires sont en attente de paiement.

📋 *Détails:*
• Élève: ${data.studentName}
• Classe: ${data.className}
• Montant dû: ${data.amountDue.toLocaleString()} FCFA${dueDateText}
• École: ${data.schoolName}${paymentLinkText}

Pour toute question, veuillez contacter l'administration de l'école.

_ScolPay - Rappel automatique_`;
    }

    /**
     * Envoyer un rappel en masse
     */
    async sendBulkReminders(
        reminders: ReminderData[],
        onProgress?: (current: number, total: number) => void
    ): Promise<{ success: number; failed: number; errors: string[] }> {
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (let i = 0; i < reminders.length; i++) {
            const reminder = reminders[i];
            const result = await this.sendPaymentReminder(reminder);

            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push(`${reminder.parentPhone}: ${result.error}`);
            }

            if (onProgress) {
                onProgress(i + 1, reminders.length);
            }

            // Respecter les limites de taux (1 message par seconde)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
    }
}

// Export d'une instance par défaut
export const whatsappService = new WhatsAppService();

// Export de la classe pour configuration personnalisée
export { WhatsAppService };

// Types exportés
export type { WhatsAppConfig, WhatsAppMessage, ReminderData };
