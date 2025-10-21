import { PARADetailView } from '@/components/para/PARADetailView'

export default function ArchiveDetailPage({ params }: { params: { id: string } }) {
  return <PARADetailView itemId={params.id} type="archive" />
}
