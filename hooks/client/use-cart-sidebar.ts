import { usePathname } from 'next/navigation'
import useDeviceType from './use-device-type'
import useCartStore from '../stores/use-cart-store'

//Check this code again for locale update to final code
const isNotInPaths = (s: string) => {
    return !new RegExp(`^(?:/(?:en|fr|es|de))?(?:/$|/cart$|/checkout$|/sign-in$|/sign-up$|/order(?:/.*)?$|/account(?:/.*)?$|/admin(?:/.*)?$)?$`).test(s)
  }

function useCartSidebar() {
  const {
    cart: { items },
  } = useCartStore()
  const deviceType = useDeviceType()
  const currentPath = usePathname()

  return (
    items.length > 0 && deviceType === 'desktop' && isNotInPaths(currentPath)
  )
}

export default useCartSidebar