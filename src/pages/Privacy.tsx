import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";

export default function PrivacyPage() {
  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl prose prose-sm text-muted-foreground">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-4">Last updated: March 1, 2026</p>
          <p>Poser collects video clips and usage data to provide ski technique analysis. We do not sell your data to third parties.</p>
          <h2 className="text-foreground">Data We Collect</h2>
          <ul>
            <li>Account information (email, name)</li>
            <li>Video clips uploaded for analysis</li>
            
          </ul>
          <h2 className="text-foreground">How We Use Your Data</h2>
          <p>We use your data solely to provide and improve our analysis service. Videos are processed and stored securely.</p>
          {/* TODO_BACKEND_HOOKUP: Add full legal privacy policy */}
        </div>
      </Section>
    </Layout>
  );
}
