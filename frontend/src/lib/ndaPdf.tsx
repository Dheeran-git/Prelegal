/**
 * PDF rendering of the Mutual NDA, built with @react-pdf/renderer.
 *
 * Uses the built-in Times family (a classic legal typeface) so the PDF needs
 * no remote font loading and produces real, selectable text. The content is
 * driven by the same `lib/nda` data model as the on-screen preview.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  ATTRIBUTION,
  confidentialityTermText,
  formatEffectiveDate,
  getStandardTerms,
  mndaTermText,
  MODIFICATIONS_NOTE,
  PLACEHOLDER,
  SIGNATURE_ROWS,
  valueOr,
  type NdaData,
  type PartyInfo,
} from "@/lib/nda";

const INK = "#211b16";
const MUTED = "#6f6353";
const FAINT = "#8a7d6a";
const OXBLOOD = "#8a2f1d";
const RULE = "#cdbfa6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    lineHeight: 1.5,
    color: INK,
  },
  eyebrow: {
    fontFamily: "Times-Roman",
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: FAINT,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 19,
    textAlign: "center",
    marginTop: 4,
  },
  headerWrap: { marginBottom: 22, alignItems: "center" },
  rule: { height: 1, backgroundColor: OXBLOOD, width: 46, marginTop: 8 },
  sectionLabel: {
    fontFamily: "Times-Bold",
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: OXBLOOD,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  section: { marginBottom: 18 },
  defRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: RULE,
  },
  defTerm: { fontFamily: "Times-Bold", width: 130, paddingRight: 8 },
  defValue: { flex: 1, color: MUTED },
  note: { fontFamily: "Times-Italic", fontSize: 8.5, color: MUTED, marginBottom: 8 },
  sigGrid: { flexDirection: "row", gap: 22 },
  sigCol: { flex: 1 },
  sigLineWrap: { marginBottom: 9 },
  sigValue: {
    minHeight: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: "#6f6353",
    paddingBottom: 2,
    fontSize: 9,
  },
  sigCaption: {
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: FAINT,
    marginTop: 2,
  },
  clause: { flexDirection: "row", marginBottom: 8 },
  clauseNum: { fontFamily: "Times-Bold", color: OXBLOOD, width: 16 },
  clauseBody: { flex: 1, textAlign: "justify" },
  clauseTitle: { fontFamily: "Times-Bold" },
  footer: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: RULE,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 7.5,
    color: FAINT,
  },
});

function DefRow({ term, value }: { term: string; value: string }) {
  return (
    <View style={styles.defRow}>
      <Text style={styles.defTerm}>{term}</Text>
      <Text style={styles.defValue}>{value}</Text>
    </View>
  );
}

function SignatureLine({ value, caption }: { value: string; caption: string }) {
  return (
    <View style={styles.sigLineWrap}>
      <Text style={styles.sigValue}>{value || " "}</Text>
      <Text style={styles.sigCaption}>{caption}</Text>
    </View>
  );
}

function SignatureColumn({
  label,
  party,
}: {
  label: string;
  party: PartyInfo;
}) {
  return (
    <View style={styles.sigCol}>
      <Text style={[styles.eyebrow, { marginBottom: 6 }]}>{label}</Text>
      {SIGNATURE_ROWS.map((row) => (
        <SignatureLine
          key={row.caption}
          value={row.field ? party[row.field] : ""}
          caption={row.caption}
        />
      ))}
    </View>
  );
}

export function NdaPdfDocument({ data }: { data: NdaData }) {
  const terms = getStandardTerms(data);

  return (
    <Document
      title="Mutual Non-Disclosure Agreement"
      author="Prelegal"
      subject="Mutual Non-Disclosure Agreement"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerWrap}>
          <Text style={styles.eyebrow}>Common Paper · Version 1.0</Text>
          <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
          <View style={styles.rule} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cover Page</Text>
          <DefRow
            term="Purpose"
            value={valueOr(data.purpose, PLACEHOLDER.purpose)}
          />
          <DefRow
            term="Effective Date"
            value={formatEffectiveDate(data.effectiveDate)}
          />
          <DefRow term="MNDA Term" value={mndaTermText(data)} />
          <DefRow
            term="Term of Confidentiality"
            value={confidentialityTermText(data)}
          />
          <DefRow
            term="Governing Law"
            value={valueOr(data.governingLaw, PLACEHOLDER.governingLaw)}
          />
          <DefRow
            term="Jurisdiction"
            value={valueOr(data.jurisdiction, PLACEHOLDER.jurisdiction)}
          />
          <DefRow
            term="MNDA Modifications"
            value={valueOr(data.modifications, "None.")}
          />
          <Text style={styles.note}>{MODIFICATIONS_NOTE}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Signatures</Text>
          <Text style={styles.note}>
            By signing this Cover Page, each party agrees to enter into this MNDA
            as of the Effective Date.
          </Text>
          <View style={styles.sigGrid}>
            <SignatureColumn label="Party 1" party={data.party1} />
            <SignatureColumn label="Party 2" party={data.party2} />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Standard Terms</Text>
          {terms.map((clause, i) => (
            <View key={clause.title} style={styles.clause} wrap={false}>
              <Text style={styles.clauseNum}>{i + 1}.</Text>
              <Text style={styles.clauseBody}>
                <Text style={styles.clauseTitle}>{clause.title}. </Text>
                {clause.body}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>{ATTRIBUTION}</Text>
      </Page>
    </Document>
  );
}
