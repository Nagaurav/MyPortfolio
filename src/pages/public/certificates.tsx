import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Eye, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageHero } from '../../components/ui/page-hero';
import { Modal } from '../../components/ui/modal';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url?: string | null;
  certificate_url?: string | null;
};

export function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Certificate | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('issue_date', { ascending: false });
        if (error) throw error;
        setCertificates((data || []) as Certificate[]);
      } catch (e) {
        console.error('certs fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Credentials"
        title="Certifications &"
        highlight="learning."
        subtitle="A snapshot of the certifications I've earned and the courses I've completed along the way."
        size="sm"
      />

      <div className="container-page pb-24">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface h-80 animate-pulse" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
              <Award size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
              No certifications yet
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              Earned certifications will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
              >
                <CertCard cert={c} onPreview={() => setSelected(c)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
      >
        {selected && (
          <div className="space-y-5">
            {selected.certificate_url && (
              <div className="overflow-hidden rounded-xl border border-secondary-200 dark:border-secondary-800">
                <img
                  src={selected.certificate_url}
                  alt={selected.title}
                  className="w-full max-h-[70vh] object-contain bg-secondary-50 dark:bg-secondary-900"
                />
              </div>
            )}
            <div className="surface-muted p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  Issuer
                </div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100 mt-0.5">
                  {selected.issuer}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  Issued
                </div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100 mt-0.5">
                  {new Date(selected.issue_date).toLocaleDateString()}
                </div>
              </div>
              {selected.expiry_date && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                    Expires
                  </div>
                  <div className="font-medium text-secondary-900 dark:text-secondary-100 mt-0.5">
                    {new Date(selected.expiry_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            {selected.credential_url && (
              <a
                href={selected.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 h-11 rounded-lg bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:brightness-110"
              >
                Verify credential
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function CertCard({ cert, onPreview }: { cert: Certificate; onPreview: () => void }) {
  return (
    <div className="surface overflow-hidden p-0 flex flex-col h-full">
      <button
        type="button"
        onClick={onPreview}
        className="group relative aspect-[5/3] overflow-hidden bg-secondary-100 dark:bg-secondary-900"
      >
        {cert.certificate_url ? (
          <>
            <img
              src={cert.certificate_url}
              alt={cert.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-secondary-900/95 backdrop-blur text-sm font-semibold text-secondary-900 dark:text-white shadow-md">
                <Eye size={14} /> Preview
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-500/15 to-accent-500/15">
            <Award className="h-10 w-10 text-brand-500/70" />
          </div>
        )}
      </button>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-secondary-900 dark:text-white line-clamp-2">
          {cert.title}
        </h3>
        <div className="mt-1.5 text-sm text-secondary-600 dark:text-secondary-400">
          Issued by <span className="text-secondary-900 dark:text-secondary-100 font-medium">{cert.issuer}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-secondary-500 dark:text-secondary-400">
          <Calendar size={12} />
          {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          {cert.expiry_date && (
            <>
              <span className="text-secondary-300 dark:text-secondary-700">→</span>
              {new Date(cert.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          {cert.credential_url && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
            >
              Verify
              <ExternalLink size={13} />
            </a>
          )}
          {cert.certificate_url && (
            <button
              type="button"
              onClick={onPreview}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white"
            >
              <Eye size={13} /> Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
