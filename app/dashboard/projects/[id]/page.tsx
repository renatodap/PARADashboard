import { PARADetailView } from '@/components/para/PARADetailView'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <PARADetailView itemId={params.id} type="project" />
}
