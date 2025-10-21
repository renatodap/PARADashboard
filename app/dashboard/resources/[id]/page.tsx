import { PARADetailView } from '@/components/para/PARADetailView'

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  return <PARADetailView itemId={params.id} type="resource" />
}
