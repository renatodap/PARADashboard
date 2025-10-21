import { PARADetailView } from '@/components/para/PARADetailView'

export default function AreaDetailPage({ params }: { params: { id: string } }) {
  return <PARADetailView itemId={params.id} type="area" />
}
