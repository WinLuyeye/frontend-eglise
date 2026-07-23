// app/(dashboard)/chef-departement/rapports/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function RapportDetailPage() {
  const params = useParams();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRapport = async () => {
      try {
        const response = await fetch(`/api/rapports/${params.id}`);
        const data = await response.json();
        setRapport(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRapport();
    }
  }, [params.id]);

  if (loading) return <div>Chargement...</div>;
  if (!rapport) return <div>Rapport non trouvé</div>;

  return (
    <div>
      <h1>Détail du rapport</h1>
      {/* Afficher les détails du rapport ici */}
    </div>
  );
}