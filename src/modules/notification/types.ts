/**
 * Types partagés du module Notification (M6).
 *
 * <p>Définit les contrats d'échange avec l'API pour les notifications
 * in_app et SMS avec bascule automatique en zone sans data.</p>
 */

export interface NotificationItem {
  id: string;
  templateId: string | null;
  canal: string;
  contenuFinal: string;
  statut: string;
  dateEnvoi: string | null;
  dateLecture: string | null;
}
