import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { AuditResponse } from '../services/gemini';

// Register fonts if needed, but standard ones are usually fine for now.
// We'll use standard Helvetica.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  text: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  riskBox: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  riskCritical: { backgroundColor: '#fee2e2', borderLeft: 4, borderLeftColor: '#ef4444' },
  riskHigh: { backgroundColor: '#ffedd5', borderLeft: 4, borderLeftColor: '#f97316' },
  riskMedium: { backgroundColor: '#fef9c3', borderLeft: 4, borderLeftColor: '#eab308' },
  riskLow: { backgroundColor: '#dcfce7', borderLeft: 4, borderLeftColor: '#22c55e' },
  
  eventRow: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 5,
  },
  dateCol: {
    width: '20%',
    fontSize: 9,
    color: '#64748b',
  },
  contentCol: {
    width: '80%',
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  discrepancyBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    marginTop: 5,
    borderRadius: 4,
    borderLeft: 3,
    borderLeftColor: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
});

export const AuditPDF = ({ audit }: { audit: AuditResponse }) => {
  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return styles.riskCritical;
      case 'HIGH': return styles.riskHigh;
      case 'MEDIUM': return styles.riskMedium;
      case 'LOW': return styles.riskLow;
      default: return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LEX FORENSICA v7.0</Text>
          <Text style={styles.subtitle}>Forenzní Sémantický Audit — Oficiální Report</Text>
          <Text style={[styles.text, { marginTop: 5 }]}>ID Auditu: {audit.meta?.auditId || 'Neznámé'}</Text>
          <Text style={styles.text}>Datum: {audit.meta?.timestamp ? new Date(audit.meta.timestamp).toLocaleString() : 'Neznámé'}</Text>
          <Text style={styles.text}>Metoda: {audit.meta?.method || 'Neznámá'}</Text>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Posouzení rizik (Risk Assessment)</Text>
          <View style={[styles.riskBox, getRiskStyle(audit.riskAssessment?.overallLevel || 'MEDIUM')]}>
            <Text style={[styles.text, styles.bold]}>Úroveň rizika: {audit.riskAssessment?.overallLevel || 'MEDIUM'}</Text>
            <Text style={styles.text}>{audit.riskAssessment?.summary || 'Shrnutí není k dispozici.'}</Text>
          </View>
          <Text style={[styles.text, styles.bold]}>Primární rizikové faktory:</Text>
          {audit.riskAssessment?.primaryRiskFactors?.map((factor, i) => (
            <Text key={i} style={styles.text}>• {factor}</Text>
          ))}
        </View>

        {/* Causal Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Kauzální mapa (Causal Map)</Text>
          <Text style={[styles.text, styles.bold]}>Vrstva Minulosti (Anamnéza):</Text>
          <Text style={styles.text}>{audit.causalMap?.layer_past?.summary || 'Není k dispozici'}</Text>
          <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Vrstva Přítomnosti (Incident):</Text>
          <Text style={styles.text}>{audit.causalMap?.layer_present?.summary || 'Není k dispozici'}</Text>
          <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Kořenová Příčina (Hypotéza):</Text>
          <Text style={styles.text}>{audit.causalMap?.layer_root?.hypothesis || 'Není k dispozici'}</Text>
          <Text style={styles.text}>Mechanismus: {audit.causalMap?.layer_root?.mechanismType || 'Neznámý'} (Důvěra: {Math.round((audit.causalMap?.layer_root?.confidenceScore || 0) * 100)}%)</Text>
        </View>

        {/* Chronology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Kritická Chronologie (Chronological Scheme)</Text>
          {audit.chronology?.map((event, i) => (
            <View key={i} style={styles.eventRow}>
              <View style={styles.dateCol}>
                <Text>{event.isoDate || 'Neznámé datum'}</Text>
                <Text style={{ fontSize: 7 }}>{event.eventLayer}</Text>
              </View>
              <View style={styles.contentCol}>
                <Text style={styles.eventTitle}>{event.eventType}</Text>
                <Text style={styles.text}><Text style={styles.bold}>Záznam:</Text> {event.systemRecord?.content || 'Bez obsahu'}</Text>
                {event.subjectRecord && (
                  <Text style={styles.text}><Text style={styles.bold}>Výpověď:</Text> {event.subjectRecord?.content || 'Bez obsahu'}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Discrepancy Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Matice diskrepancí (Discrepancy Matrix)</Text>
          {audit.discrepancyMatrix?.map((d, i) => (
            <View key={i} style={styles.discrepancyBox}>
              <Text style={[styles.text, styles.bold]}>{d.discrepancyType} (Závažnost: {d.severity}/10)</Text>
              <Text style={styles.text}><Text style={styles.bold}>Systém:</Text> {d.systemVersion}</Text>
              <Text style={styles.text}><Text style={styles.bold}>Subjekt:</Text> {d.subjectVersion}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>LEX FORENSICA v7.0 — Generováno automaticky forenzním auditním enginem. Dokument slouží jako podklad pro právní obranu.</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Legal Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Právní analýza (Legal Matrix)</Text>
          {audit.legalMatrix?.map((l, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={[styles.text, styles.bold]}>{l.violationType} — {l.domain}</Text>
              <Text style={styles.text}>Články: {l.articles?.join(', ') || 'Není k dispozici'}</Text>
              <Text style={styles.text}>{l.reasoning}</Text>
              <Text style={[styles.text, { color: '#2563eb' }]}><Text style={styles.bold}>Náprava:</Text> {l.remedySuggestion}</Text>
            </View>
          ))}
        </View>

        {/* Escalation Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Plán eskalace (Escalation Plan)</Text>
          <Text style={[styles.text, styles.bold]}>Tier 0 (Okamžitá opatření):</Text>
          {audit.escalationPlan?.tierActions?.tier_0?.map((a, i) => <Text key={i} style={styles.text}>• {a}</Text>)}
          <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Tier 1 (Právní kroky):</Text>
          {audit.escalationPlan?.tierActions?.tier_1?.map((a, i) => <Text key={i} style={styles.text}>• {a}</Text>)}
          <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Tier 2 (Soudní napadení):</Text>
          {audit.escalationPlan?.tierActions?.tier_2?.map((a, i) => <Text key={i} style={styles.text}>• {a}</Text>)}
          <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Tier 3 (Mezinárodní instance):</Text>
          {audit.escalationPlan?.tierActions?.tier_3?.map((a, i) => <Text key={i} style={styles.text}>• {a}</Text>)}
        </View>

        {/* Forensic Integrity & Bias Detection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Forenzní integrita a detekce biasu</Text>
          <View style={[styles.discrepancyBox, { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' }]}>
            <Text style={[styles.text, styles.bold]}>Sémantický posun (Semantic Drift): {audit.auditIntegrity?.semanticDriftDetected ? 'DETEKVÁN' : 'NENALEZEN'}</Text>
            <Text style={styles.text}>Analýza vývoje jazyka od neutrálního k patologizujícímu/restriktivnímu.</Text>
          </View>
          
          {(audit.auditIntegrity?.epistemicCircularities?.length || 0) > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.text, styles.bold]}>Epistemické kruhy (Logické smyčky):</Text>
              {audit.auditIntegrity?.epistemicCircularities?.map((c, i) => (
                <Text key={i} style={styles.text}>• {c}</Text>
              ))}
            </View>
          )}

          {(audit.auditIntegrity?.flagsRaised?.length || 0) > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.text, styles.bold]}>Systémové vlajky (Anomálie):</Text>
              <Text style={styles.text}>{audit.auditIntegrity?.flagsRaised?.join(', ') || 'Není k dispozici'}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>LEX FORENSICA v7.0 — Strana 2 | Důvěrný forenzní materiál</Text>
        </View>
      </Page>
    </Document>
  );
};
