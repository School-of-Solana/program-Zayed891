import { useRoutes } from 'react-router'
import { lazy } from 'react'

const TippingFeature = lazy(() => import('@/features/tipping/tipping-feature.tsx'))

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <TippingFeature /> },
    // Account features disabled for deployment
    { path: '*', element: <TippingFeature /> },
  ])
}
