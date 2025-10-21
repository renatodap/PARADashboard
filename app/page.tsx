import { redirect } from 'next/navigation'

// Root page - redirects to beta landing page
export default function HomePage() {
  redirect('/beta')
}
